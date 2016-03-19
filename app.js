var
  path = require('path'),
  fs = require('./lib/fs.js'),
  fse = require('fs-extra'),
  Handlebars = require('./lib/handlebars.js'),
  dox = require('./lib/dox.js'),
  extend = require('node.extend'),
  pmd = require('./lib/pmd.js'),

  debug = function(){
    if (config.debug){
      console.log.apply(console.log, arguments);
      console.log('');
    }
  }//debug
;


// Handle parameters
var arguments = pmd.getArguments(process);

var
  defaultConfig = {
    "debug" : false,
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
  pmd.raiseError('Can not find project: ' + arguments.project + ' in config.json');
}

var config = extend(true, {}, defaultConfig, userConfig[arguments.project]);

// only call debug from this point on
debug('config: ', config);



// If only one folder (i.e. not an array), covert to array
if (!Array.isArray(config.folders)){
  config.folders = [config.folders];
}

// Apply the default config to each element
for (var key in config.folders){
  config.folders[key] = extend(true, {}, defaultConfigFolder, config.folders[key]);

  // Convert the regexp into a regexp object
  if (config.folders[key].fileFilterRegexp.length > 0){
    config.folders[key].fileFilterRegexp = new RegExp(config.folders[key].fileFilterRegexp, 'g');
  }

  // Check that template exists
  pmd.validatePathRef(config.folders[key].template, 'template');
  config.folders[key].templateContent = fs.readFileSync(path.resolve(config.folders[key].template),'utf8');

  // Check that the srcPath exists
  pmd.validatePathRef(config.folders[key].srcPath, 'srcPath');

  // Check if output path exists
  if (config.folders[key].outputPath.length == 0){
    // Calling pmd.validatePathRef so same message
    pmd.validatePathRef(config.folders[key].outputPath, 'outputPath');
  }

  // Create outputPath if doesn't exist
  if (!fs.existsSync(path.resolve(config.folders[key].outputPath))){
    fs.mkdirSync(path.resolve(config.folders[key].outputPath));
  }

}// var key in config.folders


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
    markdown,
    entities
  ;

  // Create and wipe debug folder
  if (config.debug){
    // Will create (if not exists) and wipe
    fs.emptyDirSync(path.resolve(__dirname,'debug'));
  }//config.debug


  for (var i in files){
    var
      data = {
        name:'',
        types: [],
        constants: [],
        methods: []
      }
    ;

    if (1==2 ||
      (folder.fileFilterRegexp instanceof RegExp && folder.fileFilterRegexp.test(files[i])) ||
      !folder.fileFilterRegexp instanceof RegExp){

      file.ext = path.extname(files[i]);
      file.name = path.basename(files[i], file.ext);
      file.path = path.resolve(folder.srcPath, files[i]);

      data.name = file.name;
      entities = pmd.processFile(file);

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
          default:
            console.log('Unknown type: ', entity.type);
            process.exit();
            break;
        }//switch
      });//entities.forEach

      // Output JSON data
      if (config.debug){
        fs.writeFileSync(
          path.resolve(__dirname, 'debug/' + file.name + file.ext + '.json'),
          JSON.stringify(data, null, '  '));
      }

      markdown = template(data);

      if (config.debug){
        fs.writeFileSync(path.resolve(__dirname, 'debug/',file.name + file.ext + '.md'), markdown);
      }

      // Write file
      fs.writeFileSync(path.resolve(folder.outputPath,file.name + '.md'), markdown);

    }//if regexp pass or no regexp
  }// for i in files

}); //config.folders.forEach
