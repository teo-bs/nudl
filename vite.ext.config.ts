import { defineConfig } from "vite";
import path from "path";
import { copyFileSync } from "fs";

export default defineConfig({
  build: {
    outDir: "dist/extension",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        "content": path.resolve(__dirname, "src/extension/content.ts"),
        "service-worker": path.resolve(__dirname, "src/extension/service-worker.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        format: "iife",
      },
    },
    target: "es2020",
  },
  plugins: [
    {
      name: 'copy-css',
      generateBundle() {
        // Copy CSS file to dist
        copyFileSync(
          path.resolve(__dirname, "src/extension/content-styles.css"),
          path.resolve(__dirname, "dist/extension/content-styles.css")
        );
      }
    }
  ],
  esbuild: {
    target: "es2020",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});