//Overloaded Handlebars

Handlebars = require('handlebars'),


Handlebars.registerHelper('toUpperCase', function(str) {
  return str.toUpperCase();
});

Handlebars.registerHelper('initCap', function(str) {
  if (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  else{
    return str;
  }
});


module.exports = Handlebars;
