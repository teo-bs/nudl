
// LinkedIn Post Saver - Main Content Script
(() => {
  console.log('LinkedIn Post Saver: Starting main content script...');

  // Main execution
  let postDetector;

  console.log('LinkedIn Post Saver: Current URL:', window.location.href);
  console.log('LinkedIn Post Saver: Chrome runtime available:', !!chrome.runtime);

  // Initialize the extension
  init();

  async function init() {
    try {
      console.log('LinkedIn Post Saver: Initializing extension...');
      
      // Wait for all required classes to be available
      await waitForDependencies();
      
      // Wait for page to be ready
      if (document.readyState === 'loading') {
        console.log('LinkedIn Post Saver: Waiting for DOM to load...');
        document.addEventListener('DOMContentLoaded', () => initializeExtension());
      } else {
        console.log('LinkedIn Post Saver: DOM already loaded, initializing...');
        initializeExtension();
      }
      
      console.log('LinkedIn Post Saver: Extension initialized successfully');
    } catch (error) {
      console.error('LinkedIn Post Saver: Failed to initialize extension:', error);
      // Retry initialization after a delay
      setTimeout(() => {
        console.log('LinkedIn Post Saver: Retrying initialization...');
        init();
      }, 2000);
    }
  }

  async function waitForDependencies() {
    const maxAttempts = 50;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      if (window.PostDetector && window.ButtonManager && window.StorageManager && window.NotificationManager && window.PostExtractor) {
        console.log('LinkedIn Post Saver: All dependencies loaded');
        return;
      }
      
      console.log(`LinkedIn Post Saver: Waiting for dependencies... (${attempts + 1}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    throw new Error('Dependencies not loaded after maximum attempts');
  }

  function initializeExtension() {
    try {
      console.log('LinkedIn Post Saver: Starting extension initialization');
      
      if (!window.PostDetector) {
        console.error('LinkedIn Post Saver: PostDetector class not available');
        setTimeout(initializeExtension, 500);
        return;
      }
      
      postDetector = new window.PostDetector();
      postDetector.initialize();
      console.log('LinkedIn Post Saver: PostDetector initialized successfully');
      
    } catch (error) {
      console.error('LinkedIn Post Saver: PostDetector initialization error:', error);
      // Retry after delay if PostDetector is not available yet
      setTimeout(() => {
        console.log('LinkedIn Post Saver: Retrying PostDetector initialization...');
        initializeExtension();
      }, 1000);
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('LinkedIn Post Saver: Received message:', request);
    
    if (request.action === 'getSavedPosts') {
      try {
        if (!window.StorageManager) {
          console.error('LinkedIn Post Saver: StorageManager not available');
          sendResponse({ posts: [] });
          return;
        }
        
        const storageManager = new window.StorageManager();
        const posts = await storageManager.getSavedPosts();
        sendResponse({ posts });
      } catch (error) {
        console.error('LinkedIn Post Saver: Error getting saved posts:', error);
        sendResponse({ posts: [] });
      }
      return true;
    }
    
    if (request.action === 'toggleExtension') {
      if (postDetector) {
        // Toggle button visibility
        const buttons = document.querySelectorAll('.linkedin-post-saver-btn');
        console.log('LinkedIn Post Saver: Found', buttons.length, 'buttons to toggle');
        
        const isActive = !buttons.length || buttons[0].style.display !== 'none';
        const newState = !isActive;
        
        buttons.forEach(btn => {
          btn.style.display = newState ? 'flex' : 'none';
        });
        
        sendResponse({ active: newState });
      } else {
        sendResponse({ active: false });
      }
    }
  });

  // Add a manual trigger for testing
  window.linkedinPostSaver = {
    reinitialize: init,
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

  console.log('LinkedIn Post Saver: Content script loaded, manual controls available via window.linkedinPostSaver');
})();
