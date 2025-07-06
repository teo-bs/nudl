
interface PostData {
  content: string;
  author_name?: string;
  author_profile_url?: string;
  author_avatar_url?: string;
  post_url: string;
  post_date?: string;
  linkedin_post_id?: string;
}

export class StorageManager {
  async savePost(postData: PostData): Promise<void> {
    try {
      // Check if post already exists
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
      
      await chrome.storage.local.set({ savedPosts });
      
      console.log('StorageManager: Post saved successfully');
    } catch (error) {
      console.error('StorageManager: Error saving post:', error);
      throw error;
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
}
