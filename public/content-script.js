
// LinkedIn Post Saver Content Script - Main Entry Point
(() => {
  let extensionInitializer;

  // Initialize the extension
  init();

  async function init() {
    try {
      const { ExtensionInitializer } = await import('./modules/initialization.js');
      extensionInitializer = new ExtensionInitializer();
      await extensionInitializer.init();
    } catch (error) {
      console.error('LinkedIn Post Saver: Failed to load extension modules:', error);
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.action === 'getSavedPosts') {
      try {
        const { StorageManager } = await import('./modules/storage-manager.js');
        const storageManager = new StorageManager();
        const posts = await storageManager.getSavedPosts();
        sendResponse({ posts });
      } catch (error) {
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
})();
