# {{toUpperCase name}}

{{#if types}}
- [Data Types](#dataTypes)
{{/if}}
{{#if constants}}
- [Constants](#constants)
{{/if}}
{{#each methods}}
- [{{toUpperCase name}} {{initCap type}}](#{{name}})
{{/each}}


{{! Constants}}
{{#each constants}}
{{#if @first}}
## <a name="constants"></a>Constants

Name | Code | Description
--- | --- | ---{{/if}}{{! first}}
{{name}} | `{{{code}}}` | {{description}}{{/each}}
{{! constants}}


{{! Types}}
{{#each types}}
{{#if @first}}
## <a name="types"></a>Types

Name | Code | Description
--- | --- | ---{{/if}}{{! first}}
{{name}} | <pre>{{{lineBreakToBr code}}}</pre> | {{description}}{{/each}}
{{! types}}


{{#each methods}}
{{#unless isPrivate}} {{! Don't show private methods}}
## <a name="{{name}}"></a>{{toUpperCase name}} {{initCap type}}


{{! Additional "p" tag required to wrap ul statements }}
<p>
{{{description.full}}}
</p>
Author: {{author}}

### Syntax
```plsql
{{header}}
```

{{#if issues}}
### Tickets
Issue | Description
--- | ---
{{#each issues}}
[{{number}}](/issues/{{number}}) | {{description}}
{{/each}}
{{/if}} {{! issues}}


{{#ifCond params.length '||' return}}
### Parameters
Name | Description
--- | ---
{{#each params}}
{{name}} | {{{description}}}
{{/each}}
{{#if return}}
*return* | {{return}}
{{/if}} {{! return}}
{{/ifCond}} {{! displayParams}}


{{#if example}}
### Example
```plsql
{{{example}}}
```
{{/if}}



{{/unless}}
{{/each}} {{! methods }}
