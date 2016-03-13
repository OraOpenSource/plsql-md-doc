var
  path = require('path'),
  fs = require('fs'),
  fse = require('fs-extra'),
  Handlebars = require('./handlebars.js'),
  dox = require('./dox.js'),
  extend = require('util')._extend
;


// TODO mdsouza: put in config file
var config = {
  src : {
    path : '/Users/giffy/Documents/GitHub/oraopensource/oos-utils/source/packages',
    // regexp : '.*\.pkb$'
    regexp : 'oos_util_apex\.pkb$'
  },
  output : {
    path : path.resolve(__dirname,'./docs')
  },
  template : {
    path : path.resolve(__dirname,'./templates/package.md')
  }
};

config.src.regexp = new RegExp(config.src.regexp); // TODO mdsouza: make case insensitive
config.template.contents = fs.readFileSync(config.template.path,'utf8');

// Setup directory
// TODO mdsouza: renable
// try{
//   fse.removeSync(config.output.path);
// }
// catch (e) {
// }
// fs.mkdirSync(config.output.path);


// TODO mdsouza: delete docs directory


// TODO mdsouza:
/**
TODO list
- Page for all packages
  - This should list packages and functions along with links
  - bulleted list of methods
- Page per package
-

*/

// List packages
// TODO mdsouza: config this
var
  packages = {},
  packagesPath = path.resolve(__dirname,config.src.path)
;
var files = fs.readdirSync(packagesPath);
for (var i = 0; i < files.length; i++){
  var ext = path.extname(files[i]);

  if (config.src.regexp.test(files[i])){
    var packageName = files[i].slice(0, (-1 * ext.length));
    packages[packageName] = {
      file: {
        name: files[i],
        path: path.resolve(packagesPath + '/' + files[i])
      }
    };
  }//if
}//packages


// TODO mdsouza: better name of this
var docTypes = {
  function: "function",
  procedure: "procedure",
  //Note: For consants or dataTypes to be triggered @constants or @types needs to be include
  constants : "constant",
  dataTypes: "types"
}

// *** Packages ***
for (packageName in packages){
  var package = packages[packageName];

  package.src = fs.readFileSync(packages[packageName].file.path,'utf8');
  // TODO mdsouza: skipSingleStar
  package.json = dox.parseComments(packages[packageName].src);
  package.methods = [];
  package.constants = [];
  package.dataTypes = [];
  package.doc = '';

  // TODO mdsouza: testing
  fs.writeFileSync('test.json', JSON.stringify(package.json, null, 2));

  var
    tag
  ;

  // TODO mdsouza: json.length
  for (var i=0; i < package.json.length; i++){


    var
      method = package.json[i],
      myMethod = {
        author:'',
        created:'',
        example:'',
        return:'',
        description:'',
        params:[],
        typeDesc:[], // TODO mdsouza: better name for this
        code: '',
        // devNotes: '',
        issues: [],
        name: '',
        type: method.ctx.type
      }
    ;

    // console.log(myMethod.type);

    // TODO mdsouza: *** REMOVE ANY OTHER SETING OF docType

    // Tags
    for (var j=0; j < method.tags.length; j++){
      tag = method.tags[j];

      switch (tag.type) {
        case 'author':
          myMethod.author = tag.string;
          break;
        case 'created':
          myMethod.created = tag.string;
          break;
        case 'example':
          myMethod.example = tag.string;
          break;
        // TODO mdsouza: do we support dev notes or not?
        // case 'devnotes':
        //   myMethod.devNotes = tag.string;
        //   break;
        case 'issues':
          //This will parse the current issue to be <issue reference> | <issue description>
          /^\s*([\S]+)\s*(.*)/.exec(tag.string);

          myMethod.issues.push({
            number: RegExp.$1.replace(/^#+/,''), //Remove any leading hashes to get the ticket number
            description: RegExp.$2
          })
          break;
        case docTypes.dataTypes:
          myMethod.docType = docTypes.dataTypes;
          break;
        case docTypes.constants:
          myMethod.docType = docTypes.constants;
          break;
        case 'param':
          myMethod.params.push({
            name: tag.name,
            description: tag.description.replace(/(^<p>|<\/p>$)/g, ''),
            optional: tag.optional
          });
          break;
        case 'return':
          myMethod.return = tag.string;
          break;
      }//switch
    }//method.tags

    if (method.description){
      myMethod.description = method.description.full;
    }

    if (method.code){
      myMethod.code = method.code;
    }

    // console.log(method.ctx);

    if(myMethod.code && myMethod.type === docTypes.dataTypes){
      myMethod.types = method.ctx.types;

      // Loop over params to see if there's a description for this type
      for (var i = 0; i < myMethod.params.length; i++){
        for (var j = 0; j < myMethod.types.length; j++){
          if (myMethod.types[j].typeName === myMethod.params[i].name){
            myMethod.types[j].typeDesc = myMethod.params[i].description;
          }
        }//myMethod.types
      }//myMethod.params

    }//myMethod.docType === docTypes.dataTypes


    if (myMethod.code && myMethod.type === docTypes.constants){

    }//myMethod.docType === docTypes.constants

    if (myMethod.code && (myMethod.type === docTypes.function || myMethod.type === docTypes.procedure)){
      //if pks then stop then the last method will include the package end.
      // TODO mdsouza: need to handle this (create issue / low priority)

      myMethod.name = method.ctx.name;
      // myMethod.name = myMethod.code.match(/^\s*(procedure|function){1}\s+\w+/ig)[0];
      // myMethod.name = myMethod.name.replace(/^\s*(procedure|function){1}/ig, "").trim();

      //Only include this if we're parsing .pkb
      // TODO mdsouza: create ticket for this
      // myMethod.header = myMethod.code.split(/\s+(as|is|begin)\s+/gi)[0];
      myMethod.header = method.ctx.header;

    }//myMethod.docType === docTypes.method

    //Want to display the Parameters if they or return exist
    myMethod.displayParams = false;
    if (myMethod.params || myMethod.return){
      myMethod.displayParams = true;
    }

    switch (myMethod.type) {
      case docTypes.constants:
        package.constants.push(myMethod)
        break;
      case docTypes.dataTypes:
        package.dataTypes.push(myMethod)
        break;
      default:
        package.methods.push(myMethod);

    }
  }//json array


  // TODO mdsouza: Maybe in a debug mode?
  // fs.writeFileSync('test.json', JSON.stringify(package.methods, null, 2));

  var template = Handlebars.compile(config.template.contents);
  var data = {
    packageName : packageName,
    methods: package.methods,
    constants: package.constants,
    dataTypes: package.dataTypes
  };

  package.doc = template(data);
  // TODO mdsouza: delete file if exists?
  try {
    fs.truncateSync(path.resolve(config.output.path,packageName + '.md'));
  } catch (e) {
    null;
  } finally {
    fs.appendFileSync(path.resolve(config.output.path,packageName + '.md'), package.doc);
  }

}// packages
