
// Save button creation and interaction module
export class ButtonManager {
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
      const { NotificationManager } = await import('./notification-manager.js');
      const notificationManager = new NotificationManager();
      notificationManager.show('Error: Could not find post content', 'error');
      return;
    }

    const { PostExtractor } = await import('./post-extractor.js');
    const postExtractor = new PostExtractor();
    const postData = postExtractor.extractPostData(postElement);
    
    if (!postData || !postData.content) {
      const { NotificationManager } = await import('./notification-manager.js');
      const notificationManager = new NotificationManager();
      notificationManager.show('Error: Could not extract post data', 'error');
      return;
    }

    this.updateButtonState(button, 'saving');

    try {
      const { StorageManager } = await import('./storage-manager.js');
      const storageManager = new StorageManager();
      await storageManager.savePost(postData);
      
      this.updateButtonState(button, 'saved');
      
      const { NotificationManager } = await import('./notification-manager.js');
      const notificationManager = new NotificationManager();
      notificationManager.show('Post saved successfully! 🎉', 'success');
      
      setTimeout(() => this.resetButton(button), 3000);
      
    } catch (error) {
      console.error('Error saving post:', error);
      this.updateButtonState(button, 'error');
      
      const { NotificationManager } = await import('./notification-manager.js');
      const notificationManager = new NotificationManager();
      notificationManager.show('Error saving post. Please try again.', 'error');
      
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
