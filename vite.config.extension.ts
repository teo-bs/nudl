
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'content-script': resolve(__dirname, 'src/extension/content.ts'),
        'service-worker': resolve(__dirname, 'src/extension/service-worker.ts'),
        'popup': resolve(__dirname, 'src/extension/popup.ts')
      },
      formats: ['iife'],
      name: 'CroiExtension'
    },
    outDir: 'dist/extension',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        format: 'iife'
      }
    },
    target: 'es2020',
    minify: false,
    emptyOutDir: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
