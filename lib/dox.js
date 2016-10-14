//Overloaded dox.js

var
    dox = require('dox')
    ;

// Overwrite context patterns for Oracle
dox.contextPatternMatchers = [
    //Procedure/Function
    function (str) {
        if (/^\s*(procedure|function)\s+([\w$]+)\s*/i.exec(str)) {
            return {
                type: RegExp.$1.toLowerCase()
                , name: RegExp.$2
                // Split on ";" for pks files. This may occur when on JavaDoc fn then another fn without JavaDoc
                , header: str.split(/(\s+(as|is|begin)\s+|;)/gi)[0]
            };
        }
    },

    //Constants
    function (str) {
        if (/^\s*[\w$]+\s+constant\s+/i.exec(str)) {
            // #40 fix for comments above a constant
            str = str.replace(/^\s*--.*$/mg, '');

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

                    /^\s*([\w]+)\s+constant\s+/i.exec(constant);
                    myConstant.name = RegExp.$1.trim();

                    ret.constants.push(myConstant);
                }// if constant
            });//constantsArr.forEach

            return ret;
        }// if constant
    },

    //Exceptions
    function (str) {
        if (/(^[\w]+)(\s+)(exception)/i.exec(str)) {
            // #40 fix for comments above a constant
            str = str.replace(/^\s*--.*$/mg, '');

            var
                ret = {
                    type : 'exceptions',
                    header : str,
                    exceptions : []
                },
                exceptionsArr = str.split(';')
                ;

            exceptionsArr.forEach(function(exception){
                // Comments after exceptions may still be in the array.
                // As such only allow definitions of exceptions
                if (/^\s*\w+\s+exception(?!_).*$/gi.test(exception)){
                    var
                        myException = {
                            name : '',
                            // Remove any "\n" and the begining
                            code : exception.replace(/^[\n]*/, '') + ';' //Need to re-append missing ";" since removed with .split
                        }
                        ;

                    /^\s*([\w]+)\s+exception(\s*)/i.exec(exception);
                    myException.name = RegExp.$1.trim();

                    ret.exceptions.push(myException);
                }// if exception
            });//exceptionsArr.forEach

            return ret;
        }// if exception
    },

    //Variables
    function (str) {
        if (str.substring(0, 4) != "type" && /^\s*([\w]+)\s*(([\w]+)|([\w]+\([\d]+\)))((\s+)|;)((default|:=)(\s+)((\'[\w]*\')|[\d]+|[\w]+((\s+)[\w]+)?))?/i.exec(str)) {
            // #40 fix for comments above a constant
            str = str.replace(/^\s*--.*$/mg, '');

            var
                ret = {
                    type : 'variables',
                    header : str,
                    variables : []
                },
                variablesArr = str.split(';')
                ;

            variablesArr.forEach(function(variable){
                // Comments after variables may still be in the array.
                // As such only allow definitions of variables
                if (/^\s*\w+\s+.+(:=|default)*.+$/gi.test(variable)){
                    var
                        myVariable = {
                            name : '',
                            // Remove any "\n" and the begining
                            code : variable.replace(/^[\n]*/, '') + ';' //Need to re-append missing ";" since removed with .split
                        }
                        ;

                    // Regex for checking variables
                    /^\s*([\w]+)\s+(([\w]+)|([\w]+\([\d]+\)))((\s+)?)((default|:=)(\s+)((\'[\w]*\')|[\d]+|[\w]+((\s+)[\w]+)?))?/i.exec(variable);
                    myVariable.name = RegExp.$1.trim();

                    ret.variables.push(myVariable);
                }// if variable
            });//variablesArr.forEach

            return ret;
        }// if variable
    },

    //Types
    function (str) {
        // #43: Add support for subtype
        if (/^\s*(type|subtype)\s+/i.exec(str)) {
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

                // #28
                if (/^\s*(type|subtype)/i.test(myType.code)){
                    myType.name = myType.code.match(/\s*(type|subtype)\s+\w+/gi)[0].replace(/^\s*(type|subtype)/gi, '').trim();
                    types.push(myType);
                }

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