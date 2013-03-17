## Workflow

 - Scan source dir
 - Read .html / mustache, .json and .md files
 - Create partials object with html snippets and items array with json and markdown
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
    // Previous / next item in same folder, or null if first / last:
    previous : { ... },
    next     : { ... },

    // Hash where key is the name of a sub folder:
    'a-folder' : {
      // Hash where key is the fileName of a file:
      map : {
        'a-file' : { ... },
        ...
      },

      // Array of above items, ordered by creation:
      list : [{ ... }, ...]
    }
  },

  // Arbitrary data:
  'any-property' : 'defined in a .json file'
}
```
