
// Dashboard content script for syncing with extension
console.log('Croi Dashboard: Content script loaded');

// Listen for messages from the Chrome extension
window.addEventListener('message', async (event) => {
  if (event.origin !== window.location.origin) return;
  
  if (event.data.action === 'savePostToDatabase') {
    console.log('Croi Dashboard: Received save post request:', event.data.postData);
    
    // Get the Supabase client from the global scope
    if (window.supabase && window.supabaseAuth) {
      try {
        const { data: { user } } = await window.supabaseAuth.getUser();
        
        if (!user) {
          console.log('Croi Dashboard: User not authenticated');
          return;
        }
        
        const postData = {
          ...event.data.postData,
          user_id: user.id,
          saved_at: new Date().toISOString(),
          is_favorite: false,
          read_status: false,
          status: 'active'
        };
        
        const { error } = await window.supabase
          .from('saved_posts')
          .insert(postData);
        
        if (error) {
          console.error('Croi Dashboard: Error saving post:', error);
        } else {
          console.log('Croi Dashboard: Post saved successfully');
          
          // Trigger a refresh of the dashboard if needed
          window.dispatchEvent(new CustomEvent('croi-post-saved', {
            detail: postData
          }));
        }
      } catch (error) {
        console.error('Croi Dashboard: Error in save handler:', error);
      }
    }
  }
});

// Make Supabase client available globally for extension communication
if (typeof window !== 'undefined') {
  // This will be set by the main app
  window.croiDashboard = {
    savePost: async (postData) => {
      console.log('Croi Dashboard: Direct save post request:', postData);
      // Implementation will be added by the main app
    }
  };
}
