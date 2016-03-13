# PLSQL to Markdown Documenter

** THIS PROJECT IS IN ALPHA STATE - DO NOT USE **

- [Tags](#tags)
  - [`@author`](#tag-author)
  - [`@created`](#tag-created)
  - [`@example`](#tag-example)
  - [`@issue`](#tag-issue)
  - [`@param`](#tag-param)
  - [`@return`](#tag-return)

## Documentation

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


-- TODO mdsouza: document handBars extensions
