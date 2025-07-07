
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'content-script': resolve(__dirname, 'src/extension/content-script.ts'),
        'service-worker': resolve(__dirname, 'src/extension/service-worker.ts'),
        'popup': resolve(__dirname, 'src/extension/popup.ts')
      },
      formats: ['es']
    },
    outDir: 'public',
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    target: 'es2017',
    minify: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
