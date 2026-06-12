---
name: bb-cli-usage
description: Common CLI usage patterns for bb.
---

# CLI Usage Patterns

## Typical Session

1. Start the daemon and browser extension.
2. Verify everything is connected:
   ```bash
   bb health
   ```
3. Search and act on bookmarks:
   ```bash
   bb bookmarks:search vite
   bb bookmarks:create --title "Vite" --url https://vitejs.dev --parent-id 2
   ```

## Automation and Scripting

Use `--json` to make output machine-readable:

```bash
bb bookmarks:tree --json | jq '.[].title'
bb bookmarks:unused --days 365 --json > stale.json
```

## Development Workflow

```bash
# Terminal 1
pnpm dev:daemon

# Terminal 2
pnpm bb -- bookmarks:tree
```

Note the `--` separator: `pnpm bb -- bookmarks:tree`. `bb` itself strips a leading `--` when present.

## Key Points

- Start the daemon before running bookmark commands.
- The browser extension must be installed and connected for bookmark operations to succeed.
- Use `--json` when piping output to other tools.

<!--
Source references:
- packages/cli/src/index.ts
- packages/cli/src/url.ts
-->
