# Harness templates

Skill bodies stay in `skills/<name>/SKILL.md`. Each harness has a note in `templates/harness/` and, when it needs files, a manifest under `templates/plugin/`. Copy those files. Do not invent a second layout.

The filler is `node scripts/skill-to-plugin.mjs`. Tokens are `{{pluginName}}`, `{{displayName}}`, `{{version}}`, and `{{pluginDescription}}`.

## Local map

| Note | Files this repo copies |
| --- | --- |
| `templates/harness/claude-code.md` | `templates/plugin/.claude-plugin/` |
| `templates/harness/cursor.md` | `templates/plugin/.cursor-plugin/plugin.json` |
| `templates/harness/codex.md` | `templates/plugin/.codex-plugin/plugin.json` and `templates/plugin/.agents/plugins/marketplace.json` |
| `templates/harness/copilot-cli.md` | same files as `claude-code.md` |
| `templates/harness/grok-build.md` | the manifests already under `templates/plugin/`. Do not add a new directory |

## Shared rules

`{{version}}` comes from the root `package.json`. Changesets writes `CHANGELOG.md` and bumps that version. Do not keep a separate version list.
