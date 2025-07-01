
// LinkedIn Post Saver Content Script
(() => {
  let isExtensionActive = true;
  let isInitialized = false;

  // Initialize the extension with retry logic
  init();

  async function init() {
    if (isInitialized) return;
    
    console.log('LinkedIn Post Saver: Content script loaded');
    
    // Wait for page to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeExtension);
    } else {
      initializeExtension();
    }
  }

  function initializeExtension() {
    try {
      // Add save buttons to existing posts
      addSaveButtonsToExistingPosts();
      
      // Watch for new posts being loaded
      observeNewPosts();
      
      isInitialized = true;
      console.log('LinkedIn Post Saver: Extension initialized successfully');
    } catch (error) {
      console.error('LinkedIn Post Saver: Initialization error:', error);
      // Retry after a short delay
      setTimeout(() => {
        isInitialized = false;
        init();
      }, 2000);
    }
  }

  function createSaveButton() {
    const button = document.createElement('button');
    button.className = 'linkedin-post-saver-btn';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
      </svg>
      <span>Save</span>
    `;
    
    button.addEventListener('click', handleSavePost);
    return button;
  }

  function addSaveButtonsToExistingPosts() {
    try {
      // Find all LinkedIn post containers with more specific selectors
      const posts = document.querySelectorAll([
        '[data-urn*="urn:li:activity:"]',
        '.feed-shared-update-v2',
        '.feed-shared-update-v2__content',
        'article[data-urn]'
      ].join(', '));
      
      console.log(`LinkedIn Post Saver: Found ${posts.length} posts`);
      
      posts.forEach(post => {
        if (!post.querySelector('.linkedin-post-saver-btn')) {
          addSaveButtonToPost(post);
        }
      });
    } catch (error) {
      console.error('LinkedIn Post Saver: Error adding save buttons:', error);
    }
  }

  function addSaveButtonToPost(postElement) {
    try {
      const saveButton = createSaveButton();
      
      // Find the best place to insert the button with multiple fallback options
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
        
        // Insert at the beginning of the actions bar
        actionsBar.insertBefore(buttonContainer, actionsBar.firstChild);
      } else {
        console.log('LinkedIn Post Saver: Could not find actions bar for post');
      }
    } catch (error) {
      console.error('LinkedIn Post Saver: Error adding button to post:', error);
    }
  }

  async function handleSavePost(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const postElement = button.closest('[data-urn*="urn:li:activity:"], .feed-shared-update-v2, article[data-urn]');
    
    if (!postElement) {
      showNotification('Error: Could not find post content', 'error');
      return;
    }

    // Extract post data
    const postData = extractPostData(postElement);
    
    if (!postData || !postData.content) {
      showNotification('Error: Could not extract post data', 'error');
      return;
    }

    // Update button state
    button.disabled = true;
    button.innerHTML = `
      <div class="linkedin-post-saver-spinner"></div>
      <span>Saving...</span>
    `;

    try {
      // Save the post
      await savePost(postData);
      
      // Update button to success state
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span>Saved</span>
      `;
      button.classList.add('saved');
      
      showNotification('Post saved successfully! 🎉', 'success');
      
      // Reset button after 3 seconds
      setTimeout(() => {
        button.disabled = false;
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          <span>Save</span>
        `;
        button.classList.remove('saved');
      }, 3000);
      
    } catch (error) {
      console.error('Error saving post:', error);
      
      // Reset button to error state
      button.disabled = false;
      button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>Error</span>
      `;
      
      showNotification('Error saving post. Please try again.', 'error');
      
      // Reset button after 3 seconds
      setTimeout(() => {
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
          <span>Save</span>
        `;
      }, 3000);
    }
  }

  function extractPostData(postElement) {
    try {
      // Extract author information with multiple selector fallbacks
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
      
      // Extract post content with multiple selector fallbacks
      const contentElement = postElement.querySelector([
        '.feed-shared-text',
        '.update-components-text',
        '.feed-shared-update-v2__description',
        '[data-test-id="main-feed-activity-card"] .break-words'
      ].join(', '));
      const content = contentElement?.textContent?.trim() || '';
      
      // Extract post URL (try to get permalink)
      const postUrl = window.location.href.split('?')[0] + '?utm_source=linkedin_post_saver';
      
      // Extract post ID from data attributes
      const postId = postElement.getAttribute('data-urn') || 
                   postElement.getAttribute('data-id') || 
                   Date.now().toString();
      
      // Extract timestamp if available
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

  async function savePost(postData) {
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

  function showNotification(message, type = 'info') {
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

  function observeNewPosts() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            // Check if the added node is a post
            if (node.matches && node.matches('[data-urn*="urn:li:activity:"], .feed-shared-update-v2, article[data-urn]')) {
              setTimeout(() => addSaveButtonToPost(node), 100);
            }
            
            // Check if the added node contains posts
            const posts = node.querySelectorAll && node.querySelectorAll('[data-urn*="urn:li:activity:"], .feed-shared-update-v2, article[data-urn]');
            if (posts && posts.length > 0) {
              posts.forEach(post => {
                if (!post.querySelector('.linkedin-post-saver-btn')) {
                  setTimeout(() => addSaveButtonToPost(post), 100);
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

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getSavedPosts') {
      chrome.storage.local.get(['savedPosts']).then(result => {
        sendResponse({ posts: result.savedPosts || [] });
      });
      return true; // Indicates we will send a response asynchronously
    }
    
    if (request.action === 'toggleExtension') {
      isExtensionActive = !isExtensionActive;
      const buttons = document.querySelectorAll('.linkedin-post-saver-btn');
      buttons.forEach(btn => {
        btn.style.display = isExtensionActive ? 'flex' : 'none';
      });
      sendResponse({ active: isExtensionActive });
    }
  });
})();
