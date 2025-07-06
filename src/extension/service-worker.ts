/// <reference types="chrome"/>

// Service worker for Croi LinkedIn Extension
console.log('Croi Extension: Service worker starting...');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Croi Extension installed');
  
  // Set up default storage
  chrome.storage.local.set({
    savedPosts: [],
    extensionEnabled: true,
    settings: {
      autoTag: true,
      notificationsEnabled: true,
    }
  });
});

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
    // Get existing posts
    const result = await chrome.storage.local.get(['savedPosts']);
    const savedPosts = result.savedPosts || [];
    
    // Check if post already exists
    const existingPost = savedPosts.find((post: any) => 
      post.post_url === postData.post_url || 
      post.linkedin_post_id === postData.linkedin_post_id
    );
    
    if (existingPost) {
      sendResponse({ success: false, error: 'Post already saved' });
      return;
    }
    
    // Add new post
    const newPost = {
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
    
    // Save to storage
    await chrome.storage.local.set({ savedPosts });
    
    // Try to sync with backend (if user is authenticated)
    await syncPostWithBackend(newPost);
    
    sendResponse({ success: true, post: newPost });
    
  } catch (error) {
    console.error('Error saving post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

async function handleGetSavedPosts(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get(['savedPosts']);
    sendResponse({ success: true, posts: result.savedPosts || [] });
  } catch (error) {
    console.error('Error getting saved posts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    sendResponse({ success: false, error: errorMessage });
  }
}

async function syncPostWithBackend(postData: any) {
  try {
    // Try to find the web app tab
    const tabs = await chrome.tabs.query({});
    const webAppTab = tabs.find(tab => 
      tab.url && (
        tab.url.includes('nudl.lovable.app') || 
        tab.url.includes('lovable.app') || 
        tab.url.includes('localhost') ||
        tab.url.includes('127.0.0.1')
      )
    );
    
    if (webAppTab && webAppTab.id) {
      // Send message to the main web app to save the post
      try {
        const response = await chrome.tabs.sendMessage(webAppTab.id, {
          action: 'savePostToDatabase',
          postData
        });
        console.log('Sync response from web app:', response);
      } catch (err) {
        console.log('Could not sync with web app via content script, trying window message:', err);
        // Fallback: try direct message to the window
        await chrome.scripting.executeScript({
          target: { tabId: webAppTab.id },
          func: (data) => {
            window.postMessage({
              action: 'savePostToDatabase',
              postData: data
            }, '*');
          },
          args: [postData]
        });
      }
    } else {
      console.log('Web app tab not found for syncing');
    }
  } catch (error) {
    console.error('Error syncing with backend:', error);
  }
}

async function handleSyncWithBackend(sendResponse: (response: any) => void) {
  try {
    // Get all saved posts and sync them
    const result = await chrome.storage.local.get(['savedPosts']);
    const savedPosts = result.savedPosts || [];
    
    for (const post of savedPosts) {
      await syncPostWithBackend(post);
    }
    
    sendResponse({ success: true, message: 'Sync completed' });
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
