# Changes

## v0.6.2

- Fixed `publish` flag

## v0.6.1

- Links to "a/index.html" now refer to "a/"

## v0.6.0

- Drafts: New files have timetamps set to 'DRAFT' initially. Once blogdown is
  invoked with `--publish` the actual timestamps are set.
- A global `publish` flag is made available in all pages
- Only writing the meta file when called with `--publish`
- Always generate all the output files and compare them with what already
  exists in the target directory. This made `--force` obsolete.
- JSON: Support newlines and indentation in strings:

```
{
  "description" : "Sometimes 80 characters are just too narrow, and
                   horizontal scrolling sucks"
}
```

- JSON: Resolve multiple placeholders in single property
- Fix: Remove dots from file names if they are generated from another property
- Fix: Don't lower case file names that are not generated from another property
