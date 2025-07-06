
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
      '.feed-shared-update-v2[data-urn]',
      '.feed-shared-update-v2__description-wrapper',
      '[data-urn*="urn:li:activity"]',
      '.update-components-update-v2',
      '.feed-shared-post'
    ];
    
    // Ensure ButtonManager is available
    if (!window.ButtonManager) {
      console.error('PostDetector: ButtonManager not available');
      return;
    }
    
    this.buttonManager = new window.ButtonManager();
    this.processedPosts = new Set();
    this.observerTimeout = null;
    this.isInitialized = false;
    
    console.log('PostDetector initialized with enhanced selectors:', this.postSelectors.length, 'selectors');
  }

  initialize() {
    if (this.isInitialized) {
      console.log('PostDetector: Already initialized, skipping');
      return;
    }
    
    if (!this.buttonManager) {
      console.error('PostDetector: Cannot initialize without ButtonManager');
      return;
    }
    
    console.log('PostDetector: Starting initialization');
    this.isInitialized = true;
    
    // Add initial delay to ensure page is ready
    setTimeout(() => {
      this.addSaveButtonsToExistingPosts();
      this.observeNewPosts();
    }, 1000);
  }

  isPromotedPost(postElement) {
    // Check all text content in the post first
    const allText = postElement.textContent?.toLowerCase() || '';
    
    // Check for promoted/sponsored indicators
    if (allText.includes('promoted') || allText.includes('sponsored') || allText.includes('•promoted')) {
      return true;
    }
    
    return false;
  }

  isJobUpdate(postElement) {
    // Check for job update indicators
    const allText = postElement.textContent?.toLowerCase() || '';
    
    // Check for job-related keywords
    const jobKeywords = [
      'is hiring',
      'we\'re hiring',
      'join our team',
      'job opportunity',
      'open position',
      'career opportunity',
      'apply now',
      'new job',
      'job opening',
      'hiring for',
      'looking for a',
      'posted a job'
    ];
    
    for (const keyword of jobKeywords) {
      if (allText.includes(keyword)) {
        return true;
      }
    }
    
    // Check for job posting elements
    const jobSelectors = [
      '[data-test-id*="job"]',
      '.job-posting',
      '.hiring-card',
      '[aria-label*="job"]',
      '[aria-label*="hiring"]'
    ];
    
    for (const selector of jobSelectors) {
      if (postElement.querySelector(selector)) {
        return true;
      }
    }
    
    return false;
  }

  addSaveButtonsToExistingPosts() {
    try {
      console.log('PostDetector: Looking for existing posts...');
      
      const allPosts = document.querySelectorAll(this.postSelectors.join(', '));
      console.log(`PostDetector: Total posts found: ${allPosts.length}`);
      
      let processedCount = 0;
      let skippedCount = 0;
      
      allPosts.forEach((post, index) => {
        const postId = this.getPostId(post) || `fallback-${index}-${Date.now()}`;
        
        // Skip if already has button
        if (post.querySelector('.linkedin-post-saver-btn')) {
          skippedCount++;
          return;
        }
        
        // Skip if already processed
        if (this.processedPosts.has(postId)) {
          skippedCount++;
          return;
        }
        
        // Check if this post should be skipped
        if (this.isPromotedPost(post) || this.isJobUpdate(post)) {
          this.processedPosts.add(postId);
          skippedCount++;
          return;
        }
        
        this.addSaveButtonToPost(post);
        this.processedPosts.add(postId);
        processedCount++;
      });
      
      console.log(`PostDetector: Processed ${processedCount} posts, skipped ${skippedCount} posts`);
    } catch (error) {
      console.error('PostDetector: Error adding save buttons:', error);
    }
  }

  getPostId(postElement) {
    // Try multiple methods to get a unique ID
    const urn = postElement.getAttribute('data-urn') || 
                postElement.getAttribute('data-id') || 
                postElement.getAttribute('data-activity-urn') ||
                postElement.querySelector('[data-urn]')?.getAttribute('data-urn');
                
    if (urn) return urn;
    
    // Fallback: create ID from post content
    const content = postElement.textContent?.trim();
    if (content) {
      return `content-${content.substring(0, 50).replace(/\s+/g, '-')}-${content.length}`;
    }
    
    // Last resort: position-based ID
    return `position-${Array.from(document.querySelectorAll(this.postSelectors.join(', '))).indexOf(postElement)}`;
  }

  addSaveButtonToPost(postElement) {
    try {
      // Double-check if this post should be skipped (redundant safety check)
      if (this.isPromotedPost(postElement) || this.isJobUpdate(postElement)) {
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
      } else {
        // Fallback: add to a more reliable location within the post
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
        // Also re-check existing posts periodically
        this.addSaveButtonsToExistingPosts();
      }, 800); // Increased timeout for better performance
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
    if (uniquePosts.length > 0) {
      console.log(`PostDetector: Processing ${uniquePosts.length} unique new posts`);
    }
    
    uniquePosts.forEach(post => {
      const postId = this.getPostId(post) || `new-${Date.now()}-${Math.random()}`;
      
      // Skip if already has button
      if (post.querySelector('.linkedin-post-saver-btn')) {
        return;
      }
      
      // Skip if already processed
      if (this.processedPosts.has(postId)) {
        return;
      }
      
      // Check if this post should be skipped
      if (this.isPromotedPost(post) || this.isJobUpdate(post)) {
        this.processedPosts.add(postId);
        return;
      }
      
      this.addSaveButtonToPost(post);
      this.processedPosts.add(postId);
    });
  }
}

// Make PostDetector available globally
window.PostDetector = PostDetector;
