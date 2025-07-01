
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Use source-map instead of eval-based sourcemaps for CSP compatibility
    sourcemap: mode === 'development' ? 'inline' : false,
  },
  esbuild: {
    // Disable eval-based sourcemaps in esbuild as well
    sourcemap: mode === 'development' ? 'inline' : false,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
