
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'public',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'main-content-script': 'src/extension/content.ts',
        'dashboard-content-script': 'src/utils/extensionSync.ts',
        'background': 'src/extension/service-worker.ts'
      },
      output: {
        entryFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId;
          if (facadeModuleId?.includes('content.ts')) {
            return 'main-content-script.js';
          }
          if (facadeModuleId?.includes('extensionSync.ts')) {
            return 'dashboard-content-script.js';
          }
          if (facadeModuleId?.includes('service-worker.ts')) {
            return 'background.js';
          }
          return '[name].js';
        },
        format: 'iife'
      }
    }
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  }
});
