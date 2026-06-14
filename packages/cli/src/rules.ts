import type { BookmarkNode } from '@bb/shared'
import picomatch from 'picomatch'

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
  bookmark: BookmarkNode,
): string | undefined {
  for (const rule of rules) {
    const value = rule.field === 'url' ? bookmark.url : bookmark.title
    if (value !== undefined && matchGlob(rule.pattern, value)) {
      return rule.target
    }
  }
  return undefined
}

export function matchGlob(pattern: string, value: string): boolean {
  return picomatch.isMatch(value, pattern)
}
