
/// <reference types="chrome"/>

export interface PostData {
  content: string;
  author_name: string;
  author_avatar_url: string;
  post_url: string;
  linkedin_post_id: string;
  post_date: string;
  title: string;
}

export class StorageManager {
  async savePost(postData: PostData): Promise<any> {
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
            resolve(response.posts);
          } else {
            reject(new Error(response?.error || 'Failed to get saved posts'));
          }
        }
      );
    });
  }
}
