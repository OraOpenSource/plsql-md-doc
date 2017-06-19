# {{toUpperCase name}}

{{#if types}}
- [Data Types](#types)
{{/if}}
{{#if constants}}
- [Constants](#constants)
{{/if}}
{{#each methods}}
- [{{toUpperCase name}} {{initCap type}}](#{{name}})
{{/each}}

{{! Types}}
{{#each types}}
{{#if @first}}
## Types<a name="types"></a>

Name | Code | Description
--- | --- | ---{{/if}}{{! first}}
{{name}} | <pre>{{{lineBreakToBr code}}}</pre> | {{{description}}}{{/each}}
{{! types}}

{{! Constants}}
{{#each constants}}
{{#if @first}}
## Constants<a name="constants"></a>

Name | Code | Description
--- | --- | ---{{/if}}{{! first}}
{{name}} | `{{{code}}}` | {{{description}}}{{/each}}
{{! constants}}


{{#each methods}}
{{#unless isPrivate}} {{! Don't show private methods}}
## {{toUpperCase name}} {{initCap type}}<a name="{{name}}"></a>


{{! Additional "p" tag required to wrap ul statements }}
<p>
{{{description.full}}}
</p>

### Syntax
```plsql
{{{header}}}
```

{{#ifCond params.length '||' return}}
### Parameters
Name | Description
--- | ---
{{#each params}}
`{{name}}` | {{{description}}}
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
