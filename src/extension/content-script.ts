
/// <reference types="chrome"/>
import { PostDetector } from './detector/detector';
import { StorageManager } from './storage-manager';
import { NotificationManager } from './notification-manager';
import { SessionBridge } from './utils/session-bridge';
import { waitForCondition } from './utils/polling';
import type { ExtensionMessage, ExtensionResponse } from './types';

// Global state
let postDetector: PostDetector | null = null;
let storageManager: StorageManager | null = null;
let notificationManager: NotificationManager | null = null;
let isInitialized = false;

// Initialize the extension
async function initialize() {
  if (isInitialized) {
    console.log('Croi Extension: Already initialized');
    return;
  }

  try {
    console.log('Croi Extension: Starting initialization...');
    
    // Initialize managers
    storageManager = new StorageManager();
    notificationManager = new NotificationManager();
    
    // Check if we're on LinkedIn
    if (!window.location.href.includes('linkedin.com')) {
      console.log('Croi Extension: Not on LinkedIn, skipping initialization');
      return;
    }
    
    // Wait for LinkedIn to load
    const linkedinReady = await waitForCondition(
      () => document.querySelector('.feed-shared-update-v2, [data-urn*="urn:li:activity:"]') !== null,
      15000
    );
    
    if (!linkedinReady) {
      console.log('Croi Extension: LinkedIn content not ready, retrying...');
      setTimeout(() => {
        isInitialized = false;
        initialize();
      }, 3000);
      return;
    }
    
    // Initialize post detector
    postDetector = new PostDetector();
    await postDetector.initialize();
    
    // Sync session with web app
    await SessionBridge.syncWithWebApp();
    
    isInitialized = true;
    console.log('Croi Extension: Successfully initialized');
    
    // Show success notification
    notificationManager?.show('Croi extension loaded! 🚀', 'success');
    
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
chrome.runtime.onMessage.addListener(async (request: ExtensionMessage, sender, sendResponse) => {
  console.log('Croi Extension: Received message:', request);
  
  try {
    if (request.action === 'getSavedPosts') {
      const posts = await storageManager?.getSavedPosts() || [];
      sendResponse({ success: true, posts } as ExtensionResponse);
      return true;
    }
    
    if (request.action === 'getSession') {
      const session = await SessionBridge.getSession();
      sendResponse({ success: true, session });
      return true;
    }
    
    if (request.action === 'toggleExtension') {
      const buttons = document.querySelectorAll('.croi-btn');
      const isActive = buttons.length > 0 && (buttons[0] as HTMLElement).style.display !== 'none';
      
      buttons.forEach(btn => {
        (btn as HTMLElement).style.display = isActive ? 'none' : 'inline-flex';
      });
      
      sendResponse({ success: true, active: !isActive } as ExtensionResponse);
      return true;
    }
    
    if (request.action === 'reinitialize') {
      isInitialized = false;
      await initialize();
      sendResponse({ success: true } as ExtensionResponse);
      return true;
    }
    
  } catch (error) {
    console.error('Croi Extension: Message handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage } as ExtensionResponse);
  }
});

// Handle page navigation (LinkedIn is SPA)
let currentUrl = window.location.href;
setInterval(() => {
  if (currentUrl !== window.location.href) {
    currentUrl = window.location.href;
    console.log('Croi Extension: URL changed, reinitializing...');
    
    setTimeout(() => {
      if (postDetector && window.location.href.includes('linkedin.com/feed')) {
        postDetector.reinitialize();
      }
    }, 2000);
  }
}, 1000);

// Start initialization
console.log('Croi Extension: Content script loaded');
initialize();

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
  })
};
