# PL/SQL to Markdown Documenter

Converts PL/SQL JavaDoc documentation to markdown
This tool converts PL/SQL [JavaDoc](http://www.oracle.com/technetwork/java/javase/documentation/index-137868.html) documentation to [markdown](https://daringfireball.net/projects/markdown/). The markdown content is generated using customizable templates which leverage [Handlebars](http://handlebarsjs.com/) for string substitution.

The purpose is to standardize PL/SQL documentation techniques and easily create markdown files which are automatically displayed in popular git repositories such as [GitHub](https://github.com) and [BitBucket](https://bitbucket.org/).

A demo can be found [here](/docs/demo.md) and was not included in this file as it generates markdown. The [OOS-Utils](https://github.com/OraOpenSource/oos-utils) project leverages this tool and its documentation is generated using this.

To make it easier to use with your code, a set of [JavaDoc templates](/docs/javadoc-template.md) have been provided.


## Documentation

- [Recommended Docs](http://plsql-md-doc.readthedocs.org/en/latest/README/)
- MD [docs](/docs) folder


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
git fetch origin
git reset --hard origin/master
npm install
```

## Run
To run: `node app <projectName>`.
