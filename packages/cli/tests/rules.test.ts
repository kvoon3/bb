import { expect, test } from 'vite-plus/test'

import { matchRule, normalizeRules, parseRule } from '../src/rules.js'

test('parseRule parses url and title rules', () => {
  expect(parseRule('url:**/github.com/** -> Git')).toEqual({
    field: 'url',
    pattern: '**/github.com/**',
    target: 'Git',
  })
  expect(parseRule('title:*Git* -> GitHub')).toEqual({
    field: 'title',
    pattern: '*Git*',
    target: 'GitHub',
  })
})

test('parseRule trims leading and trailing slashes from target', () => {
  expect(parseRule('url:**/github.com/** -> /Git/')).toEqual({
    field: 'url',
    pattern: '**/github.com/**',
    target: 'Git',
  })
})

test('parseRule throws on invalid format', () => {
  expect(() => parseRule('invalid')).toThrow('Invalid rule format')
})

test('parseRule throws on empty target', () => {
  expect(() => parseRule('url:** -> /')).toThrow('Target folder cannot be empty')
})

test('normalizeRules handles single string and array', () => {
  expect(normalizeRules('url:**/github.com/** -> Git')).toEqual([
    { field: 'url', pattern: '**/github.com/**', target: 'Git' },
  ])
  expect(normalizeRules(['url:**/github.com/** -> Git', 'title:*Git* -> GitHub'])).toEqual([
    { field: 'url', pattern: '**/github.com/**', target: 'Git' },
    { field: 'title', pattern: '*Git*', target: 'GitHub' },
  ])
})

test('normalizeRules returns empty array for undefined', () => {
  expect(normalizeRules(undefined)).toEqual([])
})

test('matchRule matches first applicable rule', () => {
  const rules = normalizeRules(['url:**/github.com/** -> Git', 'title:*Git* -> GitHub'])
  expect(
    matchRule(rules, { id: '1', title: 'GitHub', url: 'https://github.com/foo', syncing: false }),
  ).toBe('Git')
  expect(
    matchRule(rules, { id: '2', title: 'GitLab', url: 'https://gitlab.com/foo', syncing: false }),
  ).toBe('GitHub')
  expect(
    matchRule(rules, { id: '3', title: 'Example', url: 'https://example.com', syncing: false }),
  ).toBeUndefined()
})

test('matchRule returns undefined when field is missing', () => {
  const rules = normalizeRules(['url:**/github.com/** -> Git'])
  expect(matchRule(rules, { id: '1', title: 'GitHub', syncing: false })).toBeUndefined()
})
