# Skills Generator

Generate [Agent Skills](https://agentskills.io/home) from this project's own packages.

PLEASE STRICTLY FOLLOW THE BEST PRACTICES FOR SKILL: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices

- Focus on agents capabilities and practical usage patterns.
- Ignore user-facing guides, introductions, get-started, install guides, etc.
- Ignore content that LLM agents already confident about in their training data.
- Make the skill as concise as possible, avoid creating too many references.

## Skill Source

Skills are generated **only** from local packages under `packages/`. We do not maintain external source repositories (`sources/`) or sync skills from other projects (`vendor/`).

Each skill corresponds to a single local package or a coherent domain inside it:

- **Packages:** `cli`, `daemon`, `protocol`, `shared`, `utils`
- **Workflow:** Read package source/docs → Understand → Generate skills
- **Source:** `packages/{package}/`

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
        └── {skill-name}/              # One skill per package/domain
            ├── SKILL.md               # Index of the skill
            └── references/
                └── *.md               # Individual reference files
```

**Important:** A skill output directory (e.g. `.agents/skills/{skill-name}/`) should be named after the package or domain it describes. Keep names in `kebab-case`.

## Workflows

### Adding a New Skill

1. **Identify the package** under `packages/` that needs a skill.
2. **Read** its `README.md`, source code, and any inline documentation.
3. **Follow the generation guide** below to create the skill in `.agents/skills/{skill-name}/`.

### Updating an Existing Skill

1. **Check** changes in the corresponding package since the skill was last generated.
2. **Update** affected reference files based on the changes.
3. **Update** `SKILL.md` with the current package version and skills table if needed.

### General Instructions for Generation

- Focus on agents capabilities and practical usage patterns. For user-facing guides, introductions, get-started, or common knowledge that LLM agents already know, skip those contents.
- Categorize each reference into `core`, `features`, `best-practices`, `advanced`, etc., and prefix the reference file name with the category. Feel free to create more categories when needed to better organize the content.

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

// Some concise summary/context/introduction of the package

## Core References

| Topic           | Description                                       | Reference                                        |
| --------------- | ------------------------------------------------- | ------------------------------------------------ |
| Markdown Syntax | Slide separators, frontmatter, notes, code blocks | [core-syntax](references/core-syntax.md)         |
| Animations      | v-click, v-clicks, motion, transitions            | [core-animations](references/core-animations.md) |
| Headmatter      | Deck-wide configuration options                   | [core-headmatter](references/core-headmatter.md) |

## Features

### Feature a

| Topic             | Description              | Reference                                |
| ----------------- | ------------------------ | ---------------------------------------- |
| Feature A Editor  | Description of feature a | [feature-a](references/feature-a-foo.md) |
| Feature A Preview | Description of feature b | [feature-b](references/feature-a-bar.md) |

### Feature b

| Topic     | Description              | Reference                                |
| --------- | ------------------------ | ---------------------------------------- |
| Feature B | Description of feature b | [feature-b](references/feature-b-bar.md) |

// ...
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

1. **Rewrite for agents** - Don't copy docs verbatim; synthesize for LLM consumption.
2. **Be practical** - Focus on usage patterns and code examples.
3. **Be concise** - Remove fluff, keep essential information.
4. **One concept per file** - Split large topics into separate skill files.
5. **Include code** - Always provide working code examples.
6. **Explain why** - Not just how to use, but when and why.

## Supported Packages

Skills are generated from the following local packages:

- `packages/cli`
- `packages/daemon`
- `packages/protocol`
- `packages/shared`
- `packages/utils`
