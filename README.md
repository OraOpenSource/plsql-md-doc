# PLSQL to Markdown Documenter

** THIS PROJECT IS IN ALPHA STATE - DO NOT USE **


## Install, Setup, and Updates

### Install

You only need once instance of PL/SQL to MD on your system as the configuration can handle multiple projects.

```bash
git clone https://github.com/OraOpenSource/plsql-md-doc
cd plsql-md-doc
npm install
```

### Setup

By default a `config.json` file is created. Please review the [`config.json`](/docs/config.json.md) docs before editing.

### Update

Go to the project folder
```bash
git update
npm install
```

## Documentation

















## Table of Contents (TOC)

If you want to create a TOC specify a template in the [config](#docs/config.json) file. The following objects are available in for the TOC template:

Name | Description
--- | ---
`files` | Array of files. (description below)
`files[].name` | Name of entity
`files[].fileName` | Full file name, including extension
`projectDispName` | Name of the project as defined in [`config.json`](#docs/config.json)

The [`templates`](/templates) folder contains an example [`toc.md`](/templates/toc.md) file.
