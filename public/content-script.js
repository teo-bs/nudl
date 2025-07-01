// LinkedIn Post Saver Content Script
(() => {
  let isExtensionActive = true;
  let currentUser = null;

  // Initialize the extension
  init();

  async function init() {
    console.log('LinkedIn Post Saver: Content script loaded');
    
    // Check if user is authenticated
    await checkAuth();
    
    if (!currentUser) {
      console.log('LinkedIn Post Saver: User not authenticated, skipping initialization');
      return;
    }

    // Add save buttons to existing posts
    addSaveButtonsToExistingPosts();
    
    // Watch for new posts being loaded
    observeNewPosts();
  }

  async function checkAuth() {
    try {
      // This would normally check with your backend
      // For now, we'll simulate authentication
      const authData = await chrome.storage.local.get(['user']);
      currentUser = authData.user || null;
    } catch (error) {
      console.error('Error checking auth:', error);
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
    // Find all LinkedIn post containers
    const posts = document.querySelectorAll('[data-urn*="urn:li:activity:"], .feed-shared-update-v2');
    
    posts.forEach(post => {
      if (!post.querySelector('.linkedin-post-saver-btn')) {
        addSaveButtonToPost(post);
      }
    });
  }

  function addSaveButtonToPost(postElement) {
    const saveButton = createSaveButton();
    
    // Find the best place to insert the button
    const actionsBar = postElement.querySelector('.feed-shared-social-action-bar, .social-actions-bar');
    
    if (actionsBar) {
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'linkedin-post-saver-container';
      buttonContainer.appendChild(saveButton);
      
      // Insert at the beginning of the actions bar
      actionsBar.insertBefore(buttonContainer, actionsBar.firstChild);
    }
  }

  async function handleSavePost(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const postElement = button.closest('[data-urn*="urn:li:activity:"], .feed-shared-update-v2');
    
    if (!postElement) {
      showNotification('Error: Could not find post content', 'error');
      return;
    }

    // Extract post data
    const postData = extractPostData(postElement);
    
    if (!postData) {
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
      // Extract author information
      const authorElement = postElement.querySelector('.feed-shared-actor__name, .update-components-actor__name');
      const authorName = authorElement?.textContent?.trim() || 'Unknown Author';
      
      const authorImageElement = postElement.querySelector('.feed-shared-actor__avatar img, .presence-entity__image');
      const authorAvatar = authorImageElement?.src || '';
      
      // Extract post content
      const contentElement = postElement.querySelector('.feed-shared-text, .update-components-text');
      const content = contentElement?.textContent?.trim() || '';
      
      // Extract post URL (try to get permalink)
      const postUrl = window.location.href;
      
      // Extract post ID from data attributes
      const postId = postElement.getAttribute('data-urn') || '';
      
      // Extract timestamp if available
      const timeElement = postElement.querySelector('time, .feed-shared-actor__sub-description');
      const timestamp = timeElement?.getAttribute('datetime') || new Date().toISOString();

      return {
        content,
        author_name: authorName,
        author_avatar_url: authorAvatar,
        post_url: postUrl,
        linkedin_post_id: postId,
        post_date: timestamp,
        title: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      };
    } catch (error) {
      console.error('Error extracting post data:', error);
      return null;
    }
  }

  async function savePost(postData) {
    // In a real implementation, this would send the data to your backend
    // For now, we'll store it locally and show in the popup
    
    const existingPosts = await chrome.storage.local.get(['savedPosts']);
    const savedPosts = existingPosts.savedPosts || [];
    
    const newPost = {
      id: Date.now().toString(),
      ...postData,
      saved_at: new Date().toISOString(),
      is_favorite: false,
      read_status: false,
    };
    
    savedPosts.unshift(newPost);
    
    // Keep only the last 100 posts to avoid storage issues
    if (savedPosts.length > 100) {
      savedPosts.splice(100);
    }
    
    await chrome.storage.local.set({ savedPosts });
    
    // TODO: Send to backend API
    // await sendToBackend(newPost);
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
            if (node.matches && node.matches('[data-urn*="urn:li:activity:"], .feed-shared-update-v2')) {
              addSaveButtonToPost(node);
            }
            
            // Check if the added node contains posts
            const posts = node.querySelectorAll && node.querySelectorAll('[data-urn*="urn:li:activity:"], .feed-shared-update-v2');
            if (posts) {
              posts.forEach(post => {
                if (!post.querySelector('.linkedin-post-saver-btn')) {
                  addSaveButtonToPost(post);
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
