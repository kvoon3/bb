import { defineConfig } from 'changelogithub'

export default defineConfig({
  tag: 'extension-v%s',
  tagFilter: (tag) => tag.startsWith('extension-v'),
})
