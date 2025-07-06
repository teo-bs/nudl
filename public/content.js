
/// <reference types="chrome"/>

// Post Detector Class
class PostDetector {
  constructor() {
    this.postSelectors = [
      'div[data-id*="urn:li:activity:"]',
      'div[data-urn*="urn:li:activity:"]',
      '.feed-shared-update-v2',
      'article[data-urn]',
      '.feed-shared-update-v2__content',
      '[data-test-id="main-feed-activity-card"]'
    ];
    this.buttonManager = new ButtonManager();
    this.processedPosts = new Set();
    this.observerTimeout = null;
    
    console.log('PostDetector initialized with selectors:', this.postSelectors);
  }

  initialize() {
    console.log('PostDetector: Starting initialization');
    this.addSaveButtonsToExistingPosts();
    this.observeNewPosts();
  }

  addSaveButtonsToExistingPosts() {
    try {
      console.log('PostDetector: Looking for existing posts...');
      
      const allPosts = document.querySelectorAll(this.postSelectors.join(', '));
      console.log(`PostDetector: Total posts found: ${allPosts.length}`);
      
      allPosts.forEach((post, index) => {
        const postId = this.getPostId(post) || `fallback-${index}-${Date.now()}`;
        
        // Skip if already has button
        if (post.querySelector('.linkedin-post-saver-btn')) {
          return;
        }
        
        // Skip if already processed
        if (this.processedPosts.has(postId)) {
          return;
        }
        
        // Check if this post should be skipped (promoted/job posts)
        if (this.isPromotedPost(post) || this.isJobPost(post)) {
          this.processedPosts.add(postId);
          return;
        }
        
        console.log(`PostDetector: Processing post ${index + 1}`, post);
        this.addSaveButtonToPost(post);
        this.processedPosts.add(postId);
      });
    } catch (error) {
      console.error('PostDetector: Error adding save buttons:', error);
    }
  }

  getPostId(postElement) {
    const urn = postElement.getAttribute('data-urn') || 
                postElement.getAttribute('data-id') || 
                postElement.getAttribute('data-activity-urn') ||
                postElement.querySelector('[data-urn]')?.getAttribute('data-urn');
                
    if (urn) return urn;
    
    const content = postElement.textContent?.trim();
    if (content) {
      return `content-${content.substring(0, 50).replace(/\s+/g, '-')}-${content.length}`;
    }
    
    return `position-${Array.from(document.querySelectorAll(this.postSelectors.join(', '))).indexOf(postElement)}`;
  }

  isPromotedPost(postElement) {
    const promotedIndicators = [
      '.feed-shared-actor__sub-description',
      '.update-components-actor__sub-description'
    ];
    
    for (const selector of promotedIndicators) {
      const element = postElement.querySelector(selector);
      if (element && element.textContent?.toLowerCase().includes('promoted')) {
        return true;
      }
    }
    return false;
  }

  isJobPost(postElement) {
    const jobIndicators = [
      '.job-card',
      '[data-entity-type="JOB_POSTING"]',
      '.jobs-search-results__list-item'
    ];
    
    return jobIndicators.some(selector => postElement.querySelector(selector));
  }

  addSaveButtonToPost(postElement) {
    try {
      const saveButton = this.buttonManager.createSaveButton();
      
      const actionSelectors = [
        '.feed-shared-social-action-bar',
        '.social-actions-bar', 
        '.feed-shared-footer',
        '.social-counts-bar'
      ];
      
      let actionsBar = null;
      for (const selector of actionSelectors) {
        actionsBar = postElement.querySelector(selector);
        if (actionsBar) break;
      }
      
      if (actionsBar) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'linkedin-post-saver-container';
        buttonContainer.appendChild(saveButton);
        
        actionsBar.insertBefore(buttonContainer, actionsBar.firstChild);
        console.log('PostDetector: Save button added successfully');
      } else {
        console.log('PostDetector: No suitable location found for save button');
      }
    } catch (error) {
      console.error('PostDetector: Error adding button to post:', error);
    }
  }

  observeNewPosts() {
    console.log('PostDetector: Starting post observation');
    
    const observer = new MutationObserver((mutations) => {
      if (this.observerTimeout) {
        clearTimeout(this.observerTimeout);
      }
      
      this.observerTimeout = setTimeout(() => {
        this.processNewPosts(mutations);
        this.addSaveButtonsToExistingPosts();
      }, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  processNewPosts(mutations) {
    const newPosts = [];
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const element = node;
          if (element.matches && element.matches(this.postSelectors.join(', '))) {
            newPosts.push(element);
          }
          
          if (element.querySelectorAll) {
            const posts = element.querySelectorAll(this.postSelectors.join(', '));
            posts.forEach(post => newPosts.push(post));
          }
        }
      });
    });

    const uniquePosts = Array.from(new Set(newPosts));
    console.log(`PostDetector: Processing ${uniquePosts.length} unique new posts`);
    
    uniquePosts.forEach(post => {
      const postId = this.getPostId(post) || `new-${Date.now()}-${Math.random()}`;
      
      if (post.querySelector('.linkedin-post-saver-btn') || this.processedPosts.has(postId)) {
        return;
      }
      
      if (this.isPromotedPost(post) || this.isJobPost(post)) {
        this.processedPosts.add(postId);
        return;
      }
      
      this.addSaveButtonToPost(post);
      this.processedPosts.add(postId);
    });
  }
}

// Main content script execution
(() => {
  console.log('Croi Extension: Starting content script...');

  let postDetector;

  console.log('Croi Extension: Current URL:', window.location.href);
  console.log('Croi Extension: Chrome runtime available:', !!chrome.runtime);

  // Inject styles
  function injectStyles() {
    if (document.getElementById('croi-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'croi-styles';
    
    fetch(chrome.runtime.getURL('content-script.css'))
      .then(response => response.text())
      .then(css => {
        style.textContent = css;
        document.head.appendChild(style);
      });
  }

  injectStyles();
  init();

  async function init() {
    try {
      console.log('Croi Extension: Initializing extension...');
      postDetector = new PostDetector();
      postDetector.initialize();
      console.log('Croi Extension: Extension initialized successfully');
    } catch (error) {
      console.error('Croi Extension: Failed to initialize extension:', error);
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

  // Add manual trigger for testing
  window.croiExtension = {
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

  console.log('Croi Extension: Content script loaded');
})();
