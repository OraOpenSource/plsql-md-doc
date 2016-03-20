// This is the custom package for PLSQL to MD
var
  debug,
  extend,
  path = require('path'),
  dox = require('./dox.js')
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

  debug.log('\nProcessing:', file.path);

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
        isPrivate: jsonData.isPrivate,
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

    if (jsonData.ignore) {
      debug.log('Ignoring:', jsonData.ctx)
      return; // Skip this loop since ignoring
    }

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
        case 'ignore':
          debug.log('TODO Ignore: ', ignore);
          break;
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
        entity.types[i].isPrivate = entity.isPrivate;

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
        entity.constants[i].isPrivate = entity.isPrivate;

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


/**
 * Generates the data based on the files
 *
 * @param config Config JSON
 * @return objs array
 */
pmd.generateData = function(config){
  var objs = [];

  config.folders.forEach(function(folder){
    var
      files = fs.readdirSync(path.resolve(folder.source.path)),
      template = Handlebars.compile(folder.templateContent)
    ;

    // Create and wipe debug folder
    if (config.debug){
      // Will create (if not exists) and wipe
      fs.emptyDirSync(path.resolve(__dirname,'debug'));
    }//config.debug

    for (var i in files){
      var
        file = {
          ext: '',
          name: '',
          path: ''
        },
        data = {
          name:'',
          types: [],
          constants: [],
          methods: []
        },
        markdown,
        entities,
        skipFile = false //Skips the current file if no JavaDoc detected
      ;


      if (1==2 ||
        (folder.source.fileFilterRegexp instanceof RegExp && folder.source.fileFilterRegexp.test(files[i])) ||
        !folder.source.fileFilterRegexp instanceof RegExp){

        file.ext = path.extname(files[i]);
        file.name = path.basename(files[i], file.ext);
        file.path = path.resolve(folder.source.path, files[i]);

        data.name = file.name;
        entities = pmd.processFile(file, debug);

        // Load the data arrays with appropriate fields
        entities.forEach(function(entity){
          switch(entity.type){
            case pmd.DOCTYPES.DATATYPES:
              data.types = entity.types;
              break;
            case pmd.DOCTYPES.FUNCTION:
            case pmd.DOCTYPES.PROCEDURE:
              data.methods.push(entity);
              break;
            case pmd.DOCTYPES.CONSTANTS:
              data.constants = entity.constants;
              break;
            case undefined:
              debug.log('\nFile:', files[i], "doesn't appear to have any JavaDoc in it. Skipping");
              skipFile = true;
              break;
            default:
              debug.log('entity', entity);
              console.log('Unknown type: ', entity.type);
              process.exit();
              break;
          }//switch
        });//entities.forEach

        if (skipFile){
          continue; // Skip this loop iteration
        }

        // Output JSON and md data
        if (config.debug){
          debug.logFile(file.name + file.ext + '.json', JSON.stringify(data, null, '  '));
        }

        objs.push(
          {
            fileData: data,
            template: template,
            folder: folder
          }
        );
      }//if regexp pass or no regexp
    }// for i in files

  }); //config.folders.forEach

  return objs;
}//pmd.generateData


/**
 * Merge files (based on duplicate file names). Ex pks and pkb
 * Order is arbitrary
 *
 * @param objs Array of all the objects
 * @return Merged array
 */
pmd.mergeObjs = function(objs){
  objs.forEach(function(obj, i){
    //Seach for a matching element
    var
      data = obj.fileData,
      relatedData // Holds any
    ;

    // Loop over array but starting at next element
    for (var j = i+1; j < objs.length; j++){
      if (objs[j].fileData.name === data.name) {
        debug.log('Found matching entity:', objs[j].fileData.name);
        relatedData = objs[j].fileData;
        // Drop this entity as we'll merge it
        objs.splice(j, 1);
        break;
      }// if
    }

    // Merge data
    if (relatedData){
      data.constants = data.constants.concat(relatedData.constants);
      data.types = data.types.concat(relatedData.types);

      data.methods.forEach(function(myData){
        relatedData.methods.forEach(function(myRelatedElement, j){
          if (myData.name === myRelatedElement.name) {
            debug.log('Deleting common method:', myData.name);
            delete relatedData.methods[j];
          }
        });
      })// data.forEach

      //Merge methods
      // Tried to use:
      // data.methods = extend(true, {}, data.methods, relatedData.methods);
      // But was merging them based on array position rather than merge
      // Do a custom merge
      relatedData.methods.forEach(function(method){
        data.methods.push(method);
      });

    }// relatedData

    objs[i].fileData = data;
  }); //objs.forEach

  return objs;
}// pmd.mergeObjs


/**
 * Saves data to files
 *
 * @param objs array of all data
 */
pmd.saveToFile = function(objs){
  // Finally print out data
  objs.forEach(function(obj){

    var markdown = obj.template(obj.fileData);

    if (debug.debug){
      debug.logFile(obj.fileData.name + '.md', markdown);
    }
    fs.writeFileSync(path.resolve(obj.folder.output.path,obj.fileData.name + '.md'), markdown);
  });
}//saveToFile


/**
 * Generates Table of Conents (TOC)
 *
 * @issue 12: Original issue
 *
 * @params config
 * @params objs array of objs
 */
pmd.generateToc = function(config, objs){
  // #12 Generate Index file.
  if (config.toc.template){
    debug.log('\nCreated TOC');
    var
      indexData = {
        files: [],
        projectName: config.projectName
      },
      template,
      templateContent,
      markdown
    ;

    objs.forEach(function(obj){
      var file = {};

      file.fileName = obj.fileData.name + '.md';
      file.name = obj.fileData.name;

      indexData.files.push(file);
    })//objs.forEach

    // Sort based on names
    // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
    indexData.files.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    });

    templateContent = fs.readFileSync(path.resolve(config.toc.template),'utf8'),
    template = Handlebars.compile(templateContent);
    markdown = template(indexData);

    fs.writeFileSync(path.resolve(config.folders[0].output.path, config.toc.fileName), markdown);
  }//config.templates.index
}// generateToc


module.exports = function(pDebug, pExtend){
  debug = pDebug;
  extend = pExtend;
  return pmd;
}
