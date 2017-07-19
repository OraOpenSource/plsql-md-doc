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
  CURSOR: "cursor",
  //Note: For constants or dataTypes to be triggered @constants or @types needs to be include
  CONSTANTS : "constants",
  DATATYPES: "types",
  VARIABLES: "variables",
  EXCEPTIONS: "exceptions",
  GLOBAL: "global"
};

// Contains all the files that are being generated. This is used so all the sub package have a TOC to the left
pmd.globalFiles = [];

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

  var idList = {};

  function makeIdUnique(id) {
    if (id in idList) {
        // remove any existing suffix
        var base = id.replace(/-\d+$/, "");
        // generate a new suffix
        var cnt = idList[base] || 1;
        // while new suffix is in the list, keep making a different suffix
        do {
            id = base + "-" + cnt++;
        } while (id in idList);
        // save cnt for more efficient generation next time
        idList[base] = cnt;
    }
    // put the final id in the list so it won't get used again in the future
    idList[id] = true;
    // return the newly generated unique id
    return(id);
}

  debug.log('\nProcessing:', file.path);

  content.data = fs.readFileSync(file.path,'utf8');
  content.json = dox.parseComments(content.data);

  content.entities = []; //Holds list of entities for the object

  for(var i in content.json) {
    jsonData = content.json[i];

    if(jsonData.ctx == undefined) {
      continue;
    }

    var
      entity = {
        author:'',
        constants: [], // For package constants (used by @constant)
        variables: [],
        exceptions: [],
        created:'',
        example:'',
        return:'',
        isPrivate: jsonData.isPrivate,
        description:'',
        params:[],
        throws:[],
        // typeDesc:[], // TODO mdsouza: better name for this
        code: '',
        issues: [],
        name: '',
        type: '',
        types: [] // For package types (used by @type)
      },
      tagConstants = [], //temp array for tag with the name of @constant
      tagTypes = [], //temp array for tag with the name of @type
      variables = [], //temp array for variables with the name of @var
      exceptions = []//temp array for exceptions with the name of @exception
      ;

    if (jsonData.ignore) {
      debug.log('Ignoring:', jsonData.ctx);
      continue; // Skip this loop since ignoring
    }

    // If a file doesn't contain any JavaDoc or random block of comments jsonData.ctx will be null
    if (jsonData.ctx) {
      entity.type = jsonData.ctx.type;
    }
    else {
      // debug.log('Incorrectly parsed entry:', jsonData.code);
      continue; // Skip this loop since we dont know what this is
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
        case 'throws':
          entity.throws.push({
            description: tag.description.replace(/(^<p>|<\/p>$)/g, '').replace(/(<em>|<\/em>)/g,'')
          });
          break;
        case 'return':
          entity.return = tag.string;
          break;
        case 'constant':
        case 'var':
        case 'type':
        case 'exception':
          //This will parse the current issue to be <issue reference> | <issue description>
          /^\s*([\S]+)\s*(.*)/.exec(tag.string);
          var tempData = {
            name: RegExp.$1,
            description: RegExp.$2
          };


          if (tag.type === 'type'){
            tagTypes.push(tempData);
          } else if (tag.type === 'constant') {
            tagConstants.push(tempData);
          } else if (tag.type === 'var') {
            variables.push(tempData);
          } else if (tag.type === 'exception') {
            exceptions.push(tempData);
          }

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

    if (entity.code && entity.type === pmd.DOCTYPES.VARIABLES){
      entity.variables = jsonData.ctx.variables;

      // Loop over variables to see if there's one for this variableName
      for (var i in entity.variables){
        entity.variables[i].isPrivate = entity.isPrivate;

        variables.forEach(function(varType){
          if (entity.variables[i].name === varType.name){
            entity.variables[i].description = varType.description
          }
        });//tagVariables.forEach
      }//i in entity.types
    }//entity.code && entity.type === pmd.DOCTYPES.VARIABLES

    if (entity.code && entity.type === pmd.DOCTYPES.EXCEPTIONS){
      entity.exceptions = jsonData.ctx.exceptions;

      // Loop over exceptions to see if there's one for this exceptionName
      for (var i in entity.exceptions){
        entity.exceptions[i].isPrivate = entity.isPrivate;

        exceptions.forEach(function(exceptionType){
          if (entity.exceptions[i].name === exceptionType.name){
            entity.exceptions[i].description = exceptionType.description
          }
        });//tagExceptions.forEach
      }//i in entity.types
    }//entity.code && entity.type === pmd.DOCTYPES.EXCEPTIONS


    if (entity.code && (entity.type === pmd.DOCTYPES.FUNCTION || entity.type === pmd.DOCTYPES.PROCEDURE || entity.type == pmd.DOCTYPES.CURSOR)){

      entity.name = makeIdUnique(jsonData.ctx.name);
      entity.displayName = jsonData.ctx.name;
      // TODO mdsouza: cleanup?
      // entity.name = entity.code.match(/^\s*(procedure|function){1}\s+\w+/ig)[0];
      // entity.name = entity.name.replace(/^\s*(procedure|function){1}/ig, "").trim();

      entity.header = jsonData.ctx.header;

    }//entity.docType === docTypes.method

    content.entities.push(entity);
  }; // content.json.forEach

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


pmd.readFolder = function(objs, config, folder) {
  var
    files     = fs.readdirSync(path.resolve(folder.source.path)),
    template  = Handlebars.compile(folder.templateContent)
    ;

  files.forEach(function (fileName) {
    stats = fs.lstatSync(folder.source.path + '/' + fileName);

    if (stats.isDirectory()) {
      // Clone the old folder object and create a new without the reference
      var newFolder = JSON.parse(JSON.stringify(folder));

      newFolder.source.path             += '/' + fileName;
      newFolder.source.fileFilterRegexp = folder.source.fileFilterRegexp;

      pmd.readFolder(objs, config, newFolder);
    }
  });

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
        methods: [],
        variables: [],
        files: [],
        exceptions: [],
        projectDispName: config.projectDispName
      },
      markdown,
      entities,
      skipFile = false //Skips the current file if no JavaDoc detected
      ;

    if (1==2 ||
      (folder.source.fileFilterRegexp instanceof RegExp && folder.source.fileFilterRegexp.test(files[i])) ||
      !folder.source.fileFilterRegexp instanceof RegExp){

      let docExtName = path.extname(folder.template);
      file.ext = path.extname(files[i]);
      file.name = path.basename(files[i], file.ext);
      file.path = path.resolve(folder.source.path, files[i]);
      file.docFileName = file.name + docExtName;

      data.name = file.name;
      entities = pmd.processFile(file, debug);

      if(!entities) {
        skipFile = true;
      }
      else {
        // Load the data arrays with appropriate fields
        entities.forEach(function(entity){
          switch(entity.type){
            case pmd.DOCTYPES.DATATYPES:
              data.types = data.types.concat(entity.types);
              break;
            case pmd.DOCTYPES.FUNCTION:
            case pmd.DOCTYPES.PROCEDURE:
            case pmd.DOCTYPES.CURSOR:
              data.methods.push(entity);
              break;
            case pmd.DOCTYPES.CONSTANTS:
              data.constants = data.constants.concat(entity.constants);
              break;
            case pmd.DOCTYPES.VARIABLES:
              data.variables = data.variables.concat(entity.variables);
              break;
            case pmd.DOCTYPES.EXCEPTIONS:
              data.exceptions = data.exceptions.concat(entity.exceptions);
              break;
            case undefined:
              debug.log('\nFile:', files[i], "doesn't appear to have any JavaDoc in it. Skipping");
              skipFile = false;
              break;
            case pmd.DOCTYPES.GLOBAL:
              if(data.global == undefined) {
                data.global = entity;
              }
              break;
            default:
              debug.log('entity', entity);
              console.log('Unknown type: ', entity.type);
              process.exit();
              break;
          }//switch
        });//entities.forEach
      }//else

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
}

/**
 * Generates the data based on the files
 *
 * @param config Config JSON
 * @return objs array
 */
pmd.generateData = function(config){
  var objs = [];
  var indexData = [];

  config.folders.forEach(function(folder){
    pmd.readFolder(objs, config, folder);
  }); //config.folders.forEach

  // make the indexData available to all files
  // remove duplicates from indexData
  objs.forEach(function(obj){
    obj.fileData.files = indexData.filter(function(item, pos, ary) {
                                            return !pos || item.name != ary[pos - 1].name;
                                        });
  }); // objs.forEach

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
      data.variables = data.variables.concat(relatedData.variables);
      data.exceptions = data.variables.concat(relatedData.exceptions);

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
pmd.saveToFile = function(config, objs){
  // Finally print out data
  objs.forEach(function(obj){
	obj.fileData.files = pmd.globalFiles;

    var markdown = obj.template(obj.fileData);
    let docExtName = path.extname(obj.folder.template);

    if (debug.debug){
      debug.logFile(obj.fileData.name + docExtName, markdown);
    }

    fs.writeFileSync(path.resolve(obj.folder.output.path,obj.fileData.name + docExtName), markdown);
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
        projectDispName: config.projectDispName
      },
      template,
      templateContent,
      markdown
      ;

    objs.forEach(function(obj){
      var file = {};
      let docExtName = path.extname(obj.folder.template);

      file.docFileName = obj.fileData.name + docExtName;
      file.name = obj.fileData.name;

      indexData.files.push(file);
    })//objs.forEach

    // Sort based on names
    // http://stackoverflow.com/questions/979256/sorting-an-array-of-javascript-objects
    // Remove duplicates from array, as array was already sorted
    // http://stackoverflow.com/questions/9229645/remove-duplicates-from-javascript-array
    indexData.files.sort(function(a, b) {
      return a.name.localeCompare(b.name);
    }).filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });

    templateContent = fs.readFileSync(path.resolve(config.toc.template),'utf8'),
      template = Handlebars.compile(templateContent);
    markdown = template(indexData);

    pmd.globalFiles = indexData.files;

    fs.writeFileSync(path.resolve(config.folders[0].output.path, config.toc.fileName), markdown);
  }//config.templates.index
}// generateToc


module.exports = function(pDebug, pExtend){
  debug = pDebug;
  extend = pExtend;
  return pmd;
}
