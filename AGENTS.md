# Agent guide

Short agent guide for this repository. Fifteen concepts at most. When a rule changes, edit or merge a line. Do not paste chat into this file.

1. Skills live in `skills/<name>/SKILL.md`. Instruction text stays in English. Chat replies follow the user-language section of the skill that is running.
2. Guide prose for `/learn` follows the Writing section of that skill. The guide body defaults to English. Do not point the skill at a personal style file.
3. Every commit in this repository uses Conventional Commits: `type(scope): summary in the imperative`. Scope is optional and comes from the change. Subject only, technical English, 72 characters at most. One domain per commit.
4. Types: `feat`, `fix`, `refactor`, `perf`, `chore`, `docs`, `test`.
5. Do not commit or push without an explicit request. Do not change git config. Do not use `--force`. Use `--force-with-lease` only when the user authorizes rewriting that branch.
6. Author and committer: Paulo Serpa `<pauloserpa.r@gmail.com>`. Pass both with `git -c` on the command. Do not write that into git config.
7. Do not name an external project, repository, or brand in skill text.
8. Do not reintroduce removed harnesses, OpenCode, hooks, or plugin-bootstrap.
9. The generator copies only what exists in `templates/harness/` and `templates/plugin/`. Do not invent another manifest layout.
10. `/learn` writes the guide to `.knowledge/{domain}/{topic}/guide.md` in the open project. That folder is listed in `.gitignore` and `.cursorindexingignore`. Do not store the guide under `skills/`.
11. When you add, remove, or rename a skill, update the skill table in `README.md` and the group in `skills.sh.json` in the same change.
12. Version, changelog, and tag come from Changesets, in `.changeset/`. Do not publish a package. Do not add a version-bump file.
13. After the tag, install the skills from this repository with the CLI, telemetry on, so they appear on the page. Remove that install when it existed only for the publish.
