import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    deps: {
      alwaysBundle: [/@bb\//],
    },
    dts: false,
    sourcemap: false,
  },
})
