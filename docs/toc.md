# Table of Contents (TOC)

If you want to create a TOC specify a template in the [config](config.json.md) file. The following objects are available in for the TOC template:

Name | Description
--- | ---
`files` | Array of files. (description below)
`files[].name` | Name of entity
`files[].fileName` | Full file name, including extension
`projectDispName` | Name of the project as defined in [`config.json`](config.json.md)

The [`templates`](../templates) folder contains an example [`toc.md`](../templates/toc.md) file.
