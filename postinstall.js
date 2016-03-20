// Post install script
var
  path = require('path'),
  fs = require('./lib/fs.js')
;

var configFile = path.resolve(__dirname, 'config.json');

if (!fs.existsSync(configFile)) {
  console.log('Adding config.json');

  var config = {
    "projectName" : {
      "folders" : {
        "output" : {
          "delete" : false,
          "path" : ""
        },
        "source" : {
          "path" : "",
          "fileFilterRegexp" : "\\.pk(b|s)$"
        },
        "template" : ""
      },
      "projectName" : "",
      "toc" : {
        "fileName" : "index.md",
        "template" : ""
      }
    }
  }
  config.projectName.folders.template = path.resolve(__dirname, 'templates/package.md');
  config.projectName.toc.template = path.resolve(__dirname, 'templates/toc.md');
  fs.outputJsonSync(configFile, config);
}
