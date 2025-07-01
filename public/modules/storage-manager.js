
// Communication with background script module
export class StorageManager {
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
