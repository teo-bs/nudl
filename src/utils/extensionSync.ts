
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function initializeExtensionSync() {
  // Listen for posts saved by the extension
  window.addEventListener('croi-post-saved', (event: any) => {
    console.log('Dashboard: Post saved by extension:', event.detail);
    
    // Show toast notification
    toast({
      title: "Post saved! 🎉",
      description: "Your LinkedIn post has been saved successfully.",
    });
    
    // Refresh the dashboard data
    window.dispatchEvent(new CustomEvent('croi-refresh-dashboard'));
  });
  
  // Set up dashboard save function for extension
  (window as any).croiDashboard = {
    savePost: async (postData: any) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            ...postData,
            user_id: user.id,
            saved_at: new Date().toISOString(),
            is_favorite: false,
            read_status: false,
            status: 'active'
          });
        
        if (error) throw error;
        
        // Trigger refresh event
        window.dispatchEvent(new CustomEvent('croi-post-saved', {
          detail: postData
        }));
        
        return { success: true };
      } catch (error) {
        console.error('Dashboard: Error saving post:', error);
        return { success: false, error: error.message };
      }
    }
  };
  
  // Handle session sync from extension
  chrome?.runtime?.onMessage?.addListener?.((request, sender, sendResponse) => {
    if (request.action === 'getSession') {
      supabase.auth.getSession().then(({ data: { session } }) => {
        sendResponse({ success: true, session });
      });
      return true;
    }
  });
  
  console.log('Extension sync initialized');
}
