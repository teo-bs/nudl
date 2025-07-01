
// Extension initialization module
export class ExtensionInitializer {
  constructor() {
    this.isInitialized = false;
    this.isExtensionActive = true;
  }

  async init() {
    if (this.isInitialized) return;
    
    console.log('LinkedIn Post Saver: Content script loaded');
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeExtension());
    } else {
      this.initializeExtension();
    }
  }

  initializeExtension() {
    try {
      // Import and initialize other modules
      import('./post-detector.js').then(({ PostDetector }) => {
        const postDetector = new PostDetector();
        postDetector.initialize();
      });
      
      this.isInitialized = true;
      console.log('LinkedIn Post Saver: Extension initialized successfully');
    } catch (error) {
      console.error('LinkedIn Post Saver: Initialization error:', error);
      // Retry after a short delay
      setTimeout(() => {
        this.isInitialized = false;
        this.init();
      }, 2000);
    }
  }

  toggleExtension() {
    this.isExtensionActive = !this.isExtensionActive;
    const buttons = document.querySelectorAll('.linkedin-post-saver-btn');
    buttons.forEach(btn => {
      btn.style.display = this.isExtensionActive ? 'flex' : 'none';
    });
    return this.isExtensionActive;
  }
}
