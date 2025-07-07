
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

console.log('Croi Extension: Starting unified content script...');

class ExtensionInitializer {
  private postDetector: PostDetector | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    this.init();
  }

  async init() {
    try {
      console.log('Croi Extension: Initializing extension...');
      
      // Wait for page to be ready
      if (document.readyState === 'loading') {
        console.log('Croi Extension: Waiting for DOM to load...');
        document.addEventListener('DOMContentLoaded', () => this.initializeExtension());
      } else {
        console.log('Croi Extension: DOM already loaded, initializing...');
        this.initializeExtension();
      }
      
    } catch (error) {
      console.error('Croi Extension: Failed to initialize extension:', error);
      this.handleInitializationError();
    }
  }

  private handleInitializationError() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      console.log(`Croi Extension: Retrying initialization (${this.retryCount}/${this.maxRetries})...`);
      setTimeout(() => this.init(), 2000 * this.retryCount);
    } else {
      console.error('Croi Extension: Max retries reached. Extension initialization failed.');
    }
  }

  private initializeExtension() {
    try {
      console.log('Croi Extension: Starting post detection...');
      
      // Create and initialize PostDetector
      this.postDetector = new PostDetector();
      this.postDetector.initialize();
      
      console.log('Croi Extension: Extension initialized successfully');
      
      // Setup message listener
      this.setupMessageListener();
      
    } catch (error) {
      console.error('Croi Extension: PostDetector initialization error:', error);
      this.handleInitializationError();
    }
  }

  private setupMessageListener() {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
      console.log('Croi Extension: Received message:', request);
      
      try {
        if (request.action === 'getSavedPosts') {
          const storageManager = new StorageManager();
          const posts = await storageManager.getSavedPosts();
          sendResponse({ posts });
        }
        
        if (request.action === 'toggleExtension') {
          const buttons = document.querySelectorAll('.croi-save-btn');
          console.log('Croi Extension: Found', buttons.length, 'buttons to toggle');
          
          const isActive = buttons.length > 0 && buttons[0].style.display !== 'none';
          const newState = !isActive;
          
          buttons.forEach(btn => {
            (btn as HTMLElement).style.display = newState ? 'flex' : 'none';
          });
          
          sendResponse({ active: newState });
        }
        
        if (request.action === 'getExtensionStatus') {
          const buttons = document.querySelectorAll('.croi-save-btn');
          const isActive = buttons.length > 0 && buttons[0].style.display !== 'none';
          sendResponse({ active: isActive, buttonsCount: buttons.length });
        }
        
      } catch (error) {
        console.error('Croi Extension: Message handling error:', error);
        sendResponse({ error: error.message });
      }
      
      return true; // Keep message channel open for async responses
    });
  }
}

// Initialize the extension
const extensionInitializer = new ExtensionInitializer();

// Add manual controls for debugging
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
  
  getStatus: () => {
    const buttons = document.querySelectorAll('.croi-save-btn');
    return {
      initialized: !!extensionInitializer,
      buttonsCount: buttons.length,
      classes: {
        PostDetector: !!window.PostDetector,
        ButtonManager: !!window.ButtonManager,
        StorageManager: !!window.StorageManager,
        NotificationManager: !!window.NotificationManager,
        PostExtractor: !!window.PostExtractor
      }
    };
  }
};

console.log('Croi Extension: Content script loaded. Debug tools available via window.croiExtension');
