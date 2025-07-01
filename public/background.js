// Background script for LinkedIn Post Saver
chrome.runtime.onInstalled.addListener(() => {
    console.log('LinkedIn Post Saver extension installed');
    
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

async function handleSavePost(postData, sendResponse) {
    try {
        // Get existing posts
        const result = await chrome.storage.local.get(['savedPosts']);
        const savedPosts = result.savedPosts || [];
        
        // Check if post already exists
        const existingPost = savedPosts.find(post => 
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
        // This is where you'd implement the actual API call
        // await syncPostWithBackend(newPost);
        
        sendResponse({ success: true, post: newPost });
        
    } catch (error) {
        console.error('Error saving post:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleGetSavedPosts(sendResponse) {
    try {
        const result = await chrome.storage.local.get(['savedPosts']);
        sendResponse({ success: true, posts: result.savedPosts || [] });
    } catch (error) {
        console.error('Error getting saved posts:', error);
        sendResponse({ success: false, error: error.message });
    }
}

async function handleSyncWithBackend(sendResponse) {
    try {
        // This is where you'd implement syncing with your backend
        // For now, we'll just return a success response
        sendResponse({ success: true, message: 'Sync completed' });
    } catch (error) {
        console.error('Error syncing with backend:', error);
        sendResponse({ success: false, error: error.message });
    }
}

// Periodic sync with backend (every 30 minutes)
chrome.alarms.create('syncPosts', { periodInMinutes: 30 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'syncPosts') {
        // Implement periodic sync logic here
        console.log('Periodic sync triggered');
    }
});

// Handle tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('linkedin.com')) {
        // Ensure content script is loaded
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content-script.js']
        }).catch(err => {
            // Content script might already be loaded, ignore errors
            console.log('Content script injection skipped:', err.message);
        });
    }
});
