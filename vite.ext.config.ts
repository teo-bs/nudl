
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist/extension',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        'background': resolve(__dirname, 'src/extension/service-worker.ts'),
        'content': resolve(__dirname, 'src/extension/content.ts'),
        'popup': resolve(__dirname, 'public/popup.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'iife'
      }
    },
    target: 'es2020',
    minify: false,
    sourcemap: false
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
