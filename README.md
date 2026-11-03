# knowledge-skills

Harness-agnostic skills for the project that is open and the harness that is already running. Skill files describe the outcome and the evidence. `/learn` writes its guide to `.knowledge/{domain}/{topic}/guide.md` in that project.

Install the skills from this repo:

```bash
npx skills add <owner>/knowledge-skills
npx skills add <owner>/knowledge-skills --skill learn
```

`<owner>` is the owner of the git remote. This repository does not have a remote yet.

## Skills

| Folder | Invocation | Description |
| --- | --- | --- |
| `skills/learn/` | `/learn` | Runs desk research and writes a technical guide to `.knowledge/{domain}/{topic}/guide.md` in the open project. |
