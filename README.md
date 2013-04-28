# Blogdown

Generate HTML with [Mustache](http://mustache.github.com) and [Markdown](http://daringfireball.net/projects/markdown/syntax)

[Read the blog post](http://maxantoni.de/blog/2013/04/create-project-sites-with-markdown.html).

## Goals

 - Provide an easy way to combine Mustache templates with Markdown.
 - Generate static HTML using templates, partials and JSON data.
 - Generate only the files that changed, adding created and modified timestamps.
 - Plain text files only. No database. No setup.
 - Full test coverage

## Current Status

Good enough to give it a shot. Feedback, issues and pull requests welcome.

## Install

```
$ npm install -g blogdown
```

## Get Started

 - Create `src/template.mustache` with HTML and a `{{{md}}}` placeholder somewhere
 - Create `src/index.md` with Markdown in it
 - Run `blogdown` from the root of the project directory and inspect the generated `site/index.html`

## Templates and JSON properties

 - The `template.mustache` file in each directory will be used as the mustache template unless an item has a `.html` or `.mustache` template defined.
 - The `template.json` file can be created to inherit JSON properties into each item in the same folder and sub folders
 - A `template` folder can be created and filled with mustache templates that will be used as partials. Reference the partials with `{{>partial-name}}`.
 - If JSON files are created in the template folder, the content is merged into the `template.json` using the file name as the key.

## Config file

Global configs are stored in a `blogdown.json` file in the root of your project.
The file defines date formats and lists of files.

## Date formats

Blogdown uses [moment.js](http://momentjs.com) for date formatting. A list of date formats can be configured in the config file:

```
"dates"   : {
  "long"  : "ddd, DD. MMMM YYYY - HH:mm:ss",
  "short" : "DD.MM.YYYY HH:mm:ss",
  // ...
}
```

The mustache templates can refer to the dates like this:

 - `{{dates.long.created}}` for the long format showing the file creation date and time
 - `{{dates.long.modified}}` for the long format showing the file's last modified date and time
 - `{{dates.short.created}}`
 - etc ...

## Lists

You can specify custom lists of files in the global config files:

```
"lists"      : {
  "articles" : {
    "filter" : "file.path = blog/*",
    "sort"   : "file.created DESC",
    "limit"  : 25
  }
}
```

An array of items with the configured name will be available in the mustache template:

```
{{#articles}}
  <a href="{{{file.path}}}"><h3>{{heading}}</h3></a>
  <p>{{tldr}}</p>
{{/articles}}
```

This will show 25 items from the blog folder ordered newest files first.

## Changing the file name

By default, items are generated with their file names. If you want to use a different file name, you need to put `"file" : { "name" : "different" }` in the corresponding `.json` file.

## Item Structure

The model of each item that is passed to Mustache for rendering looks like this:

```js
{
  // File related meta information:
  file         : {
    path       : 'path/to/file.html',
    name       : 'file',  // without the extension
    root       : '../..', // relative path to root dir
    created    : '2013-03-17T22:01:53+01:00',
    modified   : '2013-03-17T22:01:53+01:00',
    active     : true // if this file is currently rendered, otherwise false
  },

  // Markdown:
  md           : '<p>parsed from markdown</p>',

  // Formatted dates according to config in "blogdown.json":
  dates        : {
    article    : {
      created  : 'Sun, 31. March 2013 - 17:24 CET',
      modified : 'Sun, 31. March 2013 - 17:24 CET'
    }
  },

  // Lists of items according to config in "blogdown.json":
  newArticles  : [{ ... }, { ... }],
  coolProjects : [{ ... }, { ... }],

  anyProperty  : 'defined in a .json file'
}
```

## Command line options

To get more information about which templates and items where found and which
properties they contained, use `--debug` (or `-d`).

```
$ blogdown --debug
$ blogdown -d
```

## Credits

This project was build on top of the hard work of other people:

 - https://github.com/chjj/marked
 - https://github.com/janl/mustache.js
 - https://github.com/timrwood/moment

