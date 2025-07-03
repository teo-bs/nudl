// LinkedIn Post Saver - Unified Content Script
(() => {
  console.log('LinkedIn Post Saver: Starting unified content script...');

  // Storage Manager Class
  class StorageManager {
    async savePost(postData) {
      return new Promise((resolve, reject) => {
        if (!chrome.runtime || !chrome.runtime.sendMessage) {
          reject(new Error('Chrome runtime not available'));
          return;
        }

        chrome.runtime.sendMessage(
          { action: 'savePost', postData },
          (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
              return;
            }
            
            if (response && response.success) {
              resolve(response.post);
            } else {
              reject(new Error(response?.error || 'Failed to save post'));
            }
          }
        );
      });
    }

    async getSavedPosts() {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get(['savedPosts']).then(result => {
          resolve(result.savedPosts || []);
        }).catch(reject);
      });
    }
  }

  // Notification Manager Class
  class NotificationManager {
    show(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `linkedin-post-saver-notification ${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      // Trigger animation
      setTimeout(() => notification.classList.add('show'), 10);
      
      // Remove after 4 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }, 4000);
    }
  }

  // Post Extractor Class
  class PostExtractor {
    extractPostData(postElement) {
      try {
        const authorElement = postElement.querySelector([
          '.feed-shared-actor__name',
          '.update-components-actor__name',
          '.feed-shared-actor__title',
          '.feed-shared-actor .visually-hidden'
        ].join(', '));
        const authorName = authorElement?.textContent?.trim() || 'Unknown Author';
        
        const authorImageElement = postElement.querySelector([
          '.feed-shared-actor__avatar img',
          '.presence-entity__image',
          '.feed-shared-actor img'
        ].join(', '));
        const authorAvatar = authorImageElement?.src || '';
        
        const contentElement = postElement.querySelector([
          '.feed-shared-text',
          '.update-components-text',
          '.feed-shared-update-v2__description',
          '[data-test-id="main-feed-activity-card"] .break-words'
        ].join(', '));
        const content = contentElement?.textContent?.trim() || '';
        
        const postUrl = window.location.href.split('?')[0] + '?utm_source=linkedin_post_saver';
        
        const postId = postElement.getAttribute('data-urn') || 
                     postElement.getAttribute('data-id') || 
                     Date.now().toString();
        
        const timeElement = postElement.querySelector([
          'time',
          '.feed-shared-actor__sub-description time',
          '.feed-shared-actor__sub-description'
        ].join(', '));
        const timestamp = timeElement?.getAttribute('datetime') || 
                         timeElement?.textContent?.trim() || 
                         new Date().toISOString();

        const result = {
          content,
          author_name: authorName,
          author_avatar_url: authorAvatar,
          post_url: postUrl,
          linkedin_post_id: postId,
          post_date: timestamp,
          title: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        };

        console.log('LinkedIn Post Saver: Extracted post data:', result);
        return result;
      } catch (error) {
        console.error('Error extracting post data:', error);
        return null;
      }
    }
  }

  // Button Manager Class
  class ButtonManager {
    constructor() {
      this.storageManager = new StorageManager();
      this.notificationManager = new NotificationManager();
      this.postExtractor = new PostExtractor();
    }

    createSaveButton() {
      const button = document.createElement('button');
      button.className = 'linkedin-post-saver-btn';
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
        <span>Save</span>
      `;
      
      button.addEventListener('click', (event) => this.handleSavePost(event));
      return button;
    }

    async handleSavePost(event) {
      event.preventDefault();
      event.stopPropagation();
      
      const button = event.currentTarget;
      const postElement = button.closest('[data-urn*="urn:li:activity:"], .feed-shared-update-v2, article[data-urn]');
      
      if (!postElement) {
        this.notificationManager.show('Error: Could not find post content', 'error');
        return;
      }

      const postData = this.postExtractor.extractPostData(postElement);
      
      if (!postData || !postData.content) {
        this.notificationManager.show('Error: Could not extract post data', 'error');
        return;
      }

      this.updateButtonState(button, 'saving');

      try {
        await this.storageManager.savePost(postData);
        
        this.updateButtonState(button, 'saved');
        this.notificationManager.show('Post saved successfully! 🎉', 'success');
        
        setTimeout(() => this.resetButton(button), 3000);
        
      } catch (error) {
        console.error('Error saving post:', error);
        this.updateButtonState(button, 'error');
        this.notificationManager.show('Error saving post. Please try again.', 'error');
        
        setTimeout(() => this.resetButton(button), 3000);
      }
    }

    updateButtonState(button, state) {
      button.disabled = state !== 'default';
      
      switch (state) {
        case 'saving':
          button.innerHTML = `
            <div class="linkedin-post-saver-spinner"></div>
            <span>Saving...</span>
          `;
          break;
        case 'saved':
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
            <span>Saved</span>
          `;
          button.classList.add('saved');
          break;
        case 'error':
          button.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>Error</span>
          `;
          break;
      }
    }

    resetButton(button) {
      button.disabled = false;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
        <span>Save</span>
      `;
      button.classList.remove('saved');
    }
  }

  // Post Detector Class
  class PostDetector {
    constructor() {
      this.postSelectors = [
        'div[data-id*="urn:li:activity:"]',
        'div[data-urn*="urn:li:activity:"]',
        '.feed-shared-update-v2',
        'article[data-urn]',
        '.feed-shared-update-v2__content',
        '[data-test-id="main-feed-activity-card"]',
        '.feed-shared-update-v2[data-urn]'
      ];
      this.buttonManager = new ButtonManager();
      this.processedPosts = new Set();
      this.observerTimeout = null;
      console.log('PostDetector initialized with selectors:', this.postSelectors);
    }

    isPromotedPost(postElement) {
      // More comprehensive promoted post detection
      const promotedSelectors = [
        '.feed-shared-actor__sub-description',
        '.feed-shared-actor__description', 
        '.update-components-actor__meta-link',
        '[data-test-id="sponsored-update-text"]',
        '.feed-shared-text__text-view',
        '.feed-shared-actor__name',
        '.feed-shared-actor__content',
        '.feed-shared-actor__meta',
        '.feed-shared-text',
        '.social-details-social-activity'
      ];
      
      // Check all text content in the post
      const allText = postElement.textContent?.toLowerCase() || '';
      if (allText.includes('promoted') || allText.includes('sponsored') || allText.includes('•promoted')) {
        console.log('PostDetector: Found promoted/sponsored text in post content, skipping save button');
        return true;
      }
      
      // Check specific selectors for promotion indicators  
      const textElements = postElement.querySelectorAll(promotedSelectors.join(', '));
      for (const element of textElements) {
        if (element && element.textContent) {
          const text = element.textContent.toLowerCase().trim();
          if (text.includes('promoted') || text.includes('sponsored') || text === 'promoted') {
            console.log('PostDetector: Found promoted/sponsored in selector, skipping save button');
            return true;
          }
        }
      }
      
      // Check for promoted badges and aria labels
      const promotedBadges = postElement.querySelectorAll([
        '[aria-label*="Promoted"]',
        '[aria-label*="Sponsored"]', 
        '[aria-label*="promoted"]',
        '[aria-label*="sponsored"]',
        '.artdeco-entity-lockup__badge',
        '.feed-shared-actor__description [data-test-id]',
        '[data-test-id*="sponsored"]',
        '[data-test-id*="promoted"]'
      ].join(', '));
      
      for (const badge of promotedBadges) {
        const ariaLabel = badge.getAttribute('aria-label')?.toLowerCase() || '';
        const textContent = badge.textContent?.toLowerCase() || '';
        if (ariaLabel.includes('promoted') || ariaLabel.includes('sponsored') || 
            textContent.includes('promoted') || textContent.includes('sponsored')) {
          console.log('PostDetector: Found promoted badge/aria-label, skipping save button');
          return true;
        }
      }
      
      return false;
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
          const postId = this.getPostId(post);
          if (postId && !this.processedPosts.has(postId) && !post.querySelector('.linkedin-post-saver-btn')) {
            console.log(`PostDetector: Processing new post ${index + 1}`, post);
            this.addSaveButtonToPost(post);
            this.processedPosts.add(postId);
          } else {
            console.log(`PostDetector: Post ${index + 1} already processed or has button or is promoted`);
          }
        });
      } catch (error) {
        console.error('PostDetector: Error adding save buttons:', error);
      }
    }

    getPostId(postElement) {
      return postElement.getAttribute('data-urn') || 
             postElement.getAttribute('data-id') || 
             postElement.getAttribute('data-activity-urn') ||
             postElement.querySelector('[data-urn]')?.getAttribute('data-urn') ||
             null;
    }

    addSaveButtonToPost(postElement) {
      try {
        console.log('PostDetector: Adding save button to post', postElement);
        
        // Check if this is a promoted post
        if (this.isPromotedPost(postElement)) {
          console.log('PostDetector: Skipping promoted post');
          return;
        }
        
        const saveButton = this.buttonManager.createSaveButton();
        
        // Try multiple possible locations for the actions bar in order of preference
        const actionSelectors = [
          '.feed-shared-social-action-bar',
          '.social-actions-bar', 
          '.feed-shared-footer',
          '.feed-shared-social-counts-bar',
          '.social-counts-bar'
        ];
        
        let actionsBar = null;
        for (const selector of actionSelectors) {
          actionsBar = postElement.querySelector(selector);
          if (actionsBar) {
            console.log(`PostDetector: Found actions bar with selector: ${selector}`);
            break;
          }
        }
        
        if (actionsBar) {
          const buttonContainer = document.createElement('div');
          buttonContainer.className = 'linkedin-post-saver-container';
          buttonContainer.style.cssText = 'display: inline-flex; align-items: center; margin-right: 8px;';
          buttonContainer.appendChild(saveButton);
          
          // Insert at the beginning of the actions bar for better alignment
          actionsBar.insertBefore(buttonContainer, actionsBar.firstChild);
          console.log('PostDetector: Save button added successfully to actions bar');
        } else {
          // Fallback: add to a more reliable location within the post
          console.log('PostDetector: No actions bar found, trying fallback locations');
          
          const fallbackSelectors = [
            '.feed-shared-update-v2__description',
            '.feed-shared-text',
            '.feed-shared-update-v2'
          ];
          
          let fallbackLocation = null;
          for (const selector of fallbackSelectors) {
            fallbackLocation = postElement.querySelector(selector);
            if (fallbackLocation) break;
          }
          
          if (fallbackLocation) {
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'linkedin-post-saver-container';
            buttonContainer.style.cssText = 'margin: 10px 0; text-align: right; border-top: 1px solid #e0e0e0; padding-top: 8px;';
            buttonContainer.appendChild(saveButton);
            fallbackLocation.parentNode.insertBefore(buttonContainer, fallbackLocation.nextSibling);
            console.log('PostDetector: Save button added to fallback location');
          } else {
            console.log('PostDetector: No suitable location found for save button');
          }
        }
      } catch (error) {
        console.error('PostDetector: Error adding button to post:', error);
      }
    }

    observeNewPosts() {
      console.log('PostDetector: Starting post observation');
      
      const observer = new MutationObserver((mutations) => {
        // Clear existing timeout to debounce rapid mutations
        if (this.observerTimeout) {
          clearTimeout(this.observerTimeout);
        }
        
        this.observerTimeout = setTimeout(() => {
          this.processNewPosts(mutations);
        }, 300);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      console.log('PostDetector: Observer started');
    }

    processNewPosts(mutations) {
      const newPosts = [];
      
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Check if the node itself is a post
            if (node.matches && node.matches(this.postSelectors.join(', '))) {
              newPosts.push(node);
            }
            
            // Check for posts within the added node
            if (node.querySelectorAll) {
              const posts = node.querySelectorAll(this.postSelectors.join(', '));
              posts.forEach(post => newPosts.push(post));
            }
          }
        });
      });

      // Process unique posts only
      const uniquePosts = Array.from(new Set(newPosts));
      console.log(`PostDetector: Processing ${uniquePosts.length} unique new posts`);
      
      uniquePosts.forEach(post => {
        const postId = this.getPostId(post);
        if (postId && !this.processedPosts.has(postId) && !post.querySelector('.linkedin-post-saver-btn') && !this.isPromotedPost(post)) {
          console.log('PostDetector: Adding button to new post', post);
          this.addSaveButtonToPost(post);
          this.processedPosts.add(postId);
        }
      });
    }
  }

  // Extension Initializer Class
  class ExtensionInitializer {
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