# `config.json` Configuration Options

When this project is installed a default `config.json` is generated in the project's folder. This document outlines the different configuration options.

## Outline

```json
{
  "<projectName>" : {
    "debug" : false,
    "folders" : {
      "output" : {
        "path" : "/Users/giffy/Documents/GitHub/oraopensource/oos-utils/docs"
      },
      "source" : {
        "path" : "/Users/giffy/Documents/GitHub/oraopensource/oos-utils/source/packages",
        "fileFilterRegexp" : "\\.pk(b|s)$"
      },
      "template" : "/Users/giffy/Documents/GitHub/oraopensource/plsql-md-doc/templates/package.md"
    },
    "projectDispName" : "",
    "toc" : {
      "fileName" : "index.md",
      "template" : "<fill path to template file>"
    }
  }
}
```

Description

Parameter | Required | Description
--- | --- | ---
`<projectName>` | required | Unique name of the project.
`<projectName>.debug` | optional | Default: `false`. Run app in debug mode.
`<projectName>.folders` | required | single JSON object array of objects. Use the an array if the project has multiple folders to process.
`<projectName>.folders.output` | required | JSON object for output information
`<projectName>.folders.output.delete` | optional | Boolean to delete contents in folder. Default `false`.
`<projectName>.folders.output.path` | required | Path to folder where `.md` files will reside.
`<projectName>.folders.source` | required |
`<projectName>.folders.source.path` | required | Path to folder that contains the source files
`<projectName>.folders.source.fileFilterRegexp` | optional | Regular expression to filter files from `paths/src`
`<projectName>.folders.template` | required | Full path to `.md` template file to use for the documentation.
`<projectName>.projectDispName` | optional | Used for the TOC. If none provided, then the root `projectName` in the config file will be used.
`<projectName>.toc` | optional | Table Of Contents (TOC) file. The `template` attribute is required to trigger generation.
`<projectName>.toc.fileName` | optional | Name of TOC file. Default `index.md`
`<projectName>.toc.template` | required | Full path to `.md` template file to use for the index


## Example

TODO;
