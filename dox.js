//Overloaded dox.js

dox = require('dox');

// Overwrite context patterns for Oracle
dox.contextPatternMatchers = [
  //Procedure/Function
  function (str) {
    if (/^\s*(procedure|function)\s+([\w$]+)\s*/.exec(str)) {
      return {
          type: RegExp.$1
        , name: RegExp.$2
        , header: str.split(/\s+(as|is|begin)\s+/gi)[0]

      };
    }
  },
  
  //Constants
  function (str) {
    if (/^\s*[\w$]+\s+constant\s+/.exec(str)) {
      return {
          type: 'constant'
        , header: str
      };
    }
  },

  //Types
  function (str) {
    if (/^\s*type\s+/.exec(str)) {
      var
        typesArr = str.split(';'),
        types = [];

      // Added in the typesArr[k] since there's a blank array element at end
      for(var i = 0; i < typesArr.length && typesArr[i]; i++){
        var myType = {
          typeName : '',
          typeCode : typesArr[i] + ';', //Need to re-append missing ";" since removed with .split
        };

        myType.typeName = myType.typeCode.match(/\s*type\s+\w+/gi)[0].replace(/^\s*type/gi, '').trim();

        types.push(myType);
      }//typesArr

      return {
          type: 'types'
        , header: str
        , types: types
      };
    }
  }


];

module.exports = dox;
