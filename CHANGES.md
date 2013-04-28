# Changes

## v0.6.0

- Drafts: New files have timetamps set to 'DRAFT' initially. Once blogdown gets
  invoked with `--publish` the timestamps are set to that moment.
- JSON: Support newlines and indentation in strings
- JSON: Resolve multiple placeholders in single property
- Fix: Remove dots from file names if they are generated from another property
- Fix: Don't lower case file names
