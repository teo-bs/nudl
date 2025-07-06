interface PostData {
  content: string;
  author_name?: string;
  author_profile_url?: string;
  author_avatar_url?: string;
  post_url: string;
  post_date?: string;
  linkedin_post_id?: string;
  title?: string;
}

export class StorageManager {
  async savePost(postData: PostData): Promise<void> {
    try {
      // First save to local storage
      await this.saveToLocalStorage(postData);
      
      // Then try to sync with dashboard
      await this.syncWithDashboard(postData);
      
      console.log('StorageManager: Post saved successfully');
    } catch (error) {
      console.error('StorageManager: Error saving post:', error);
      throw error;
    }
  }
  
  private async saveToLocalStorage(postData: PostData): Promise<void> {
    // Check if post already exists locally
    const existingPosts = await this.getSavedPosts();
    const isDuplicate = existingPosts.some(post => 
      post.linkedin_post_id === postData.linkedin_post_id ||
      post.post_url === postData.post_url ||
      (post.content === postData.content && post.author_name === postData.author_name)
    );
    
    if (isDuplicate) {
      throw new Error('Post already saved');
    }
    
    // Create post object with timestamp
    const postToSave = {
      ...postData,
      id: Date.now().toString(),
      saved_at: new Date().toISOString()
    };
    
    // Save to Chrome storage
    const result = await chrome.storage.local.get(['savedPosts']);
    const savedPosts = result.savedPosts || [];
    savedPosts.unshift(postToSave);
    
    // Keep only last 100 posts to prevent storage bloat
    if (savedPosts.length > 100) {
      savedPosts.splice(100);
    }
    
    await chrome.storage.local.set({ savedPosts });
  }
  
  private async syncWithDashboard(postData: PostData): Promise<void> {
    try {
      // Find dashboard tab
      const tabs = await chrome.tabs.query({});
      const dashboardTab = tabs.find(tab => 
        tab.url && (
          tab.url.includes('nudl.lovable.app') || 
          tab.url.includes('lovable.app') ||
          tab.url.includes('localhost') ||
          tab.url.includes('127.0.0.1')
        )
      );
      
      if (dashboardTab && dashboardTab.id) {
        console.log('StorageManager: Syncing with dashboard...');
        
        try {
          // Try to send message via content script
          const response = await chrome.tabs.sendMessage(dashboardTab.id, {
            action: 'savePostToDatabase',
            postData: {
              ...postData,
              // Ensure title is set
              title: postData.title || (postData.content.length > 60 ? 
                postData.content.substring(0, 57) + '...' : 
                postData.content)
            }
          });
          
          if (response?.success) {
            console.log('StorageManager: Successfully synced with dashboard');
          } else {
            console.log('StorageManager: Dashboard sync failed:', response?.error);
          }
        } catch (error) {
          console.log('StorageManager: Could not sync with dashboard:', error.message);
          
          // Fallback: try injecting script to send message
          try {
            await chrome.scripting.executeScript({
              target: { tabId: dashboardTab.id },
              func: (data) => {
                window.postMessage({
                  action: 'savePostToDatabase',
                  postData: data
                }, '*');
              },
              args: [postData]
            });
          } catch (scriptError) {
            console.log('StorageManager: Script injection also failed:', scriptError.message);
          }
        }
      } else {
        console.log('StorageManager: No dashboard tab found for syncing');
      }
    } catch (error) {
      console.log('StorageManager: Dashboard sync error:', error.message);
      // Don't throw - local save is still successful
    }
  }
  
  async getSavedPosts(): Promise<any[]> {
    try {
      const result = await chrome.storage.local.get(['savedPosts']);
      return result.savedPosts || [];
    } catch (error) {
      console.error('StorageManager: Error getting saved posts:', error);
      return [];
    }
  }
  
  async clearSavedPosts(): Promise<void> {
    try {
      await chrome.storage.local.set({ savedPosts: [] });
      console.log('StorageManager: Cleared all saved posts');
    } catch (error) {
      console.error('StorageManager: Error clearing saved posts:', error);
      throw error;
    }
  }
}
