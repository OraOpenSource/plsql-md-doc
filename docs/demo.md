# Demo

Contents from a PL/SQL file:

```plsql
...
/**
 * Returns true/false if APEX developer is enable
 * Supports both APEX 4 and 5 formats
 *
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

The above documentation will be converted to: _Note: this is all customizable using templates._

## <a name="is_developer"></a>IS_DEVELOPER Function

<p>
<p>Returns true/false if APEX developer is enable<br />Supports both APEX 4 and 5 formats</p>
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
