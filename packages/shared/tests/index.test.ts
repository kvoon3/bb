import { expect, test } from 'vite-plus/test'
import { errorMessage } from '../src/index.ts'

test('errorMessage', () => {
  expect(errorMessage(new Error('oops'))).toBe('oops')
  expect(errorMessage(42)).toBe('42')
})
