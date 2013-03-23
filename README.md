## Workflow

 - Scan source dir
 - Read .html / .mustache, .md and .json files
 - Create partials object with html and items array with json and markdown
 - Scan "meta" dir
 - Read .json files and put existing timestamp in source items
 - Add timestamps to new items
 - Link previous and next items
 - Generate html pages into "site"

## Item

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
    next     : { ... }
  },

  html : '<html/>',
  md   : '<p>parsed from markdown</p>'
  any  : 'property defined in a .json file'
}
```
