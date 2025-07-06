/// <reference types="chrome"/>
import { PostDetector } from './detector/detector';
import { StorageManager } from './storage-manager';

// Inject styles
function injectStyles() {
  if (document.getElementById('croi-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'croi-styles';
  
  // Import styles directly as text
  fetch(chrome.runtime.getURL('content-styles.css'))
    .then(response => response.text())
    .then(css => {
      style.textContent = css;
      document.head.appendChild(style);
    });
}

// Main content script execution
(() => {
  console.log('Croi Extension: Starting content script...');

  let postDetector: PostDetector;

  console.log('Croi Extension: Current URL:', window.location.href);
  console.log('Croi Extension: Chrome runtime available:', !!chrome.runtime);

  // Inject styles
  injectStyles();

  // Initialize the extension
  init();

  async function init() {
    try {
      console.log('Croi Extension: Initializing extension...');
      postDetector = new PostDetector();
      postDetector.initialize();
      console.log('Croi Extension: Extension initialized successfully');
    } catch (error) {
      console.error('Croi Extension: Failed to initialize extension:', error);
      // Retry initialization after a delay
      setTimeout(() => {
        console.log('Croi Extension: Retrying initialization...');
        init();
      }, 2000);
    }
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    console.log('Croi Extension: Received message:', request);
    
    if (request.action === 'getSavedPosts') {
      try {
        const storageManager = new StorageManager();
        const posts = await storageManager.getSavedPosts();
        sendResponse({ posts });
      } catch (error) {
        console.error('Croi Extension: Error getting saved posts:', error);
        sendResponse({ posts: [] });
      }
      return true;
    }
  });

  // Add a manual trigger for testing
  (window as any).croiExtension = {
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

  console.log('Croi Extension: Content script loaded, manual controls available via window.croiExtension');
})();