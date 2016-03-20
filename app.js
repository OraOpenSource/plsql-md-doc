var
  path = require('path'),
  fs = require('./lib/fs.js'),
  fse = require('fs-extra'),
  Handlebars = require('./lib/handlebars.js'),
  extend = require('node.extend'),
  debug = require('./lib/debug.js'),
  pmd = require('./lib/pmd.js')(debug, extend)
;


// Handle parameters
var arguments = pmd.getArguments(process);

var
  defaultConfig = {
    "projectName" : "",
    "debug" : false,
    "folders" : {},
    "templates" : {},
    "toc" : {
      "fileName" : "index.md"
    }
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


debug.debug = config.debug;
pmd.debug = debug

// only call debug from this point on
debug.log('config: ', config);



// If only one folder (i.e. not an array), covert to array
if (!Array.isArray(config.folders)){
  config.folders = [config.folders];
}

// Apply the default config to each element
for (var key in config.folders){
  config.folders[key] = extend(true, {}, defaultConfigFolder, config.folders[key]);

  // Convert the regexp into a regexp object
  if (config.folders[key].fileFilterRegexp.length > 0){
    config.folders[key].fileFilterRegexp = new RegExp(config.folders[key].fileFilterRegexp, 'i');
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


// Process data and write to file
var objs = pmd.generateData(config);
objs = pmd.mergeObjs(objs);
pmd.saveToFile(objs);


pmd.generateToc(config, objs);
