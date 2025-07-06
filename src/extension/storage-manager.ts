
import type { PostData } from './post-extractor';

export class StorageManager {
  async savePost(postData: PostData): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime || !chrome.runtime.sendMessage) {
        reject(new Error('Chrome runtime not available'));
        return;
      }

      console.log('StorageManager: Sending save post message to service worker');

      chrome.runtime.sendMessage(
        { action: 'savePost', postData },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error('StorageManager: Chrome runtime error:', chrome.runtime.lastError.message);
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          
          if (response && response.success) {
            console.log('StorageManager: Post saved successfully:', response.post);
            resolve(response.post);
          } else {
            console.error('StorageManager: Failed to save post:', response?.error);
            reject(new Error(response?.error || 'Failed to save post'));
          }
        }
      );
    });
  }

  async getSavedPosts(): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime || !chrome.runtime.sendMessage) {
        reject(new Error('Chrome runtime not available'));
        return;
      }

      chrome.runtime.sendMessage(
        { action: 'getSavedPosts' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          
          if (response && response.success) {
            resolve(response.posts || []);
          } else {
            reject(new Error(response?.error || 'Failed to get saved posts'));
          }
        }
      );
    });
  }

  async syncWithBackend(): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!chrome.runtime || !chrome.runtime.sendMessage) {
        reject(new Error('Chrome runtime not available'));
        return;
      }

      chrome.runtime.sendMessage(
        { action: 'syncWithBackend' },
        (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
            return;
          }
          
          if (response && response.success) {
            resolve(response);
          } else {
            reject(new Error(response?.error || 'Failed to sync with backend'));
          }
        }
      );
    });
  }
}
