create or replace package test_package_sub is

  --CONSTANTS
  /**
   * @constant gc_test_constant            A string test constant variable
   * @constant gc_another_const            A number test constant variable using 'default' as assignment target
   */
  gc_test_constant    constant varchar2(30) := 'Test constant';
  gc_another_const    constant number(10,1) default 10.1;
  
  --TYPES
  /**
   * @type g_table_type       A test table type
   */
  type g_table_type is table of pls_integer index by varchar2(30);
  
  -- VARIABLES
  /**
   * @var g_string_var          A test variable which is a string and have a limited amount of characters
   * @var g_number_var          A number variable without a restriction and using the ':=' as assignment target
   * @var g_number_limited      A number which needs to have 1 decimal
   * @var g_test_object         A variable of the Object type: "test_object"
   * @var g_table_type_var      A variable which if of table type: "g_table_type"
   */
  g_string_var       varchar2(100) default 'Test variable';
  g_number_var       number        := 123456;
  g_number_limited   number(10, 1) default 10.1;
  g_test_object      test_object   default new test_object();
  g_table_type_var   g_table_type;
  
  -- EXCEPTIONS
  /**
   * @exception g_no_data_found  A new no_data_found exception!
   */
  g_no_data_found   exception;
  pragma            exception_init(g_no_data_found, -20001);
  
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
  function is_developer return boolean;
  
end test_package_sub;
/
