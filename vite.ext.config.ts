import { defineConfig } from "vite";
import path from "path";

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
  esbuild: {
    target: "es2020",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});