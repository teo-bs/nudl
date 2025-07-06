
/// <reference types="chrome"/>

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

// Service worker for Croi LinkedIn Extension
console.log('Croi Extension: Service worker starting...');

// Create custom storage adapter for chrome extension
class ChromeExtensionStorage {
  async getItem(key: string): Promise<string | null> {
    const result = await chrome.storage.local.get([key]);
    return result[key] || null;
  }

  async setItem(key: string, value: string): Promise<void> {
    await chrome.storage.local.set({ [key]: value });
  }

  async removeItem(key: string): Promise<void> {
    await chrome.storage.local.remove([key]);
  }
}

// Initialize Supabase client (will be configured after getting credentials)
let supabase: ReturnType<typeof createClient<Database>> | null = null;

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Croi Extension installed');
  
  // Set ONLY the upper-case keys
  await chrome.storage.sync.set({
    SUPABASE_URL: 'https://bcynqlevzxoyewdhmyhv.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjeW5xbGV2enhveWV3ZGhteWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNTk2OTUsImV4cCI6MjA2NjkzNTY5NX0.RraoC23cLXmvYngj4A8oDid0EVTvIDHCAI6hdYEWQyE'
  });
  
  // Set up default local storage
  chrome.storage.local.set({
    savedPosts: [],
    extensionEnabled: true,
    settings: {
      autoTag: true,
      notificationsEnabled: true,
    }
  });

  // Initialize Supabase client
  await initializeSupabase();
});

// Initialize Supabase client with stored credentials
async function initializeSupabase() {
  try {
    // Read both upper-case and lower-case keys from chrome.storage.sync
    const config = await chrome.storage.sync.get([
      'SUPABASE_URL', 'SUPABASE_ANON_KEY',
      'supabaseUrl', 'supabaseAnonKey'
    ]);
    
    // Pick whichever pair exists (prefer upper-case)
    let supabaseUrl = config.SUPABASE_URL || config.supabaseUrl;
    let supabaseAnonKey = config.SUPABASE_ANON_KEY || config.supabaseAnonKey;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase credentials not found in storage');
      return;
    }
    
    const customStorage = new ChromeExtensionStorage();
    
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: customStorage as any,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
    
    console.log('Supabase initialised');
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

// Save post to Supabase
async function savePostToSupabase(postData: any): Promise<any> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if post already exists in Supabase
  const { data: existingPosts, error: checkError } = await supabase
    .from('saved_posts')
    .select('id')
    .or(`post_url.eq.${postData.post_url},linkedin_post_id.eq.${postData.linkedin_post_id}`)
    .eq('user_id', user.id);

  if (checkError) throw checkError;

  if (existingPosts && existingPosts.length > 0) {
    throw new Error('Post already saved');
  }

  // Prepare post data for Supabase
  const supabasePostData = {
    user_id: user.id,
    content: postData.content || '',
    post_url: postData.post_url,
    linkedin_post_id: postData.linkedin_post_id,
    title: postData.title,
    author_name: postData.author_name,
    author_profile_url: postData.author_profile_url,
    author_avatar_url: postData.author_avatar_url,
    post_date: postData.post_date,
    notes: postData.notes,
    is_favorite: false,
    read_status: false,
    status: 'active' as const
  };

  // Insert to Supabase
  const { data: supabasePost, error: insertError } = await supabase
    .from('saved_posts')
    .insert(supabasePostData)
    .select()
    .single();

  if (insertError) throw insertError;

  return supabasePost;
}

// Get posts from Supabase
async function getPostsFromSupabase(): Promise<any[]> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: supabasePosts, error: fetchError } = await supabase
    .from('saved_posts')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(100);

  if (fetchError) throw fetchError;

  return supabasePosts || [];
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'savePost':
      handleSavePost(request.postData, sendResponse);
      return true; // Will respond asynchronously
      
    case 'getSavedPosts':
      handleGetSavedPosts(sendResponse);
      return true;
      
    case 'syncWithBackend':
      handleSyncWithBackend(sendResponse);
      return true;
      
    default:
      sendResponse({ error: 'Unknown action' });
  }
});

