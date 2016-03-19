// When using this ensure that the calling function sets debug.debug
var
  path = require('path'),
  fs = require('./fs.js')
;

var debug = {};

debug.debug = false;
debug.folderPath = path.resolve(__dirname, '../debug');
debug.log = function(){
  if (debug.debug){
    console.log.apply(console.log, arguments);
  }
}//debug

debug.logFile = function (fileName, fileContent){
  fs.writeFileSync(
    path.resolve(debug.folderPath, fileName),
    fileContent);
}// debug.logFile

debug.clearDir = function (){
  fs.emptyDirSync(debug.folderPath);
}// debug.clearDir

module.exports = debug;
