// This is the custom package for PLSQL to MD
var
  path = require('path')
;

var pmd = {};


// Constants
pmd.DOCTYPES = {
  FUNCTION: "function",
  PROCEDURE: "procedure",
  //Note: For constants or dataTypes to be triggered @constants or @types needs to be include
  CONSTANTS : "constants",
  DATATYPES: "types"
};

/**
 * Handles consistent error handling
 * Process will exit calling this functions
 *
 * @param msg Message to log
 * @param includeError optional - Prefix the logged message with "Error: "
 */
pmd.raiseError = function(msg, includeError){
  includeError = includeError == null ? true : includeError;
  console.error((includeError ? 'Error: ' : '') + msg);
  process.exit();
}//raiseError


/**
 * Verify that path exists. If not, an error will be raised
 *
 * @param fullPath
 * @param objName If fullPath doesn't exists, objName will be used in error message
 */
pmd.validatePathRef = function(fullPath, objName){
  if (fullPath.length == 0){
    pmd.raiseError('All ' + objName + ' must have a fully qualified path');
  }
  else if (!fs.existsSync(path.resolve(fullPath))){
    pmd.raiseError(objName + ': ' + fullPath + ' does not exist');
  }
}// validatePathRef


/**
 * Processes a PL/SQL file to extract the JavaDoc contents
 *
 * @param file object {path} is required
 * @return JSON object with the JavaDoc entites
 */
pmd.processFile = function(file){
  var
    content = {}
  ;

  content.data = fs.readFileSync(file.path,'utf8'),
  content.json = dox.parseComments(content.data);
  content.entities = []; //Holds list of entities for the object

  content.json.forEach(function(jsonData){
    var
      entity = {
        author:'',
        constants: [], // For package constants (used by @constant)
        created:'',
        example:'',
        return:'',
        description:'',
        params:[],
        // typeDesc:[], // TODO mdsouza: better name for this
        code: '',
        issues: [],
        name: '',
        type: jsonData.ctx.type,
        types: [] // For package types (used by @type)
      },
      tagConstants = [], //temp array for tag with the name of @constant
      tagTypes = [] //temp array for tag with the name of @type
  ;

    jsonData.tags.forEach(function(tag){
      switch (tag.type) {
        case 'author':
          entity.author = tag.string;
          break;
        case 'created':
          entity.created = tag.string;
          break;
        case 'example':
          entity.example = tag.string;
          break;
        // Future: Devnotes
        // case 'devnotes':
        //   myMethod.devNotes = tag.string;
        //   break;
        case 'issue':
          //This will parse the current issue to be <issue reference> | <issue description>
          /^\s*([\S]+)\s*(.*)/.exec(tag.string);

          entity.issues.push({
            number: RegExp.$1.replace(/^#+/,''), //Remove any leading hashes to get the ticket number
            description: RegExp.$2
          })
          break;
        case 'param':
          entity.params.push({
            name: tag.name,
            description: tag.description.replace(/(^<p>|<\/p>$)/g, ''),
            optional: tag.optional
          });
          break;
        case 'return':
          entity.return = tag.string;
          break;
        case 'constant':
        case 'type':
          //This will parse the current issue to be <issue reference> | <issue description>
          /^\s*([\S]+)\s*(.*)/.exec(tag.string);
          var tempData = {
            name: RegExp.$1,
            description: RegExp.$2
          }
          if (tag.type === 'type'){tagTypes.push(tempData);}
          else if (tag.type === 'constant') {tagConstants.push(tempData);}
          break;
      }//switch
    })// jsonData.tags.forEach

    entity.description = jsonData.description ? jsonData.description : '';
    entity.code = jsonData.code ? jsonData.code : '';


    if (entity.code && entity.type === pmd.DOCTYPES.DATATYPES){

      entity.types = jsonData.ctx.types;
      // Loop over tags to see if there's one for this typeName
      for (var i in entity.types){
        tagTypes.forEach(function(tagType){
          if (entity.types[i].name === tagType.name){
            entity.types[i].description = tagType.description
          }
        });//tagTypes.forEach
      }//i in entity.types

    }//entity.code && entity.type === pmd.DOCTYPES.DATATYPES

    if (entity.code && entity.type === pmd.DOCTYPES.CONSTANTS){

      entity.constants = jsonData.ctx.constants;
      // Loop over constants to see if there's one for this constantName
      for (var i in entity.constants){
        tagConstants.forEach(function(constantType){
          if (entity.constants[i].name === constantType.name){
            entity.constants[i].description = constantType.description
          }
        });//tagConstants.forEach
      }//i in entity.types
    }//entity.code && entity.type === pmd.DOCTYPES.CONSTANTS


    if (entity.code && (entity.type === pmd.DOCTYPES.FUNCTION || entity.type === pmd.DOCTYPES.PROCEDURE)){

      entity.name = jsonData.ctx.name;
      // TODO mdsouza: cleanup?
      // entity.name = entity.code.match(/^\s*(procedure|function){1}\s+\w+/ig)[0];
      // entity.name = entity.name.replace(/^\s*(procedure|function){1}/ig, "").trim();

      entity.header = jsonData.ctx.header;

    }//entity.docType === docTypes.method

    content.entities.push(entity);
  }); // content.json.forEach


  return content.entities;
}// processFile


/**
 * Returns the arguments JSON objects
 * Handles validation that all arguments are passed in
 *
 * @param process process object from calling function
 * @return arguments JSON object
 */
pmd.getArguments = function(process){
  var
    args = process.argv.slice(2), // Array of arguments
    arguments = {
      project :  args[0]
    }
  ;

  // Validation and Data Load
  if (args.length === 0){
    pmd.raiseError('To run call: node app <project>', false);
  }
  // Check that config file exists
  if (!fs.existsSync(path.resolve(__dirname + '/../','config.json'))){
    pmd.raiseError('config.json must be present. TODO run generateConfig.js to generate default');
  }

  return arguments;
}//getArguments


module.exports = pmd;
