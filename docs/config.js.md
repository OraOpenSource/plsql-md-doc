# `config.json` Configuration Options

When this project is installed a default `config.json` is generated in the project's folder. This document outlines the different configuration options.

## Outline

```json
{
  "<projectName>" : {
    "debug" : false,
    "folders" : {
      "srcPath" : "",
      "outputPath" : "",
      "template" : "<location of template to use for project>",
      "fileFilterRegexp" : "<regular expression to filter files from paths.src>"
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
`<projectName>.folders.srcPath` | required | Path to folder that contains the source files
`<projectName>.folders.outputPath` | required | Path to folder where `.md` files will reside.
`<projectName>.folders.template` | required | Full path to `.md` template file to use for the documentation
`<projectName>.folders.fileFilterRegexp | optional | Regular expression to filter files from `paths/src`

## Example

TODO;
