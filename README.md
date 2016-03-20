# PLSQL to Markdown Documenter

** THIS PROJECT IS IN ALPHA STATE - DO NOT USE **

- [Constants](#constants)
- [Tags](#tags)
  - [`@author`](#tag-author)
  - [`@created`](#tag-created)
  - [`@example`](#tag-example)
  - [`@issue`](#tag-issue)
  - [`@param`](#tag-param)
  - [`@private`](#tag-private)
  - [`@return`](#tag-return)

## Install, Setup, and Updates

### Install

You only need once instance of PL/SQL to MD on your system as the configuration can handle multiple projects.

```bash
git clone https://github.com/OraOpenSource/plsql-md-doc
cd plsql-md-doc
npm install
```

### Setup

By default a `config.json` file is created. Please review the [`config.json`](/docs/config.json.md) docs before editing.

### Update

Go to the project folder
```bash
git update
npm install
```

## Documentation


### <a name ="ignore"></a>Ignore
Blocks of code can be ignored by using a `!`. These won't be available for the template to process at all. Example:

```md
/**
 * Not ignored.
 */

/*!
 * Ignored.
 */
 ```

### <a name="tags"></a>Tags

#### <a name="tag-author"></a>`@author`

`@author <name>`

Example:
```plsql
/**
 * ...
 * @author Martin Giffy D'Souza
 * ...
```

Template Reference:

```md
Author: {{author}}
```

Result:

```md
Author: Martin Giffy D'Souza
```

#### <a name="tag-created"></a>`@created`

`@created` Is used to note the date the method was created.

Example: see [`@author`](#tag-author)

#### <a name="tag-example"></a>`@example`

This tag allows you to include a full multiline example of your code along with any results.

Example:

```plsql
/**
 * ...
 * @example
 *
 * select *
 * into l_temp
 * from dual;
 * ...
```

Template:
<pre>
{{#if example}}
### Example
```plsql
{{{example}}}
```
{{/if}}
</pre>

Result:

<pre>
### Example
```plsql
select *
into l_temp
from dual;
```
</pre>

#### <a name="tag-issue"></a>`@issue`

`@issue <number> <description (optional)>`

The `@issue` tag is used to reference multiple main issues for a give method. If a hash (`#`) is prefixed to the issue number it will be removed from the issue. The reason it is removed is that most references to the hash are for GitHub or Bitbucket purposes. They don't work for links as the hash will be considered as an anchor tag.

Example: _Note: the leading hash does not matter_
```plsql
/**
 * ...
 * @issue #12 Initial creation
 * @issue 23 Some major update
 * @issue 46
 * ...
```

Template Reference:
```md
{{#if issues}}
### Issues
Issue | Description
--- | ---
{{#each issues}}
[{{number}}](/issues/{{number}}) | {{description}}
{{/each}}
{{/if}} {{! issues}}
```

Result:

```md
### Issues
Issue | Description
--- | ---
[12](/issues/12) |
[23](/issues/23) | Some major update
[46](/issues/46) |
```


#### <a name="tag-param"></a>`@param`

`@param <name> <description (optional)>`

The `@param` tag is used to reference parameters for a given method. Use one for each parameter which should match the name of each parameter.

Example:
```plsql
/**
 * ...
 * @param p_app_id APEX application ID
 * @param p_page_id APEX page ID
 * @param p_session_id
 * ...
```

Template Reference:
```md
{{#if params}}
### Parameters
Name | Description
--- | ---
{{#each params}}
{{name}} | {{{description}}}
{{/each}}
{{/if}} {{! params}}
```

Result:

```md
### Parameters
Name | Description
--- | ---
p_app_id | APEX application ID
p_page_id | APEX page ID
p_session_id |
```



#### <a name="tag-private"></a>`@private`

The `@private` tag is used on private methods. You can chose if these methods should be displayed by the template. Reference it in the template by using the `isPrivate` attribute.

Each element in [`types`](#types) and [`constants`](#constants) also contain the `isPrivate` boolean attribute. It is recommended to apply this tag to internal (package body) constants and types.

Example:
```plsql
/**
 * ...
 * @private
 * ...
```

Template Reference:
```md
{{#each methods}}
{{#unless isPrivate}}

Items shown here will only be displayed if not private
{{/unless}}
{{/each}}
```



#### <a name="tag-return"></a>`@return`

`@return` Is used to describe the object returned by a function.


Example:
```plsql
/**
 * ...
 * @param p_user_id
 * @return User first name
 * ...
```

Template Reference: _Note: since since the `@return` option is very similar to an [`@param`](#tag-param), it is recommended that it is included with parameters._

```md
{{#ifCond params '||' return}}
### Parameters
Name | Description
--- | ---
{{#each params}}
{{name}} | {{{description}}}
{{/each}}
{{#if return}}
*return* | {{return}}
{{/if}} {{! return}}
{{/ifCond}} {{! params or return}}
```

Result:

```md
### Parameters
Name | Description
--- | ---
p_user_id |
*return* | User first name
```


### <a name="constants"></a>Constants

Constants should be placed at the top of the package. There should only be one JavaDoc documentation area for constants. Constants are documented using the `@constant` tag.

Example:
```plsql
-- CONSTANTS
/**
 * @constant gc_color_red The css safe color for red
 * @constant gc_color_blue The css safe color for blue
 */

gc_color_red constant varchar2(10) := 'red';
gc_color_blue constant varchar2(10) := 'blue';
```

Template Reference: The `@constant` tag is referenced in the template as an array of objects. Each entry contains three attributes: `name`, `code`, `description`, `isPrivate`. The following example creates a header entry and a table of constants along with the code.

```md
{{#each constants}}
{{#if @first}}
## Constants

Name | Code | Description
--- | --- | ---{{/if}}{{! first}}
{{name}} | `{{{code}}}` | {{description}}{{/each}}
```

Result:

```md
## Constants

Name | Code | Description
--- | --- | ---
gc_color_red | `gc_color_red constant varchar2(10) := 'red';` | The css safe color for red
gc_color_blue | `gc_color_blue constant varchar2(10) := 'blue';` | The css safe color for blue
```

### <a name="types"></a>Types

Types are very similar to [constants](#constants). They should be placed at the top of the package. There should only be one JavaDoc documentation area for constants. Types are documented using the `@type` tag.

Example:
```plsql
-- TYPES
/**
 * @type rec_param Some custom record
 * @type tab_param Table of custom record
 */
type rec_param is record(
  name varchar2(255),
  val varchar2(4000));

type tab_param is table of rec_param index by binary_integer;
```

Template Reference: The `@type` tag is referenced in the template as an array of objects. Each entry contains three attributes: `name`, `code`, `description`, `isPrivate`. The following example creates a header entry and a table of types along with the code. Note: types may contain multiline blocks of code. This does not work well with markdown tables. To get around this issue it is recommended to use the notation shown in the example.

```md
{{#each types}}
{{#if @first}}
## Types

Name | Code | Description
--- | --- | ---{{/if}}{{! first}}
{{name}} | <pre>{{{lineBreakToBr code}}}</pre> | {{description}}{{/each}}
```

Result:

```md
## Types

Name | Code | Description
--- | --- | ---
rec_param | <pre>type rec_param is record(<br />  name varchar2(255),<br />  val varchar2(4000));</pre> | Some custom record
tab_param | <pre>type tab_param is table of rec_param index by binary_integer;</pre> | Table of custom record

```




## Table of Contents (TOC)

If you want to create a TOC specify a template in the [config](#docs/config.json) file. The following objects are available in for the TOC template:

Name | Description
--- | ---
`files` | Array of files. (description below)
`files[].name` | Name of entity
`files[].fileName` | Full file name, including extension
`projectName` | Name of the project as defined in [`config.json`](#docs/config.json)

The [`templates`](/templates) folder contains an example [`toc.md`](/templates/toc.md) file.
