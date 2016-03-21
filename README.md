# PLSQL to Markdown Documenter

This tool will generate [markdown](https://daringfireball.net/projects/markdown/) documentation files from PL/SQL files which use [JavaDoc](http://www.oracle.com/technetwork/java/javase/documentation/index-137868.html) notation. The generated markdown content is generated using customizable templates which leverage [Handlebars](http://handlebarsjs.com/) for string substitution.

The purpose is to standardize PL/SQL documentation techniques and easily create markdown files which are automatically displayed in popular git repositories such as [GitHub](https://github.com) and [BitBucket](https://bitbucket.org/).



## Demo

In a package file, add the following documentation above the method:

```plsql
...
/**
 * Returns true/false if APEX developer is enable
 * Supports both APEX 4 and 5 formats
 *
 * Notes:
 *  -
 * @issue #12 Initial creation
 * @issue 23 Some major update
 * @issue 46
 *
 * @example
 * select *
 * into l_temp
 * from dual;
 *
 * @param p_app_id APEX application ID
 * @param p_page_id APEX page ID
 * @param p_session_id
 *
 * @author Martin Giffy D''Souza
 * @created 29-Dec-2015
 * @return true/false
 */
function is_developer
  return boolean
as
begin
...
```

The above documentation will automatically be converted to:

## <a name="is_developer"></a>IS_DEVELOPER Function

<p>
<p>Returns true/false if APEX developer is enable<br />Supports both APEX 4 and 5 formats</p><p>Notes:<br /> -</p>
</p>
Author: Martin Giffy D&#x27;&#x27;Souza

### Syntax
```plsql
function is_developer
  return boolean
```

### Tickets
Issue | Description
--- | ---
[12](/issues/12) |
[23](/issues/23) | Some major update
[46](/issues/46) |

### Parameters
Name | Description
--- | ---
p_app_id | APEX application ID
p_page_id | APEX page ID
p_session_id |
*return* | true/false

### Example
```plsql
select *
into l_temp
from dual;
```

More demos can be found in the [OOS-Utils](https://github.com/OraOpenSource/oos-utils) project as it's using this tool to generate its documentation.



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
