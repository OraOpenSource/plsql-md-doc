var
  path = require('path'),
  fs = require('./fs.js'),
  fse = require('fs-extra'),
  Handlebars = require('./handlebars.js'),
  dox = require('./dox.js'),
  // extend = require('util')._extend,
  extend = require('node.extend'), // TODO mdsouza: see which one I need

  // TODO mdsouza: move to a separate file?
  raiseError = function(msg, includeError){
    includeError = includeError == null ? true : includeError;
    console.error((includeError ? 'Error: ' : '') + msg);
    process.exit();
  },
  validatePathRef = function(fullPath, objName){
    if (fullPath.length == 0){
      raiseError('All ' + objName + ' must have a fully qualified path');
    }
    else if (!fs.existsSync(path.resolve(fullPath))){
      raiseError(objName + ': ' + fullPath + ' does not exist');
    }
  },// validatePathRef

  // TODO mdsouza: move to its own file?
  // TODO mdsouza: If I do change dox.js to use it.
  processFile = function(file){
    var
      DOCTYPES = {
        FUNCTION: "function",
        PROCEDURE: "procedure",
        //Note: For consants or dataTypes to be triggered @constants or @types needs to be include
        CONSTANTS : "constants",
        DATATYPES: "types"
      },
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
            // TODO mdsouza: test
          // case DOCTYPES.DATATYPES:
          //   myMethod.docType = docTypes.dataTypes;
          //   break;
          // case docTypes.constants:
          //   myMethod.docType = docTypes.constants;
          //   break;
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


      if (entity.code && entity.type === DOCTYPES.DATATYPES){

        entity.types = jsonData.ctx.types;
        // Loop over tags to see if there's one for this typeName
        for (var i in entity.types){
          tagTypes.forEach(function(tagType){
            if (entity.types[i].name === tagType.name){
              entity.types[i].description = tagType.description
            }
          });//tagTypes.forEach
        }//i in entity.types

      }//entity.code && entity.type === DOCTYPES.DATATYPES

      if (entity.code && entity.type === DOCTYPES.CONSTANTS){

        entity.constants = jsonData.ctx.constants;
        // Loop over constants to see if there's one for this constantName
        for (var i in entity.constants){
          tagConstants.forEach(function(constantType){
            if (entity.constants[i].name === constantType.name){
              entity.constants[i].description = constantType.description
            }
          });//tagConstants.forEach
        }//i in entity.types
      }//entity.code && entity.type === DOCTYPES.CONSTANTS


      if (entity.code && (entity.type === DOCTYPES.FUNCTION || entity.type === DOCTYPES.PROCEDURE)){

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

;

// Handle variables
var
  args = process.argv.slice(2), // Array of arguments
  arguments = {
    project :  args[0]
  }
;

// Validation and Data Load
if (args.length === 0){
  raiseError('To run call: node app <project>', false);
}
// Check that config file exists
if (!fs.existsSync(path.resolve(__dirname,'config.json'))){
  raiseError('config.json must be present. TODO run generateConfig.js to generate default');
}

var
  defaultConfig = {
    "folders" : {}
  },
  defaultConfigFolder = {
    "srcPath" : "",
    "outputPath" : "",
    "template" : "",
    "fileFilterRegexp" : ""
  },
  userConfig = require('./config');

// Check that project exists in config.
if (!userConfig[arguments.project]){
  raiseError('Can not find project: ' + arguments.project + ' in config.json');
}

config = extend(true, {}, defaultConfig, userConfig[arguments.project]);

// If only one folder (i.e. not an array), covert to array
if (!Array.isArray(config.folders)){
  config.folders = [config.folders];
}

// Apply the default config to each element
for (var key in config.folders){
  config.folders[key] = extend(true, {}, defaultConfigFolder, config.folders[key]);

  // Convert the regexp into a regexp object
  if (config.folders[key].fileFilterRegexp.length > 0){
    // TODO mdsouza: make case insensitive
    config.folders[key].fileFilterRegexp = new RegExp(config.folders[key].fileFilterRegexp);
  }

  // Check that template exists
  validatePathRef(config.folders[key].template, 'template');
  config.folders[key].templateContent = fs.readFileSync(path.resolve(config.folders[key].template),'utf8');

  // Check that the srcPath exists
  validatePathRef(config.folders[key].srcPath, 'srcPath');

  // Check if output path exists
  if (config.folders[key].outputPath.length == 0){
    // Calling validatePathRef so same message
    validatePathRef(config.folders[key].outputPath, 'outputPath');
  }

  // Create if doesn't exist
  if (!fs.existsSync(path.resolve(config.folders[key].outputPath))){
    fs.mkdirSync(path.resolve(config.folders[key].outputPath));
  }

}// for


// Loop over each folder in the project and generate files
config.folders.forEach(function(folder){
  var
    files = fs.readdirSync(path.resolve(folder.srcPath)),
    file = {
      ext: '',
      name: '',
      path: ''
    },
    template = Handlebars.compile(folder.templateContent),
    data = {
      name:'',
      types: [],
      constants: [],
      methods: []
    },
    markdown,
    entities
  ;

  for (var i in files){
    if ((folder.fileFilterRegexp instanceof RegExp && folder.fileFilterRegexp.test(files[i])) || !folder.fileFilterRegexp instanceof RegExp){
      file.ext = path.extname(files[i]);
      file.name = path.basename(files[i], file.ext);
      file.path = path.resolve(folder.srcPath, files[i]);

      data.name = file.name;
      entities = processFile(file);

      // Load the data arrays with appropriate fields
      entities.forEach(function(entity){
        // TODO mdsouza: make constants available here
        switch(entity.type){
          case 'types':
            data.types = entity.types;
            break;
          case 'function':
          case 'procedure':
            data.methods.push(entity);
            break;
          case 'constants':
            data.constants = entity.constants;
            break;
          default:
            console.log('Unknown type: ', entity.type);
            process.exit();
            break;
        }//switch
      });//entities.forEach


      // TODO mdsouza:
      fs.writeFileSync(path.resolve(__dirname, 'test.json'), JSON.stringify(data, null, '  '));

      markdown = template(data);

      // TODO mdsouza: delete file if exists?
      try {
        fs.truncateSync(path.resolve(folder.outputPath,file.name + '.md'));
      } catch (e) {
        null;
      } finally {
        fs.appendFileSync(path.resolve(folder.outputPath,file.name + '.md'), markdown);
      }

    }//if regexp pass or no regexp
  }// for i in files

}); //config.folders.forEach


process.exit(); // TODO mdsouza:
// TODO mdsouza: anything below this line is old code and has been cleaned up and moved above.

// List packages
// TODO mdsouza: config this
var
  packages = {},
  packagesPath = path.resolve(__dirname,config.src.path)
;
var files = fs.readdirSync(packagesPath);
for (var i = 0; i < files.length; i++){
  var ext = path.extname(files[i]);

  if (config.src.regexp.test(files[i])){
    var packageName = files[i].slice(0, (-1 * ext.length));
    packages[packageName] = {
      file: {
        name: files[i],
        path: path.resolve(packagesPath + '/' + files[i])
      }
    };
  }//if
}//packages


// TODO mdsouza: better name of this
var docTypes = {
  function: "function",
  procedure: "procedure",
  //Note: For consants or dataTypes to be triggered @constants or @types needs to be include
  constants : "constant",
  dataTypes: "types"
}

// *** Packages ***
for (packageName in packages){
  var package = packages[packageName];

  package.src = fs.readFileSync(packages[packageName].file.path,'utf8');
  // TODO mdsouza: skipSingleStar
  package.json = dox.parseComments(packages[packageName].src);
  package.methods = [];
  package.constants = [];
  package.dataTypes = [];
  package.doc = '';

  // TODO mdsouza: testing
  fs.writeFileSync('test.json', JSON.stringify(package.json, null, 2));

  var
    tag
  ;

  // TODO mdsouza: json.length
  for (var i=0; i < package.json.length; i++){


    var
      method = package.json[i],
      myMethod = {
        author:'',
        created:'',
        example:'',
        return:'',
        description:'',
        params:[],
        typeDesc:[], // TODO mdsouza: better name for this
        code: '',
        // devNotes: '',
        issues: [],
        name: '',
        type: method.ctx.type
      }
    ;

    // console.log(myMethod.type);

    // TODO mdsouza: *** REMOVE ANY OTHER SETING OF docType

    // Tags
    for (var j=0; j < method.tags.length; j++){
      tag = method.tags[j];

      switch (tag.type) {
        case 'author':
          myMethod.author = tag.string;
          break;
        case 'created':
          myMethod.created = tag.string;
          break;
        case 'example':
          myMethod.example = tag.string;
          break;
        // TODO mdsouza: do we support dev notes or not?
        // case 'devnotes':
        //   myMethod.devNotes = tag.string;
        //   break;
        case 'issues':
          //This will parse the current issue to be <issue reference> | <issue description>
          /^\s*([\S]+)\s*(.*)/.exec(tag.string);

          myMethod.issues.push({
            number: RegExp.$1.replace(/^#+/,''), //Remove any leading hashes to get the ticket number
            description: RegExp.$2
          })
          break;
        case docTypes.dataTypes:
          myMethod.docType = docTypes.dataTypes;
          break;
        case docTypes.constants:
          myMethod.docType = docTypes.constants;
          break;
        case 'param':
          myMethod.params.push({
            name: tag.name,
            description: tag.description.replace(/(^<p>|<\/p>$)/g, ''),
            optional: tag.optional
          });
          break;
        case 'return':
          myMethod.return = tag.string;
          break;
      }//switch
    }//method.tags

    if (method.description){
      myMethod.description = method.description.full;
    }

    if (method.code){
      myMethod.code = method.code;
    }

    // console.log(method.ctx);

    if(myMethod.code && myMethod.type === docTypes.dataTypes){
      myMethod.types = method.ctx.types;

      // Loop over params to see if there's a description for this type
      for (var i = 0; i < myMethod.params.length; i++){
        for (var j = 0; j < myMethod.types.length; j++){
          if (myMethod.types[j].typeName === myMethod.params[i].name){
            myMethod.types[j].typeDesc = myMethod.params[i].description;
          }
        }//myMethod.types
      }//myMethod.params

    }//myMethod.docType === docTypes.dataTypes


    if (myMethod.code && myMethod.type === docTypes.constants){

    }//myMethod.docType === docTypes.constants

    if (myMethod.code && (myMethod.type === docTypes.function || myMethod.type === docTypes.procedure)){
      //if pks then stop then the last method will include the package end.
      // TODO mdsouza: need to handle this (create issue / low priority)

      myMethod.name = method.ctx.name;
      // myMethod.name = myMethod.code.match(/^\s*(procedure|function){1}\s+\w+/ig)[0];
      // myMethod.name = myMethod.name.replace(/^\s*(procedure|function){1}/ig, "").trim();

      //Only include this if we're parsing .pkb
      // TODO mdsouza: create ticket for this
      // myMethod.header = myMethod.code.split(/\s+(as|is|begin)\s+/gi)[0];
      myMethod.header = method.ctx.header;

    }//myMethod.docType === docTypes.method

    //Want to display the Parameters if they or return exist
    myMethod.displayParams = false;
    if (myMethod.params || myMethod.return){
      myMethod.displayParams = true;
    }

    switch (myMethod.type) {
      case docTypes.constants:
        package.constants.push(myMethod)
        break;
      case docTypes.dataTypes:
        package.dataTypes.push(myMethod)
        break;
      default:
        package.methods.push(myMethod);

    }
  }//json array


  // TODO mdsouza: Maybe in a debug mode?
  // fs.writeFileSync('test.json', JSON.stringify(package.methods, null, 2));

  var template = Handlebars.compile(config.template.contents);
  var data = {
    packageName : packageName,
    methods: package.methods,
    constants: package.constants,
    dataTypes: package.dataTypes
  };

  package.doc = template(data);
  // TODO mdsouza: delete file if exists?
  try {
    fs.truncateSync(path.resolve(config.output.path,packageName + '.md'));
  } catch (e) {
    null;
  } finally {
    fs.appendFileSync(path.resolve(config.output.path,packageName + '.md'), package.doc);
  }

}// packages
