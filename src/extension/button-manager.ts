import { StorageManager } from './storage-manager';
import { NotificationManager } from './notification-manager';
import { PostExtractor } from './post-extractor';

export class ButtonManager {
  private storageManager: StorageManager;
  private notificationManager: NotificationManager;
  private postExtractor: PostExtractor;

  constructor() {
    this.storageManager = new StorageManager();
    this.notificationManager = new NotificationManager();
    this.postExtractor = new PostExtractor();
  }

  createSaveButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'croi-btn';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
      </svg>
      <span>Save</span>
    `;
    
    button.addEventListener('click', (event) => this.handleSavePost(event));
    return button;
  }

  private async handleSavePost(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget as HTMLButtonElement;
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
      
      // Check if it's a duplicate post error
      if (error instanceof Error && error.message && error.message.includes('already saved')) {
        this.updateButtonState(button, 'saved');
        this.notificationManager.show('Post already saved! ✓', 'info');
        setTimeout(() => this.resetButton(button), 2000);
      } else {
        this.updateButtonState(button, 'error');
        this.notificationManager.show('Error saving post. Please try again.', 'error');
        setTimeout(() => this.resetButton(button), 3000);
      }
    }
  }

  private updateButtonState(button: HTMLButtonElement, state: 'saving' | 'saved' | 'error'): void {
    button.disabled = true;
    
    switch (state) {
      case 'saving':
        button.innerHTML = `
          <div class="croi-spinner"></div>
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

  private resetButton(button: HTMLButtonElement): void {
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