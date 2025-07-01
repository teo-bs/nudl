
// Post detection and observation module
export class PostDetector {
  constructor() {
    this.postSelectors = [
      '[data-urn*="urn:li:activity:"]',
      '.feed-shared-update-v2',
      '.feed-shared-update-v2__content',
      'article[data-urn]'
    ];
  }

  initialize() {
    this.addSaveButtonsToExistingPosts();
    this.observeNewPosts();
  }

  addSaveButtonsToExistingPosts() {
    try {
      const posts = document.querySelectorAll(this.postSelectors.join(', '));
      console.log(`LinkedIn Post Saver: Found ${posts.length} posts`);
      
      posts.forEach(post => {
        if (!post.querySelector('.linkedin-post-saver-btn')) {
          this.addSaveButtonToPost(post);
        }
      });
    } catch (error) {
      console.error('LinkedIn Post Saver: Error adding save buttons:', error);
    }
  }

  async addSaveButtonToPost(postElement) {
    try {
      const { ButtonManager } = await import('./button-manager.js');
      const buttonManager = new ButtonManager();
      const saveButton = buttonManager.createSaveButton();
      
      const actionsBar = postElement.querySelector([
        '.feed-shared-social-action-bar',
        '.social-actions-bar',
        '.feed-shared-social-counts-bar',
        '.feed-shared-footer'
      ].join(', '));
      
      if (actionsBar) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'linkedin-post-saver-container';
        buttonContainer.appendChild(saveButton);
        
        actionsBar.insertBefore(buttonContainer, actionsBar.firstChild);
      } else {
        console.log('LinkedIn Post Saver: Could not find actions bar for post');
      }
    } catch (error) {
      console.error('LinkedIn Post Saver: Error adding button to post:', error);
    }
  }

  observeNewPosts() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            if (node.matches && node.matches(this.postSelectors.join(', '))) {
              setTimeout(() => this.addSaveButtonToPost(node), 100);
            }
            
            const posts = node.querySelectorAll && node.querySelectorAll(this.postSelectors.join(', '));
            if (posts && posts.length > 0) {
              posts.forEach(post => {
                if (!post.querySelector('.linkedin-post-saver-btn')) {
                  setTimeout(() => this.addSaveButtonToPost(post), 100);
                }
              });
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}
