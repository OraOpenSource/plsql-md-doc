# {{toUpperCase packageName}}

{{#each dataTypes}}
- [Data Types](#dataTypes)
{{/each}}
{{#each constants}}
- [Constants](#constants)
{{/each}}
{{#each methods}}
- [{{toUpperCase name}} {{initCap type}}](#{{name}})
{{/each}}

{{! Constants}}
{{#each constants}}
{{#if @first}}
## Constants
{{/if}}{{! first}}

```plsql
{{code}}
```

{{#if params}}
Constant | Description
--- | ---
{{/if}}
{{#each params}}
{{name}} | {{{description}}}
{{/each}} {{! params}}

{{/each}} {{! constants}}

{{! TYPES }}
{{#each dataTypes}}
{{#if @first}}
## Data Types
{{/if}}{{! first}}
{{#each types}}
### {{typeName}}
{{typeDesc}}
```plsql
{{typeCode}}
```
{{/each}}

{{/each}} {{! dataTypes}}


{{#each methods}}
## <a name="{{name}}"></a>{{toUpperCase name}} {{initCap type}}


{{! Additional "p" tag required to wrap ul statements }}
<p>
{{{description}}}
</p>

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


{{#if displayParams}}
### Parameters
Name | Description
--- | ---
{{#each params}}
{{name}} | {{{description}}}
{{/each}}
{{#if return}}
*return* | {{return}}
{{/if}} {{! return}}
{{/if}} {{! displayParams}}


{{#if example}}
### Example

{{{example}}}
{{/if}}




{{/each}} {{! methods }}
