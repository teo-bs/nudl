// Background script for LinkedIn Post Saver
console.log('LinkedIn Post Saver: Service worker starting...');

// Initialize on installation
chrome.runtime.onInstalled.addListener(async () => {
  console.log('LinkedIn Post Saver extension installed');
  
  // Set up Supabase configuration
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
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('LinkedIn Post Saver: Received message:', request.action);
  
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
      console.log('LinkedIn Post Saver: Unknown action:', request.action);
      sendResponse({ error: 'Unknown action' });
  }
});

async function handleSavePost(postData, sendResponse) {
  try {
    console.log('LinkedIn Post Saver: Saving post:', postData);
    
    // Get existing posts
    const result = await chrome.storage.local.get(['savedPosts']);
    const savedPosts = result.savedPosts || [];
    
    // Check if post already exists
    const existingPost = savedPosts.find(post => 
      post.post_url === postData.post_url || 
      post.linkedin_post_id === postData.linkedin_post_id
    );
    
    if (existingPost) {
      console.log('LinkedIn Post Saver: Post already exists');
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
    
    console.log('LinkedIn Post Saver: Post saved successfully');
    
    // Try to sync with backend (if user is authenticated)
    try {
      await syncPostWithBackend(newPost);
    } catch (syncError) {
      console.log('LinkedIn Post Saver: Backend sync failed (user may not be authenticated):', syncError.message);
    }
    
    sendResponse({ success: true, post: newPost });
    
  } catch (error) {
    console.error('LinkedIn Post Saver: Error saving post:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleGetSavedPosts(sendResponse) {
  try {
    const result = await chrome.storage.local.get(['savedPosts']);
    const posts = result.savedPosts || [];
    console.log('LinkedIn Post Saver: Retrieved', posts.length, 'saved posts');
    sendResponse({ success: true, posts });
  } catch (error) {
    console.error('LinkedIn Post Saver: Error getting saved posts:', error);
    sendResponse({ success: false, error: error.message, posts: [] });
  }
}

async function syncPostWithBackend(postData) {
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
    
    if (webAppTab) {
      console.log('LinkedIn Post Saver: Found web app tab, syncing post');
      // Send message to the main web app to save the post
      try {
        const response = await chrome.tabs.sendMessage(webAppTab.id, {
          action: 'savePostToDatabase',
          postData
        });
        console.log('LinkedIn Post Saver: Sync response from web app:', response);
      } catch (err) {
        console.log('LinkedIn Post Saver: Could not sync with web app via content script:', err.message);
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
      console.log('LinkedIn Post Saver: Web app tab not found for syncing');
    }
  } catch (error) {
    console.error('LinkedIn Post Saver: Error syncing with backend:', error);
    throw error;
  }
}

async function handleSyncWithBackend(sendResponse) {
  try {
    console.log('LinkedIn Post Saver: Starting backend sync');
    
    // Get all saved posts and sync them
    const result = await chrome.storage.local.get(['savedPosts']);
    const savedPosts = result.savedPosts || [];
    
    let syncedCount = 0;
    const errors = [];
    
    for (const post of savedPosts) {
      try {
        await syncPostWithBackend(post);
        syncedCount++;
      } catch (error) {
        errors.push(`Failed to sync post: ${error.message}`);
      }
    }
    
    console.log(`LinkedIn Post Saver: Sync completed. ${syncedCount} posts synced, ${errors.length} errors`);
    
    sendResponse({ 
      success: true, 
      message: `Sync completed. ${syncedCount} posts synced.`,
      syncedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('LinkedIn Post Saver: Error syncing with backend:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Periodic sync with backend (every 30 minutes)
if (chrome.alarms) {
  chrome.alarms.create('syncPosts', { periodInMinutes: 30 });

  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'syncPosts') {
      console.log('LinkedIn Post Saver: Periodic sync triggered');
      handleSyncWithBackend((response) => {
        console.log('LinkedIn Post Saver: Periodic sync result:', response);
      });
    }
  });
}

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('linkedin.com')) {
    console.log('LinkedIn Post Saver: LinkedIn tab loaded:', tab.url);
    // Content script will be injected automatically via manifest
  }
});
