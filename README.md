# Blogdown

Generate HTML with Mustache and Markdown

## Goals

 - Provide an easy way to combine Mustache templates with Markdown.
 - Generate static HTML using templates, partials and JSON data.
 - Generate only the files that changed, adding created and modified timestamps.
 - Plain text files only. No database. No setup.

## Current Status

Heavy development. Thinks will likely change a lot.
Feedback, issues and pull requests welcome.

## Install

```
npm install -g blogdown
```

## Usage

From within your web site project directory run:

```
blogdown
```

## Get Started

 - Create `src/template.mustache` with some HTML and `{{{md}}}` somewhere
 - Create `src/index.md` with some Markdown in it
 - Run `blogdown` and inspect the generated `site/index.html`

## Get Fancy

 - Create `src/index.json` with some JSON in it and access it from the template
 - Create `src/test.md`, run `blogdown` and see what's in `site/test.md`
 - Create `src/template/` with some `.mustache` files in it and use them as partials
 - Create `src/test.mustache` to override the template

## Item Structure

The internal model of each item that is passed to Mustache looks like this:

```js
{
  // File related meta information:
  meta       : {
    path     : 'path/to/file', // without extension
    fileName : 'file',         //     -- " --
    created  : '2013-03-17T22:01:53+01:00',
    modified : '2013-03-17T22:01:53+01:00'
  },

  // Links to other items:
  link : {
    previous : { ... }, // previous item in same folder
    next     : { ... },
    sibling  : [ ... ], // array, but also accessible by fileName
    child    : [ ... ]
  },

  html : '<html/>',
  md   : '<p>parsed from markdown</p>'
  any  : 'property defined in a .json file'
}
```
