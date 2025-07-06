
/// <reference types="chrome"/>
import { PostDetector } from './detector/detector';
import { StorageManager } from './storage-manager';

// Inject styles
function injectStyles() {
  if (document.getElementById('croi-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'croi-styles';
  
  // Basic styles for the extension
  style.textContent = `
    .croi-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: #0A66C2;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
      margin-right: 8px;
    }
    
    .croi-btn:hover:not(:disabled) {
      background: #084d96;
    }
    
    .croi-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .croi-btn.saved {
      background: #057642;
    }
    
    .croi-btn-container {
      display: inline-flex;
      align-items: center;
    }
    
    .croi-spinner {
      width: 12px;
      height: 12px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: croi-spin 1s linear infinite;
    }
    
    @keyframes croi-spin {
      to { transform: rotate(360deg); }
    }
    
    .croi-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: 4px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    
    .croi-notification.show {
      transform: translateX(0);
    }
    
    .croi-notification.success {
      background: #057642;
    }
    
    .croi-notification.error {
      background: #d92d20;
    }
    
    .croi-notification.info {
      background: #0A66C2;
    }
  `;
  
  document.head.appendChild(style);
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
