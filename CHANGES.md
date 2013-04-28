# Changes

## v0.6.0

- Drafts: New files have timetamps set to 'DRAFT' initially. Once blogdown gets
  invoked with `--publish` the timestamps are set to that moment.
- A global `publish` flag is available to all files which allows to exclude
  some things from rendering when testing the site locally (e.g. analytics
  scripts)
- Always generate all the output files and compare them with what already
  exists in the target directory. This makes `--force` obsolete, hence it was
  removed.
- JSON: Support newlines and indentation in strings. This is now valid:
  ```
  {
    "description" : "Sometimes 80 characters are just too narrow, and
                     horizontal scrolling sucks"
  }
  ```
- JSON: Resolve multiple placeholders in single property
- Fix: Remove dots from file names if they are generated from another property
- Fix: Don't lower case file names that are not generated from another property
