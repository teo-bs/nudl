
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist/extension',
    emptyOutDir: false, // Don't empty since we copy static files first
    lib: {
      entry: {
        'content': resolve(__dirname, 'src/extension/content.ts'),
        'background': resolve(__dirname, 'src/extension/service-worker.ts'),
        'popup': resolve(__dirname, 'src/extension/popup.ts')
      },
      formats: ['iife'],
      name: 'CroiExtension'
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
        format: 'iife',
        inlineDynamicImports: false
      }
    },
    target: 'es2020',
    minify: false // Keep unminified for debugging
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
});
</tml-write>

Now let me create the missing TypeScript entry files that the Vite config expects:

<lov-write file_path="src/extension/content.ts">
import { PostDetector } from './detector/detector';
import { ButtonManager } from './button-manager';
import { StorageManager } from './storage-manager';
import { NotificationManager } from './notification-manager';
import { PostExtractor } from './post-extractor';
import './content-styles.css';

// Make classes globally available for backward compatibility
declare global {
  interface Window {
    PostDetector: typeof PostDetector;
    ButtonManager: typeof ButtonManager;
    StorageManager: typeof StorageManager;
    NotificationManager: typeof NotificationManager;
    PostExtractor: typeof PostExtractor;
    croiExtension: any;
  }
}

window.PostDetector = PostDetector;
window.ButtonManager = ButtonManager;
window.StorageManager = StorageManager;
window.NotificationManager = NotificationManager;
window.PostExtractor = PostExtractor;

console.log('Croi Extension: Starting content script...');

class ExtensionInitializer {
  private postDetector: PostDetector | null = null;

  constructor() {
    this.init();
  }

  async init() {
    try {
      console.log('Croi Extension: Initializing extension...');
      
      // Wait for dependencies to be available
      await this.waitForDependencies();
      
      // Wait for page to be ready
      if (document.readyState === 'loading') {
        console.log('Croi Extension: Waiting for DOM to load...');
        document.addEventListener('DOMContentLoaded', () => this.initializeExtension());
      } else {
        console.log('Croi Extension: DOM already loaded, initializing...');
        this.initializeExtension();
      }
      
      console.log('Croi Extension: Extension initialized successfully');
    } catch (error) {
      console.error('Croi Extension: Failed to initialize extension:', error);
      // Retry initialization after a delay
      setTimeout(() => {
        console.log('Croi Extension: Retrying initialization...');
        this.init();
      }, 2000);
    }
  }

  async waitForDependencies() {
    const maxAttempts = 50;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      if (window.PostDetector && window.ButtonManager && window.StorageManager && 
          window.NotificationManager && window.PostExtractor) {
        console.log('Croi Extension: All dependencies loaded');
        return;
      }
      
      console.log(`Croi Extension: Waiting for dependencies... (${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    throw new Error('Dependencies not loaded after maximum attempts');
  }

  initializeExtension() {
    try {
      console.log('Croi Extension: Starting extension initialization');
      
      if (!window.PostDetector) {
        console.error('Croi Extension: PostDetector class not available');
        setTimeout(() => this.initializeExtension(), 500);
        return;
      }
      
      this.postDetector = new window.PostDetector();
      this.postDetector.initialize();
      console.log('Croi Extension: PostDetector initialized successfully');
      
    } catch (error) {
      console.error('Croi Extension: PostDetector initialization error:', error);
      // Retry after delay if PostDetector is not available yet
      setTimeout(() => {
        console.log('Croi Extension: Retrying PostDetector initialization...');
        this.initializeExtension();
      }, 1000);
    }
  }
}

// Initialize the extension
new ExtensionInitializer();

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('Croi Extension: Received message:', request);
  
  if (request.action === 'getSavedPosts') {
    try {
      if (!window.StorageManager) {
        console.error('Croi Extension: StorageManager not available');
        sendResponse({ posts: [] });
        return;
      }
      
      const storageManager = new window.StorageManager();
      const posts = await storageManager.getSavedPosts();
      sendResponse({ posts });
    } catch (error) {
      console.error('Croi Extension: Error getting saved posts:', error);
      sendResponse({ posts: [] });
    }
    return true;
  }
  
  if (request.action === 'toggleExtension') {
    // Toggle button visibility
    const buttons = document.querySelectorAll('.linkedin-post-saver-btn');
    console.log('Croi Extension: Found', buttons.length, 'buttons to toggle');
    
    const isActive = !buttons.length || buttons[0].style.display !== 'none';
    const newState = !isActive;
    
    buttons.forEach(btn => {
      (btn as HTMLElement).style.display = newState ? 'flex' : 'none';
    });
    
    sendResponse({ active: newState });
  }
});

// Add manual trigger for testing
window.croiExtension = {
  reinitialize: () => new ExtensionInitializer(),
  checkPosts: () => {
    const posts = document.querySelectorAll([
      'div[data-id*="urn:li:activity:"]',
      'div[data-urn*="urn:li:activity:"]',
      '.feed-shared-update-v2',
      'article[data-urn]'
    ].join(', '));
    console.log('Manual check found', posts.length, 'posts');
    return posts;
  },
  getLoadedClasses: () => {
    return {
      PostDetector: !!window.PostDetector,
      ButtonManager: !!window.ButtonManager,
      StorageManager: !!window.StorageManager,
      NotificationManager: !!window.NotificationManager,
      PostExtractor: !!window.PostExtractor
    };
  }
};

console.log('Croi Extension: Content script loaded, manual controls available via window.croiExtension');
