# Changesets

Pending release notes live in this folder, one markdown file per change. `npm run version` folds those files into `CHANGELOG.md` and sets `version` in the root `package.json`. The plugin generator reads that version when `--version` is omitted.

Do not add a version-bump file. Do not commit a pending note after `npm run version` has consumed it.
