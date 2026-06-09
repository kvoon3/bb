import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    dts: true,
  },
  lint: {
    plugins: ['unicorn', 'import', 'typescript', 'oxc', 'node', 'promise', 'eslint'],
    jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    options: { typeAware: true, typeCheck: true },
    ignorePatterns: ['.agents/**'],
  },
  fmt: {
    singleQuote: true,
    semi: false,
    ignorePatterns: ['.agents/**'],
  },
  staged: {
    '*.{ts,mjs,cjs,js,json,css,yaml,yml,md}': 'vp check --fix',
  },
  run: {
    cache: true,
  },
})
