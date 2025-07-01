
import { PostDetector } from './post-detector.js';

// Extension Initializer Class
export class ExtensionInitializer {
  constructor() {
    this.isInitialized = false;
    this.isExtensionActive = true;
    this.initAttempts = 0;
    this.maxInitAttempts = 5;
  }

  async init() {
    if (this.isInitialized) {
      console.log('ExtensionInitializer: Already initialized');
      return;
    }
    
    this.initAttempts++;
    console.log(`ExtensionInitializer: Initialization attempt ${this.initAttempts}/${this.maxInitAttempts}`);
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      console.log('ExtensionInitializer: Waiting for DOM to load...');
      document.addEventListener('DOMContentLoaded', () => this.initializeExtension());
    } else {
      console.log('ExtensionInitializer: DOM already loaded, initializing...');
      this.initializeExtension();
    }
  }

  initializeExtension() {
    try {
      console.log('ExtensionInitializer: Starting extension initialization');
      
      const postDetector = new PostDetector();
      postDetector.initialize();
      this.isInitialized = true;
      console.log('ExtensionInitializer: Extension initialized successfully');
      
    } catch (error) {
      console.error('ExtensionInitializer: Initialization error:', error);
      this.handleInitializationError(error);
    }
  }

  handleInitializationError(error) {
    if (this.initAttempts < this.maxInitAttempts) {
      console.log(`ExtensionInitializer: Retrying initialization in 2 seconds... (${this.initAttempts}/${this.maxInitAttempts})`);
      setTimeout(() => {
        this.isInitialized = false;
        this.init();
      }, 2000);
    } else {
      console.error('ExtensionInitializer: Max initialization attempts reached. Extension failed to load.');
    }
  }

  toggleExtension() {
    this.isExtensionActive = !this.isExtensionActive;
    console.log('ExtensionInitializer: Extension toggled, active:', this.isExtensionActive);
    
    const buttons = document.querySelectorAll('.linkedin-post-saver-btn');
    console.log('ExtensionInitializer: Found', buttons.length, 'buttons to toggle');
    
    buttons.forEach(btn => {
      btn.style.display = this.isExtensionActive ? 'flex' : 'none';
    });
    
    return this.isExtensionActive;
  }
}
