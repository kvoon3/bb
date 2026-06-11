import { expect, test } from 'vite-plus/test'
import { errorMessage, fn } from '../src/index.ts'

test('fn', () => {
  expect(fn()).toBe('Hello, tsdown!')
})

test('errorMessage', () => {
  expect(errorMessage(new Error('oops'))).toBe('oops')
  expect(errorMessage(42)).toBe('42')
})
