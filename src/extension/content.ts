
/// <reference types="chrome"/>
import { PostDetector } from './detector/detector';
import { StorageManager } from './storage-manager';
import { NotificationManager } from './notification-manager';

// Global state
let postDetector: PostDetector | null = null;
let isInitialized = false;

// Inject styles for the extension
function injectStyles() {
  if (document.getElementById('croi-styles')) return;
  
  const style = document.createElement('style');
  style.id = 'croi-styles';
  
  // Enhanced styles for the extension
  style.textContent = `
    .croi-btn {
      display: inline-flex !important;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: #0A66C2 !important;
      color: white !important;
      border: none !important;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-right: 8px;
      z-index: 1000;
      position: relative;
      min-width: 60px;
      justify-content: center;
    }
    
    .croi-btn:hover:not(:disabled) {
      background: #084d96 !important;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .croi-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .croi-btn.saved {
      background: #057642 !important;
    }
    
    .croi-btn.error {
      background: #d92d20 !important;
    }
    
    .croi-btn-container {
      display: inline-flex;
      align-items: center;
      margin-right: 8px;
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
      border-radius: 6px;
      color: white;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
    
    /* Ensure button is visible in LinkedIn's feed */
    .feed-shared-social-action-bar .croi-btn-container {
      display: inline-flex !important;
    }
  `;
  
  document.head.appendChild(style);
}

// Initialize the extension
async function initialize() {
  if (isInitialized) {
    console.log('Croi Extension: Already initialized');
    return;
  }

  try {
    console.log('Croi Extension: Starting initialization...');
    
    // Inject styles first
    injectStyles();
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // Additional wait for LinkedIn's dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if we're on LinkedIn
    if (!window.location.href.includes('linkedin.com')) {
      console.log('Croi Extension: Not on LinkedIn, skipping initialization');
      return;
    }
    
    // Initialize post detector
    postDetector = new PostDetector();
    postDetector.initialize();
    
    isInitialized = true;
    console.log('Croi Extension: Successfully initialized');
    
    // Show success notification
    const notificationManager = new NotificationManager();
    notificationManager.show('Croi extension loaded! 🚀', 'success');
    
  } catch (error) {
    console.error('Croi Extension: Initialization failed:', error);
    
    // Retry after delay
    setTimeout(() => {
      console.log('Croi Extension: Retrying initialization...');
      isInitialized = false;
      initialize();
    }, 5000);
  }
}

// Handle messages from popup and background
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('Croi Extension: Received message:', request);
  
  try {
    if (request.action === 'getSavedPosts') {
      const storageManager = new StorageManager();
      const posts = await storageManager.getSavedPosts();
      sendResponse({ success: true, posts });
      return true;
    }
    
    if (request.action === 'toggleExtension') {
      const isActive = document.querySelectorAll('.croi-btn').length > 0;
      
      if (isActive) {
        // Hide buttons
        document.querySelectorAll('.croi-btn').forEach(btn => {
          btn.style.display = 'none';
        });
        sendResponse({ success: true, active: false });
      } else {
        // Show buttons or reinitialize
        const hiddenButtons = document.querySelectorAll('.croi-btn[style*="display: none"]');
        if (hiddenButtons.length > 0) {
          hiddenButtons.forEach(btn => {
            btn.style.display = 'inline-flex';
          });
        } else if (postDetector) {
          // Reinitialize if no buttons found
          postDetector.initialize();
        }
        sendResponse({ success: true, active: true });
      }
      return true;
    }
    
    if (request.action === 'reinitialize') {
      isInitialized = false;
      await initialize();
      sendResponse({ success: true });
      return true;
    }
    
  } catch (error) {
    console.error('Croi Extension: Message handler error:', error);
    sendResponse({ success: false, error: error.message });
  }
});

// Global debugging helpers
(window as any).croiExtension = {
  reinitialize: () => {
    isInitialized = false;
    initialize();
  },
  getStatus: () => ({
    initialized: isInitialized,
    buttonsCount: document.querySelectorAll('.croi-btn').length,
    postsFound: document.querySelectorAll([
      'div[data-id*="urn:li:activity:"]',
      'div[data-urn*="urn:li:activity:"]',
      '.feed-shared-update-v2'
    ].join(', ')).length
  }),
  testSave: () => {
    const firstPost = document.querySelector('.feed-shared-update-v2');
    if (firstPost) {
      const button = firstPost.querySelector('.croi-btn') as HTMLButtonElement;
      if (button) button.click();
    }
  }
};

// Start initialization
console.log('Croi Extension: Content script loaded');
initialize();

// Handle page navigation (LinkedIn is SPA)
let currentUrl = window.location.href;
setInterval(() => {
  if (currentUrl !== window.location.href) {
    currentUrl = window.location.href;
    console.log('Croi Extension: URL changed, reinitializing...');
    
    // Delay reinitalization to allow new content to load
    setTimeout(() => {
      if (postDetector && window.location.href.includes('linkedin.com/feed')) {
        postDetector.initialize();
      }
    }, 2000);
  }
}, 1000);
