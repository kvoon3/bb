import { matchesGlob } from 'node:path'

import type { bookmarks } from '@bb/shared'

export function normalizeRules(input: string | string[] | undefined): Array<{
  field: 'url' | 'title'
  pattern: string
  target: string
}> {
  if (!input) return []
  const list = Array.isArray(input) ? input : [input]
  return list.map(parseRule)
}

export function parseRule(rule: string): {
  field: 'url' | 'title'
  pattern: string
  target: string
} {
  const match = rule.match(/^(url|title):(.+?)\s*->\s*(.+)$/)
  if (!match) {
    throw new Error(
      `Invalid rule format: ${rule}. Expected "url:<pattern> -> <folder>" or "title:<pattern> -> <folder>"`,
    )
  }
  const target = match[3].replace(/^\/+|\/+$/g, '')
  if (!target) {
    throw new Error(`Invalid rule target: ${rule}. Target folder cannot be empty`)
  }
  return { field: match[1] as 'url' | 'title', pattern: match[2], target }
}

export function matchRule(
  rules: Array<{ field: 'url' | 'title'; pattern: string; target: string }>,
  bookmark: bookmarks.BookmarkTreeNode,
): string | undefined {
  for (const rule of rules) {
    const value = rule.field === 'url' ? bookmark.url : bookmark.title
    if (value !== undefined && matchGlob(rule.pattern, value)) {
      return rule.target
    }
  }
  return undefined
}

// ponytail: `node:path.matchesGlob` (stdlib) replaces picomatch. `*` does not match `/`
// (fine for URL rules — users write `**/github.com/**`, not bare `*github*` on URLs).
// Swap back to picomatch if title-based rules ever need `*` to cross word boundaries.
export function matchGlob(pattern: string, value: string): boolean {
  return matchesGlob(value, pattern)
}
