import { resolve } from "node:path";
import { defineConfig } from "vite-plus";

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "dist",
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background.ts"),
        popup: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
