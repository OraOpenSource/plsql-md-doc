# PLSQL to Markdown Documenter

This tool will generate [markdown](https://daringfireball.net/projects/markdown/) from PL/SQL files which use [JavaDoc](http://www.oracle.com/technetwork/java/javase/documentation/index-137868.html) documentation notation. The markdown content is generated using customizable templates which leverage [Handlebars](http://handlebarsjs.com/) for string substitution.

The purpose is to standardize PL/SQL documentation techniques and easily create markdown files which are automatically displayed in popular git repositories such as [GitHub](https://github.com) and [BitBucket](https://bitbucket.org/).

A demo can be found [here](/docs/demo.md) and was not included in this file as it generates markdown. The [OOS-Utils](https://github.com/OraOpenSource/oos-utils) project leverages this tool and its documentation is generated using this.


## Documentation

All the documentation is available in the [docs](/docs) folder.


## Install, Setup, and Updates

### Install

You only need once instance of PL/SQL to MD on your system as the configuration can handle multiple projects.

```bash
git clone https://github.com/OraOpenSource/plsql-md-doc
cd plsql-md-doc
npm install
```

### Setup

By default a `config.json` file is created. Review the [`config.json`](/docs/config.json.md) docs before editing.

### Update

Go to the project folder
```bash
git update
npm install
```

## Run
To run: `node app <projectName>`.
