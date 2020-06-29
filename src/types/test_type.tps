/**
 * A SQL Object type which holds variables and can be used within the SQL engine
 *
 * The variables and function will not be documented. Only the global description has been included
 */
create or replace type test_type force as object (

   test_varchar      varchar2(4000)
  ,test_number       number

) not final;
