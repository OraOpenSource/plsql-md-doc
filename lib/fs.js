//Overloaded fs.js

fs = require('fs-extra');

// Overwrite existsSync as it's being deprecated
fs.existsSync = function(path){
  try {
    fs.accessSync(path, fs.F_OK);
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = fs;
