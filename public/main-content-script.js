// LinkedIn Post Saver - Main Content Script
(() => {
  console.log('LinkedIn Post Saver: Starting main content script...');

  // Main execution
  let extensionInitializer;

  console.log('LinkedIn Post Saver: Current URL:', window.location.href);
  console.log('LinkedIn Post Saver: Chrome runtime available:', !!chrome.runtime);

  // Initialize the extension
  init();

  async function init() {
    try {
      console.log('LinkedIn Post Saver: Initializing extension...');
      extensionInitializer = new ExtensionInitializer();
      await extensionInitializer.init();
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

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('LinkedIn Post Saver: Received message:', request);
    
    if (request.action === 'getSavedPosts') {
      try {
        const storageManager = new StorageManager();
        const posts = await storageManager.getSavedPosts();
        sendResponse({ posts });
      } catch (error) {
        console.error('LinkedIn Post Saver: Error getting saved posts:', error);
        sendResponse({ posts: [] });
      }
      return true;
    }
    
    if (request.action === 'toggleExtension') {
      if (extensionInitializer) {
        const active = extensionInitializer.toggleExtension();
        sendResponse({ active });
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
    }
  };

  console.log('LinkedIn Post Saver: Content script loaded, manual controls available via window.linkedinPostSaver');
})();