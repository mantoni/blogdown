# Changes

## 1.0.0

- Add contributor
- Add author email
- Add shields
- Add license
- Remove `v` from version names in changelog
- Use @studio/changes and remove Makefile
- Replace urun and utest with mocha
- Bump dependencies and use `^` instead of `~`
- Use Sinon 2
- Fix linter formating issues (Maksim Lin)
- Fix all uses of timezone offset string (Maksim Lin)
- Add doc for global props in templates (Maksim Lin)

    > Also add doc for previous custom output folder 'siteDir' config

- support accessing props within blogdown.json global (Maksim Lin)

    > Mustache templates can now access via the "blogdown.*" namespace
    > properties defined within the blogdown.json global file.

- Zero-pad timezone offset in test timestamp strings (Maksim Lin)
- Provide global option to set output dir (#3) (Maksim Lin)
- Use eslint and fix linter issues
- Add travis config
- Simplify .gitignore
- Add package-lock.json
- Save package.json with npm
- Handle readFolders error
- Fix tests to use the TZ they are executing in (Maksim Lin)
- Simplified file-reader implementation by using named callbacks

    > - Named callbacks where introduced by listen.js v0.4.0
    > - Added CHANGES.md to packaged files

- Added getter for suffix on files

## 0.7.0

- Write JSON at the top of Markdown and HTML files

## 0.6.2

- Fixed `publish` flag
- Not including `publish` flag in content sha

## 0.6.1

- Links to "a/index.html" now refer to "a/"

## 0.6.0

- Drafts: New files have timetamps set to 'DRAFT' initially. Once blogdown is
  invoked with `--publish` the actual timestamps are set.
- A global `publish` flag is made available in all pages
- Only writing the meta file when called with `--publish`
- Always generate all the output files and compare them with what already
  exists in the target directory. This made `--force` obsolete.
- JSON: Support newlines and indentation in strings:

```json
{
  "description" : "Sometimes 80 characters are just too narrow, and
                   horizontal scrolling sucks"
}
```

- JSON: Resolve multiple placeholders in single property
- Fix: Remove dots from file names if they are generated from another property
- Fix: Don't lower case file names that are not generated from another property
