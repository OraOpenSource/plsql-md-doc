# TEST_PACKAGE

- [Data Types](#types)

- [Constants](#constants)

- [Variables](#variables)

- [Exceptions](#exceptions)

- [IS_DEVELOPER Function](#is_developer)

## Types<a name="types"></a>

Name | Code | Description
--- | --- | ---
g_table_type | <pre>type g_table_type is table of pls_integer index by varchar2(30);</pre> | A test table type

## Variables<a name="variables"></a>

Name | Code | Description
--- | --- | ---
g_string_var | <pre>g_string_var       varchar2(100) default 'Test variable';</pre> | A test variable which is a string and have a limited amount of characters
g_number_var | <pre>g_number_var       number        := 123456;</pre> | A number variable without a restriction and using the &#x27;:&#x3D;&#x27; as assignment target
g_number_limited | <pre>g_number_limited   number(10, 1) default 10.1;</pre> | A number which needs to have 1 decimal
g_test_object | <pre>g_test_object      test_object   default new test_object();</pre> | A variable of the Object type: &quot;test_object&quot;
g_table_type_var | <pre>g_table_type_var   g_table_type;</pre> | A variable which if of table type: &quot;g_table_type&quot;

## Constants<a name="constants"></a>

Name | Code | Description
--- | --- | ---
gc_test_constant | <pre>gc_test_constant    constant varchar2(30) := 'Test constant';</pre> | A string test constant variable
gc_another_const | <pre>gc_another_const    constant number(10,1) default 10.1;</pre> | A number test constant variable using &#x27;default&#x27; as assignment target

## Exceptions<a name="exceptions"></a>

Name | Code | Description
--- | --- | ---
g_no_data_found | <pre>g_no_data_found   exception;</pre> | A new no_data_found exception!




 
## IS_DEVELOPER Function<a name="is_developer"></a>


<p>
<p>Returns true/false if APEX developer is enable<br />Supports both APEX 4 and 5 formats</p>
</p>

### Syntax
```plsql
function is_developer return boolean
```

### Parameters
Name | Description
--- | ---
`p_app_id` | APEX application ID
`p_page_id` | APEX page ID
`p_session_id` | 
*return* | true/false
 
 


### Example
```plsql
select *
into l_temp
from dual;
```

### Properties
Name | Description
--- | ---
Author | Martin Giffy D''Souza
Created | 29-Dec-2015


 