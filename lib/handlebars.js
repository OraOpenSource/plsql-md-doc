//Overloaded Handlebars

Handlebars = require('handlebars'),


Handlebars.registerHelper('toUpperCase', function(str) {
  if (str) {
    return str.toUpperCase();
  } else {
    return str;
  }
});

Handlebars.registerHelper('lineBreakToBr', function(str) {
  if (str) {
    return str.replace(/\n/g,'<br />');
  } else {
    return str;
  }
});

Handlebars.registerHelper('initCap', function(str) {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
  else{
    return str;
  }
});

// From http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
  switch (operator) {
    case '==':
      return (v1 == v2) ? options.fn(this) : options.inverse(this);
    case '===':
      return (v1 === v2) ? options.fn(this) : options.inverse(this);
    case '<':
      return (v1 < v2) ? options.fn(this) : options.inverse(this);
    case '<=':
      return (v1 <= v2) ? options.fn(this) : options.inverse(this);
    case '>':
      return (v1 > v2) ? options.fn(this) : options.inverse(this);
    case '>=':
      return (v1 >= v2) ? options.fn(this) : options.inverse(this);
    case '&&':
      return (v1 && v2) ? options.fn(this) : options.inverse(this);
    case '||':
      return (v1 || v2) ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});


// TODO mdsouza: create functions for getTypes, getMethods, getConstants
// TODO mdsouza: delete
Handlebars.registerHelper('entityFilter', function(entityType, options) {
  var
    retEntities = []
  ;

  console.log(entityType);

  options.data.root.entities.forEach(function(entity){
    if (entity.type === 'typesBAD'){
      retEntities.push(entity);
    }
  });//entities.forEach

  console.log(retEntities);

  return options.fn(retEntities);
});


module.exports = Handlebars;
