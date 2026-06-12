---
name: bb-cli-install
description: Install the bb CLI from npm.
---

# Install the bb CLI

The CLI is published as `@kvoon/bb-cli` and provides the `bb` binary.

## Install globally

```bash
npm -g install @kvoon/bb-cli
```

## Verify

```bash
bb --version
bb --help
```

## Key Points

- Global installation is recommended so agents can run `bb` from any directory.
- If you prefer not to install globally, use `npx @kvoon/bb-cli` instead.
- The CLI requires the daemon to be running for bookmark commands.

<!--
Source references:
- packages/cli/package.json
- README.md
-->
