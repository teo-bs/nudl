import { supabase } from '@/integrations/supabase/client';

interface ExtensionPostData {
  content: string;
  author_name: string;
  author_avatar_url: string;
  post_url: string;
  linkedin_post_id: string;
  post_date: string;
  title: string;
}

export function initializeExtensionSync() {
  // Listen for messages from the Chrome extension
  if (typeof window !== 'undefined') {
    console.log('Extension sync initialized - listening for messages');
    
    window.addEventListener('message', async (event) => {
      console.log('Extension sync received message:', event.data);
      
      if (event.data.action === 'savePostToDatabase') {
        try {
          const result = await savePostToDatabase(event.data.postData);
          console.log('Post saved successfully:', result);
          // Send response back to extension
          window.postMessage({
            action: 'savePostResponse',
            success: true,
            result: result
          }, '*');
        } catch (error) {
          console.error('Error saving post from extension:', error);
          // Send error response back to extension
          window.postMessage({
            action: 'savePostResponse',
            success: false,
            error: (error as Error).message
          }, '*');
        }
      } else if (event.data.action === 'getUserDetails') {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          console.log('Sending user details to extension:', user);
          window.postMessage({ 
            action: 'getUserDetailsResponse', 
            user: user 
          }, '*');
        } catch (error) {
          console.error('Error getting user details:', error);
          window.postMessage({ 
            action: 'getUserDetailsResponse', 
            user: null 
          }, '*');
        }
      }
    });

    // Also listen for chrome extension messages if available
    if ((window as any).chrome && (window as any).chrome.runtime) {
      (window as any).chrome.runtime.onMessage?.addListener(async (message: any, sender: any, sendResponse: any) => {
        if (message.action === 'savePostToDatabase') {
          try {
            await savePostToDatabase(message.postData);
            sendResponse({ success: true });
          } catch (error) {
            console.error('Error saving post from extension:', error);
            sendResponse({ success: false, error: (error as Error).message });
          }
        } else if (message.action === 'getUserDetails') {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            sendResponse({ success: true, user: user });
          } catch (error) {
            console.error('Error getting user details:', error);
            sendResponse({ success: false, user: null });
          }
        }
        return true; // Keep the message channel open for async response
      });
    }
  }
}

async function savePostToDatabase(postData: ExtensionPostData) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log('User not authenticated, cannot save post');
    throw new Error('User not authenticated');
  }

  // Check if post already exists
  const { data: existingPost, error: searchError } = await supabase
    .from('saved_posts')
    .select('id')
    .eq('user_id', user.id)
    .or(`post_url.eq.${postData.post_url},linkedin_post_id.eq.${postData.linkedin_post_id}`)
    .maybeSingle();

  if (searchError) {
    console.error('Error checking for existing post:', searchError);
    throw searchError;
  }

  if (existingPost) {
    console.log('Post already exists in database');
    throw new Error('Post already saved');
  }

  // Save the post to Supabase
  const { data: savedPost, error } = await supabase
    .from('saved_posts')
    .insert({
      user_id: user.id,
      content: postData.content,
      title: postData.title,
      author_name: postData.author_name,
      author_avatar_url: postData.author_avatar_url,
      post_url: postData.post_url,
      linkedin_post_id: postData.linkedin_post_id,
      post_date: postData.post_date,
      saved_at: new Date().toISOString(),
      is_favorite: false,
      read_status: false,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving post to database:', error);
    throw error;
  }

  console.log('Post saved successfully to database:', savedPost);
  return savedPost;
}