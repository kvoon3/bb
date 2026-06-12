# Skills Generator

Generate [Agent Skills](https://agentskills.io/home) from this project's own packages.

PLEASE STRICTLY FOLLOW THE BEST PRACTICES FOR SKILL: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

- Focus on agents capabilities and practical usage patterns.
- Ignore user-facing guides, introductions, get-started, install guides, etc.
- Ignore content that LLM agents already confident about in their training data.
- Make the skill as concise as possible, avoid creating too many references.

## Skill Source

Skills are generated **only** from local packages under `packages/`. We do not maintain external source repositories (`sources/`) or sync skills from other projects (`vendor/`).

Each skill should represent a **user-facing workflow or role**, not necessarily one package. Ask: "What does the user want to accomplish?" before deciding what to generate.

- **Packages:** `cli`, `daemon`, `protocol`, `shared`, `utils`
- **Workflow:** Read package source/docs → Understand user tasks → Generate skills
- **Source:** `packages/{package}/`

## What to Include and What to Skip

### Include

- How to install or run the project's user-facing tools.
- Commands and options the user will actually type.
- Background tasks, lifecycle management, and troubleshooting steps.
- Error messages and what to do about them.

### Skip

- Internal packages that users do not interact with directly (for example `shared`, `utils`, `protocol`).
- Internal types, constants, or implementation details unless they are required to use a public API.
- Code that is only useful when developing this repository itself.

## Repository Structure

```
.
├── packages/                          # Source of truth for all skills
│   └── {package}/
│       ├── src/                       # Package source code
│       ├── README.md                  # Package-level documentation
│       └── ...
│
└── .agents/                           # Output directory
    └── skills/
        └── {skill-name}/              # One skill per user workflow
            ├── SKILL.md               # Index of the skill
            └── references/
                └── *.md               # Individual reference files
```

**Important:** A skill output directory (e.g. `.agents/skills/{skill-name}/`) should be named after the workflow or domain it describes. Keep names in `kebab-case`.

## Workflows

### Adding a New Skill

1. **Identify the user task** the skill should help with.
2. **Find the package(s)** under `packages/` that implement that task.
3. **Read** its `README.md`, source code, and any inline documentation.
4. **Follow the generation guide** below to create the skill in `.agents/skills/{skill-name}/`.

### Updating an Existing Skill

1. **Check** changes in the corresponding package since the skill was last generated.
2. **Update** affected reference files based on the changes.
3. **Update** `SKILL.md` with the current package version and skills table if needed.

### General Instructions for Generation

- Focus on user capabilities and practical usage patterns. For user-facing guides, introductions, get-started, or common knowledge that LLM agents already know, skip those contents.
- Categorize each reference into `core`, `features`, `best-practices`, `advanced`, etc., and prefix the reference file name with the category. Feel free to create more categories when needed to better organize the content.
- A `core-*` reference should cover something the user must know to get started.
- A `features-*` reference should cover a specific task or command group.
- A `best-practices-*` reference should cover lifecycle, troubleshooting, and common pitfalls.
- An `advanced-*` reference should cover embedding, scripting, or less common use cases.

## File Formats

### `SKILL.md`

Index file listing all references with brief descriptions. Names should be in `kebab-case`.

The version should be the date of the last generation.

Also record the version of the package when the skill was generated.

```markdown
---
name: { name }
description: { description }
metadata:
  author: Kevin Kwong
  version: '2026.1.1'
  source: Generated from local package `packages/{package}`
---

> The skill is based on `{package}` v{version}, generated at {date}.

// Concise summary of what the user can do with this skill

## Core References

| Topic        | Description                         | Reference                                            |
| ------------ | ----------------------------------- | ---------------------------------------------------- |
| Install      | How to install the CLI              | [core-install](references/core-install.md)           |
| Start Daemon | How to start the background service | [core-start-daemon](references/core-start-daemon.md) |
| Commands     | Global options and command overview | [core-commands](references/core-commands.md)         |

## Features

### Bookmarks

| Topic             | Description                                              | Reference                                                                |
| ----------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Bookmark Commands | Read, search, create, update, move, and remove bookmarks | [features-bookmarks-commands](references/features-bookmarks-commands.md) |

## Best Practices

| Topic                     | Description                                            | Reference                                                                                          |
| ------------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Daemon Lifecycle          | Start, stop, and keep the daemon running               | [best-practices-daemon-lifecycle](references/best-practices-daemon-lifecycle.md)                   |
| Extension Troubleshooting | What to do when the browser extension is not connected | [best-practices-extension-troubleshooting](references/best-practices-extension-troubleshooting.md) |
```

### `references/*.md`

Individual skill files. One concept per file.

At the end of the file, include the reference links to the source documentation or source files.

```markdown
---
name: { name }
description: { description }
---

# {Concept Name}

Brief description of what this skill covers.

## Usage

Code examples and practical patterns.

## Key Points

- Important detail 1
- Important detail 2

<!--
Source references:
- packages/{package}/src/...
- packages/{package}/README.md
-->
```

## Writing Guidelines

When generating skills:

1. **Write for the user, not for the codebase** - Describe what the user types and sees, not internal architecture.
2. **Start with installation and setup** - If the project has a CLI or binary, show how to install it first.
3. **Cover background tasks** - If a service needs to stay running, explain how to start it as a background task.
4. **Cover troubleshooting** - Include common errors and the exact fix, including external prerequisites such as browser extensions.
5. **Be practical** - Focus on usage patterns and code examples.
6. **Be concise** - Remove fluff, keep essential information.
7. **One concept per file** - Split large topics into separate skill files.
8. **Include code** - Always provide working code examples.
9. **Explain why** - Not just how to use, but when and why.

## Development-Only Skills

The `.agents/skills/` directory may already contain skills used for developing this repository itself (for example `antfu`, `pnpm`, `tsdown`, `vite`, `vitest`). These are **not** generated by this workflow and are not intended for downstream consumers.

Mark development-only skills as internal so they are hidden from `npx skills add --list` and `--all` by default:

```yaml
metadata:
  internal: true
```

Internal skills are only visible and installable when `INSTALL_INTERNAL_SKILLS=1` is set.

## Supported Packages

Skills are generated from the following local packages when they provide user-facing workflows:

- `packages/cli`
- `packages/daemon`

Internal packages (`shared`, `utils`, `protocol`) are generally not exposed as standalone skills.
