// When using this ensure that the calling function sets debug.debug
var
  path = require('path'),
  fs = require('./fs.js')
;

var debug = {};

debug.debug = false;
debug._folderPath = path.resolve(__dirname, '../debug');

debug.log = function(){
  if (debug.debug){
    console.log.apply(console.log, arguments);
  }
}//debug

debug.logFile = function (fileName, fileContent){
  fs.writeFileSync(
    path.resolve(debug._folderPath, fileName),
    fileContent);
}// debug.logFile

debug.setup = function (){
  if (debug.debug) {
    fs.emptyDirSync(debug._folderPath);
  }
}// debug.setup

module.exports = debug;
