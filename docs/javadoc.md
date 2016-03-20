# JavaDoc for PL/SQL

This document outlines all the JavaDoc options for PL/SQL as well as examples on how to reference them in a template.

- [Intro](#intro)
- [Ignore](#ignore)
- [Tags](#tags)
  - [`@author`](#tag-author)
  - [`@created`](#tag-created)
  - [`@example`](#tag-example)
  - [`@issue`](#tag-issue)
  - [`@param`](#tag-param)
  - [`@private`](#tag-private)
  - [`@return`](#tag-return)
- [`@constant`]s(#constants)
- [`@type`]s(#types)



## <a name ="intro"></a>Intro

[JavaDoc](http://www.oracle.com/technetwork/java/javase/documentation/index-137868.html) is a documentation notation created for Java applications. It can also be extended to other programming languages, in this case PL/SQL. The standard format for JavaDoc comments is:

```plsql
...
/**
 * Comments about a procedure or function
 *
 * Some tags (using the @tag notation)
 * @param p_x description of variable x
 * @param p_y description of variable y
 */
procedure some_proc(p_x in varchar2, p_y in varchar2)
...
```

For more examples of JavaDoc check out the [OOS-Utils](https://github.com/OraOpenSource/oos-utils) project.


## <a name ="ignore"></a>Ignore
Blocks of code can be ignored by using `/*!` instead of `/**` to start the block of documentation. If a block of code is ignored it won't be available for the template to process. Example:

```plsql
/**
 * Not ignored.
 */

/*!
 * Ignored.
 */
```

## <a name="tags"></a>Tags

### <a name="tag-author"></a>`@author`

`@author <author name>`

Example:
```plsql
/**
 * ...
 * @author Martin Giffy D'Souza
 * ...
 */
```

Template Reference:

```markdown
Author: {{author}}
```

Result:

```markdown
Author: Martin Giffy D'Souza
```

### <a name="tag-created"></a>`@created`

`@created` Is used to note the date the method was created.

Example: see [`@author`](#tag-author)

### <a name="tag-example"></a>`@example`

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
 */
```

Template:
```markdown
{{#if example}}
### Example
```plsql
{{{example}}}
\`\`\`
{{/if}}
```

Result:

```markdown
### Example
```plsql
select *
into l_temp
from dual;
\`\`\`
```

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
 */
```

Template Reference:
```markdown
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

```markdown
### Issues
Issue | Description
--- | ---
[12](/issues/12) |
[23](/issues/23) | Some major update
[46](/issues/46) |
```

### <a name="tag-param"></a>`@param`

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
 */
```

Template Reference:
```markdown
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

```markdown
### Parameters
Name | Description
--- | ---
p_app_id | APEX application ID
p_page_id | APEX page ID
p_session_id |
```

### <a name="tag-private"></a>`@private`

The `@private` tag is used on private methods. You can chose if these methods should be displayed by the template. Reference it in the template by using the `isPrivate` attribute.

Each element in [`types`](#types) and [`constants`](#constants) also contain the `isPrivate` boolean attribute. It is recommended to apply this tag to internal (package body) constants and types.

Example:
```plsql
/**
 * ...
 * @private
 * ...
 */
```

Template Reference:
```markdown
{{#each methods}}
{{#unless isPrivate}}

Items shown here will only be displayed if not private
{{/unless}}
{{/each}}
```

### <a name="tag-return"></a>`@return`

`@return` Is used to describe the object returned by a function.


Example:
```plsql
/**
 * ...
 * @param p_user_id
 * @return User first name
 * ...
 */
```

Template Reference: _Note: since the [`@return`](#tag-return) option is very similar to an [`@param`](#tag-param), it is recommended that it is included with parameters._

```markdown
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

```markdown
### Parameters
Name | Description
--- | ---
p_user_id |
*return* | User first name
```

## <a name="constants"></a>`@constant`s

Constants should be placed at the top of the package. There should only be one JavaDoc documentation area for constants. Constants are documented using the `@constant` tag and use the notation: `@constant <constant name> <optional description>`.

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

Template Reference: The `@constant` tag is referenced in the template as an array of objects. Each entry contains attributes: `name`, `code`, `description`, and `isPrivate`. The following example creates a header entry and a table of constants along with the code.

```markdown
{{#each constants}}
{{#if @first}}
## Constants

Name | Code | Description
--- | --- | ---{{/if}}{{! first}}
{{name}} | `{{{code}}}` | {{description}}{{/each}}
```

Result:

```markdown
## Constants

Name | Code | Description
--- | --- | ---
gc_color_red | `gc_color_red constant varchar2(10) := 'red';` | The css safe color for red
gc_color_blue | `gc_color_blue constant varchar2(10) := 'blue';` | The css safe color for blue
```

### <a name="types"></a>`@type`s

Types are very similar to [constants](#constants). They should be placed at the top of the package. There should only be one JavaDoc documentation area for constants. Types are documented using the `@type` tag and use the notation: `@type <type name> <optional description>`

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

Template Reference: The `@type` tag is referenced in the template as an array of objects. Each entry contains attributes: `name`, `code`, `description`, `isPrivate`. The following example creates a header entry and a table of types along with the code. Note: types may contain multiline blocks of code. This does not work well with markdown tables. To get around this issue it is recommended to use the notation shown in the example.

```markdown
{{#each types}}
{{#if @first}}
## Types

Name | Code | Description
--- | --- | ---{{/if}}{{! first}}
{{name}} | <pre>{{{lineBreakToBr code}}}</pre> | {{description}}{{/each}}
```

Result:

```markdown
## Types

Name | Code | Description
--- | --- | ---
rec_param | <pre>type rec_param is record(<br />  name varchar2(255),<br />  val varchar2(4000));</pre> | Some custom record
tab_param | <pre>type tab_param is table of rec_param index by binary_integer;</pre> | Table of custom record

```
