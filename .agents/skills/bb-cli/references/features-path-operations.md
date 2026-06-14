---
name: bb-cli-path-operations
description: Move and remove bookmark folders by path, with automatic folder creation.
---

# Path Operations

Instead of remembering folder ids, you can move bookmarks or remove folder trees by their folder path. Missing folders are created automatically when moving.

## Move by Path

```bash
bb bookmarks:move <id> --path Websites/Personal
```

If `Websites` or `Personal` does not exist, it is created automatically. The bookmark is moved into the deepest folder.

You can also use nested paths:

```bash
bb bookmarks:move <id> --path Work/Clients/Acme
```

## Remove Folder Tree by Path

```bash
bb bookmarks:remove-tree --path Archive/Old
```

This recursively removes the folder at `Archive/Old` and everything inside it.

## Combining with Batch Move

When using `--file` with `--path`, items that do not specify their own `parentId` use the resolved `--path` folder:

```bash
bb bookmarks:move --file moves.json --path Websites/Personal
```

```json
[
  { "id": "123" },
  { "id": "456" }
]
```

## Key Points

- `--path` and `--parent-id` cannot be used together.
- Path resolution happens in the browser extension, so the tree state is always current.
- Be careful with `remove-tree --path`: it deletes the folder and all descendants.

<!--
Source references:
- packages/cli/src/index.ts
-->
