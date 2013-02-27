## Workflow

 - Scan source dir
 - Read .html, .json and .md files
 - Create partials object with html snippets and items array with json and markdown
 - Scan target/meta dir
 - Read .json files and put existing timestamp in source items
 - Add timestamps to new items
 - Link previous and next items
 - Generate html pages into target/site

