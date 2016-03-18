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
      var
        ret = {
          type : 'constants',
          header : str,
          constants : []
        },
        constantsArr = str.split(';')
      ;

      constantsArr.forEach(function(constant){
        // Comments after constants may still be in the array.
        // As such only allow definitions of constants
        if (/^\s*\w+\s+constant\s+.+:=.+$/gi.test(constant)){
          var
            myConstant = {
              name : '',
              // Remove any "\n" and the begining
              code : constant.replace(/^[\n]*/, '') + ';' //Need to re-append missing ";" since removed with .split
            }
          ;

          /^\s*([\w]+)\s+constant\s+/.exec(constant);
          myConstant.name = RegExp.$1.trim();

          ret.constants.push(myConstant);
        }// if constant
      });//constantsArr.forEach

      return ret;
    }// if constant
  },

  //Types
  function (str) {
    if (/^\s*type\s+/.exec(str)) {
      var
        typesArr = str.split(';'),
        types = [];

      // Added in the typesArr[k] since there's a blank array element at end
      // TODO mdsouza: changet this to base name and code variables
      for(var i = 0; i < typesArr.length && typesArr[i]; i++){
        var myType = {
          name : '',
          // Remove any "\n" and the begining
          code : typesArr[i].replace(/^[\n]*/, '') + ';', //Need to re-append missing ";" since removed with .split
        };

        myType.name = myType.code.match(/\s*type\s+\w+/gi)[0].replace(/^\s*type/gi, '').trim();

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
