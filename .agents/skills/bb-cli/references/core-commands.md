---
name: bb-cli-commands
description: Global options and command structure of the bb CLI.
---

# CLI Commands Overview

`bb` is built with `cac` and exposes a single global namespace.

## Global Options

Every command accepts these options:

```bash
bb --host <host>    # default: 127.0.0.1
bb --port <port>    # default: 31337
bb --json           # print raw JSON responses
```

## Installation

The CLI is published as `@kvoon/bb-cli` and provides the `bb` binary:

```bash
pnpm bb
# or
pnpm exec bb --help
```

## Help and Version

```bash
bb --help
bb --version
```

## Key Points

- The CLI talks to the daemon over HTTP; start the daemon first with `pnpm dev:daemon` or `bb daemon`.
- `--json` bypasses formatted output and prints the raw daemon response.
- If the daemon is unreachable, the CLI prompts you to start it with `pnpm dev:daemon`.

<!--
Source references:
- packages/cli/src/index.ts
-->
