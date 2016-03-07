# PLSQL to Markdown Documenter

** THIS PROJECT IS IN ALPHA STATE - DO NOT USE **


## Documentation

### Tags

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

#### `@created`

`@created` Is used to note the date the method was created.

Example [`@author`](#tag-author)

#### `@example`

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
```md
{{#if example}}
### Example
```plsql
{{{example}}}
```
{{/if}}
```

Result:

```md
### Example
\`\`\`plsql
select *
into l_temp
from dual;
\`\`\`
```

#### `@issue`

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

## Code Setup

```plsql

/**
 * Method comments
 *
 *
 * Notes:
 *  -
 *
 * Related Tickets:
 *  - #25
 *
 * @author Martin Giffy D'Souza
 * @created 29-Dec-2015
 * @return true/false
 */
function is_developer
  return boolean
```
