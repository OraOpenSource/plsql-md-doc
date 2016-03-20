# Handlebars

This project uses [Handlebars](http://handlebarsjs.com/) for string substitution in the templates. This document doesn't cover the basics as their website does a very good job of it. If creating your own template review their content. You can also look at the [template](../templates) examples that are posted as part of this project.


## Helper Functions
When using Handlebars, this project has added some additional help functions which are listed below.

### `toUpperCase`

Converts string to upper case.

Ex: `{{toUpperCase name}}`

### `lineBreakToBr`

Converts line breaks to HTML `<br />` tag.

Ex: `{{{lineBreakToBr code}}}`. _Note: the three curly (`{{{`) braces instead of two. This is a Handlebars notation to avoid escaping HTML expressions._

### `initCap`

Sets the first character in the string to upper case, the rest will be lowercase.

Ex: `{{initCap type}}`

### `ifCond`

Handlebars has basic condition processing. `ifCond` allows for more complex and multiple conditions in an `if` statement.

Ex: `{{#ifCond params.length '||' return}}...{{/ifCond}}`

It's notation is `value1, operator, value2`. The `operator` is a string and can be any of the following: `==`, `===`, `<`, `<=`, `>`, `>=`, `&&`, `||`.
