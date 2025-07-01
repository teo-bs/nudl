
// Post detection and observation module
export class PostDetector {
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
      
      // Try each selector individually to see which ones work
      this.postSelectors.forEach(selector => {
        const posts = document.querySelectorAll(selector);
        console.log(`PostDetector: Selector "${selector}" found ${posts.length} posts`);
      });
      
      const allPosts = document.querySelectorAll(this.postSelectors.join(', '));
      console.log(`PostDetector: Total posts found: ${allPosts.length}`);
      
      allPosts.forEach((post, index) => {
        console.log(`PostDetector: Processing post ${index + 1}`, post);
        if (!post.querySelector('.linkedin-post-saver-btn')) {
          this.addSaveButtonToPost(post);
        } else {
          console.log(`PostDetector: Post ${index + 1} already has save button`);
        }
      });
    } catch (error) {
      console.error('PostDetector: Error adding save buttons:', error);
    }
  }

  async addSaveButtonToPost(postElement) {
    try {
      console.log('PostDetector: Adding save button to post', postElement);
      
      const { ButtonManager } = await import('./button-manager.js');
      const buttonManager = new ButtonManager();
      const saveButton = buttonManager.createSaveButton();
      
      // Try multiple possible locations for the actions bar
      const actionSelectors = [
        '.feed-shared-social-action-bar',
        '.social-actions-bar',
        '.feed-shared-footer',
        '.feed-shared-social-counts-bar',
        '.social-counts-bar',
        '.feed-shared-update-v2__description',
        '.feed-shared-text'
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
        buttonContainer.appendChild(saveButton);
        
        // Insert at the beginning of the actions bar
        actionsBar.insertBefore(buttonContainer, actionsBar.firstChild);
        console.log('PostDetector: Save button added successfully');
      } else {
        // Fallback: add to the end of the post
        console.log('PostDetector: No actions bar found, adding to post end');
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'linkedin-post-saver-container';
        buttonContainer.style.cssText = 'margin: 10px 0; text-align: right;';
        buttonContainer.appendChild(saveButton);
        postElement.appendChild(buttonContainer);
      }
    } catch (error) {
      console.error('PostDetector: Error adding button to post:', error);
    }
  }

  observeNewPosts() {
    console.log('PostDetector: Starting post observation');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Check if the node itself is a post
            if (node.matches && node.matches(this.postSelectors.join(', '))) {
              console.log('PostDetector: New post detected (direct match)', node);
              setTimeout(() => this.addSaveButtonToPost(node), 100);
            }
            
            // Check for posts within the added node
            if (node.querySelectorAll) {
              const posts = node.querySelectorAll(this.postSelectors.join(', '));
              if (posts && posts.length > 0) {
                console.log(`PostDetector: Found ${posts.length} new posts in added content`);
                posts.forEach(post => {
                  if (!post.querySelector('.linkedin-post-saver-btn')) {
                    setTimeout(() => this.addSaveButtonToPost(post), 100);
                  }
                });
              }
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('PostDetector: Observer started');
  }
}
