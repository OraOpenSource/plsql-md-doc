var
  path = require('path'),
  fs = require('./lib/fs.js'),
  Handlebars = require('./lib/handlebars.js'),
  extend = require('node.extend'),
  debug = require('./lib/debug.js'),
  pmd = require('./lib/pmd.js')(debug, extend)
;


// Handle parameters
var arguments = pmd.getArguments(process);

var
  defaultConfig = require('./default'),
  defaultConfigFolder = require('./defaultFolder'),
  userConfig = require('./config')
;

// Check that project exists in config.
if (!userConfig[arguments.project]){
  pmd.raiseError('Can not find project: ' + arguments.project + ' in config.json');
}

var config = extend(true, {}, defaultConfig, userConfig[arguments.project]);


debug.debug = config.debug;
debug.setup();
pmd.debug = debug

// only call debug from this point on

// #10
if (config.projectDispName.trim().length === 0){
  config.projectDispName = arguments.project;
}

debug.log('config: ', config);



// If only one folder (i.e. not an array), covert to array
if (!Array.isArray(config.folders)){
  config.folders = [config.folders];
}

// Apply the default config to each element
config.folders.forEach(function(folder, key){
  folder = extend(true, {}, defaultConfigFolder, folder);

  // Convert the regexp into a regexp object
  if (folder.source.fileFilterRegexp.length > 0){
    folder.source.fileFilterRegexp = new RegExp(folder.source.fileFilterRegexp, 'i');
  }

  // Check that template exists
  pmd.validatePathRef(folder.template, 'template');
  folder.templateContent = fs.readFileSync(path.resolve(folder.template),'utf8');

  // Check that the srcPath exists
  pmd.validatePathRef(folder.source.path, 'folder.source.path');

  // Check if output path is defined
  if (folder.output.path.length == 0){
    pmd.raiseError('folder.output.path is required', true);
  }

  // Create outputPath if doesn't exist
  fs.ensureDirSync(path.resolve(folder.output.path));

  // #11 Delete if told to
  if (folder.output.delete){
    fs.emptydirSync(path.resolve(folder.output.path));
  }

  config.folders[key] = folder;

});// config.folders.forEach

if (config.toc.template){
  pmd.validatePathRef(config.toc.template, 'config.toc.template');
}


// Process data and write to file
var objs = pmd.generateData(config);
objs = pmd.mergeObjs(objs);

// First generate the TOC than the files, so the packages also have a TOC
pmd.generateToc(config, objs);
pmd.saveToFile(config, objs);
