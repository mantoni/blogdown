# Blogdown

Generate HTML with [Mustache](http://mustache.github.com) and [Markdown](http://daringfireball.net/projects/markdown/syntax)

## Goals

 - Provide an easy way to combine Mustache templates with Markdown.
 - Generate static HTML using templates, partials and JSON data.
 - Generate only the files that changed, adding created and modified timestamps.
 - Plain text files only. No database. No setup.
 - Full test coverage

## Current Status

In development. Feedback, issues and pull requests welcome.

## Install

```
npm install -g blogdown
```

## Get Started

 - Create `src/template.mustache` with some HTML and `{{{md}}}` somewhere
 - Create `src/index.md` with some Markdown in it
 - Run `blogdown` from the root of the project directory and inspect the generated `site/index.html`

## JSON properties

Create a `template.json` file and reference the values from any mustache template with `{{some.property}}`.

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

## Item Structure

The model of each item that is passed to Mustache for rendering looks like this:

```js
{
  // File related meta information:
  file         : {
    path       : 'path/to/file', // without extension
    name       : 'file',         //     -- " --
    root       : '../..',        // relative path to root dir
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


## Credits

This project was build on top of the hard work of other people:

 - https://github.com/chjj/marked
 - https://github.com/janl/mustache.js
 - https://github.com/timrwood/moment

