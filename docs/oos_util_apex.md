# OOS_UTIL_APEX

- [Data Types](#dataTypes)
- [Constants](#constants)
- [IS_DEVELOPER Function](#is_developer)
- [IS_DEVELOPER_YN Function](#is_developer_yn)
- [IS_SESSION_VALID Function](#is_session_valid)
- [IS_SESSION_VALID_YN Function](#is_session_valid_yn)
- [CREATE_SESSION Procedure](#create_session)
- [TRIM_PAGE_ITEMS Procedure](#trim_page_items)
- [IS_PAGE_ITEM_RENDERED Function](#is_page_item_rendered)



## <a name="constants"></a>Constants

Name | Code | Description
--- | --- | ---
gc_color_red | `gc_color_red constant varchar2(10) := 'red';` | The css safe color for red
gc_color_blue | `gc_color_blue constant varchar2(10) := 'blue';` | The css safe color for blue


## <a name="types"></a>Types

Name | Code | Description
--- | --- | ---
rec_param | <pre><code>type rec_param is record(<br />  name varchar2(255),<br />  val varchar2(4000));</code></pre> | todo rec_param
tab_param | <pre><code>type tab_param is table of rec_param index by binary_integer;</code></pre> | todo tab_param


## <a name="is_developer"></a>IS_DEVELOPER Function


<p>
[object Object]
</p>
Author: Martin Giffy D&#x27;Souza

### Syntax
```plsql
function is_developer
  return boolean
```

 


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




## <a name="is_developer_yn"></a>IS_DEVELOPER_YN Function


<p>
[object Object]
</p>
Author: Martin Giffy D&#x27;Souza

### Syntax
```plsql
function is_developer_yn
  return varchar2
```

 


### Parameters
Name | Description
--- | ---
*return* | Y or N
 
 






## <a name="is_session_valid"></a>IS_SESSION_VALID Function


<p>
[object Object]
</p>
Author: Martin Giffy D&#x27;Souza

### Syntax
```plsql
function is_session_valid(
  p_session_id in apex_workspace_sessions.apex_session_id%type)
  return boolean
```

 


### Parameters
Name | Description
--- | ---
p_session_id | APEX session ID
*return* | true/false
 
 






## <a name="is_session_valid_yn"></a>IS_SESSION_VALID_YN Function


<p>
[object Object]
</p>
Author: Martin Giffy D&#x27;Souza

### Syntax
```plsql
function is_session_valid_yn(
  p_session_id in apex_workspace_sessions.apex_session_id%type)
  return varchar2
```

 


### Parameters
Name | Description
--- | ---
p_session_id | APEX session ID
*return* | Y/N
 
 






## <a name="create_session"></a>CREATE_SESSION Procedure


<p>
[object Object]
</p>
Author: Martin Giffy D&#x27;Souza

### Syntax
```plsql
procedure create_session(
  p_app_id in apex_applications.application_id%type,
  p_user_name in apex_workspace_sessions.user_name%type,
  p_page_id in apex_application_pages.page_id%type default null,
  p_session_id in apex_workspace_sessions.apex_session_id%type default null)
```

 


### Parameters
Name | Description
--- | ---
p_app_id | 
p_user_name | 
p_page_id | Page to try and register for post login. Recommended to leave null
p_session_id | Session to re-join. Recommended leave null
 
 






## <a name="trim_page_items"></a>TRIM_PAGE_ITEMS Procedure


<p>
[object Object]
</p>
Author: Martin Giffy D&#x27;Souza

### Syntax
```plsql
procedure trim_page_items(
  p_page_id in apex_application_pages.page_id%type default apex_application.g_flow_step_id)
```

 


### Parameters
Name | Description
--- | ---
p_page_id | Items on this page will be trimmed.
 
 






## <a name="is_page_item_rendered"></a>IS_PAGE_ITEM_RENDERED Function


<p>
[object Object]
</p>
Author: Daniel Hochleitner

### Syntax
```plsql
function is_page_item_rendered(
  p_item_name in apex_application_page_items.item_name%type)
  return boolean
```

 


### Parameters
Name | Description
--- | ---
*return* | true/false
 
 






 