async function handleSavePost(postData: any, sendResponse: (response: any) => void) {
  try {
    // Ensure Supabase is initialized
    if (!supabase) {
      await initializeSupabase();
    }

    let savedToSupabase = false;
    let newPost: any;

    // Try to save to Supabase first (if user is authenticated)
    if (supabase) {
      try {
        newPost = await savePostToSupabase(postData);
        savedToSupabase = true;
        console.log('Post saved to Supabase successfully');
      } catch (supabaseError) {
        console.warn('Failed to save to Supabase, falling back to local storage:', supabaseError);
      }
    }

    // Fallback to local storage (or always save locally for offline access)
    if (!savedToSupabase) {
      const result = await chrome.storage.local.get(['savedPosts']);
      const savedPosts = result.savedPosts || [];
      
      // Check if post already exists locally
      const existingPost = savedPosts.find((post: any) => 
        post.post_url === postData.post_url || 
        post.linkedin_post_id === postData.linkedin_post_id
      );
      
      if (existingPost) {
        sendResponse({ success: false, error: 'Post already saved' });
        return;
      }

      newPost = {
        id: Date.now().toString(),
        ...postData,
        saved_at: new Date().toISOString(),
        is_favorite: false,
        read_status: false,
      };

      savedPosts.unshift(newPost);
      
      // Keep only the last 100 posts to avoid storage issues
      if (savedPosts.length > 100) {
        savedPosts.splice(100);
      }
      
      await chrome.storage.local.set({ savedPosts });
    } else {
      // Also save to local storage for offline access
      const result = await chrome.storage.local.get(['savedPosts']);
      const savedPosts = result.savedPosts || [];
      savedPosts.unshift(newPost);
      
      if (savedPosts.length > 100) {
        savedPosts.splice(100);
      }
      
      await chrome.storage.local.set({ savedPosts });
    }

    sendResponse({ 
      success: true, 
      post: newPost,
      savedToSupabase: savedToSupabase
    });
    
  } catch (error) {
    console.error('Error saving post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

async function handleGetSavedPosts(sendResponse: (response: any) => void) {
  try {
    // Ensure Supabase is initialized
    if (!supabase) {
      await initializeSupabase();
    }

    let posts: any[] = [];
    let fetchedFromSupabase = false;

    // Try to fetch from Supabase first (if user is authenticated)
    if (supabase) {
      try {
        posts = await getPostsFromSupabase();
        fetchedFromSupabase = true;
        console.log('Posts fetched from Supabase successfully');

        // Also update local storage with Supabase data for offline access
        await chrome.storage.local.set({ savedPosts: posts });
      } catch (supabaseError) {
        console.warn('Failed to fetch from Supabase, falling back to local storage:', supabaseError);
      }
    }

    // Fallback to local storage if Supabase failed or user not authenticated
    if (!fetchedFromSupabase) {
      const result = await chrome.storage.local.get(['savedPosts']);
      posts = result.savedPosts || [];
    }

    sendResponse({ 
      success: true, 
      posts: posts,
      fetchedFromSupabase: fetchedFromSupabase
    });
  } catch (error) {
    console.error('Error getting saved posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

async function handleSyncWithBackend(sendResponse: (response: any) => void) {
  try {
    // Ensure Supabase is initialized
    if (!supabase) {
      await initializeSupabase();
    }

    if (!supabase) {
      sendResponse({ success: false, error: 'Supabase not available' });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      sendResponse({ success: false, error: 'User not authenticated' });
      return;
    }

    // Get all saved posts from local storage
    const result = await chrome.storage.local.get(['savedPosts']);
    const savedPosts = result.savedPosts || [];
    
    let syncedCount = 0;
    let errors: string[] = [];

    for (const post of savedPosts) {
      try {
        await savePostToSupabase(post);
        syncedCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (!errorMessage.includes('already saved')) {
          errors.push(`Failed to sync post "${post.title || post.post_url}": ${errorMessage}`);
        }
      }
    }
    
    sendResponse({ 
      success: true, 
      message: `Sync completed. ${syncedCount} posts synced.`,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error syncing with backend:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('linkedin.com')) {
    // Content script will be injected automatically via manifest
    console.log('LinkedIn tab loaded:', tab.url);
  }
});
