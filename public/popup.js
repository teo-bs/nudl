
// Popup script for LinkedIn Post Saver
let userDetails = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initializePopup();
});

async function initializePopup() {
    // Load user details first
    await loadUserDetails();
    
    // Load saved posts and update UI
    await loadRecentPosts();
    await updateStats();
    
    // Set up event listeners
    setupEventListeners();
    
    // Check extension status
    await checkExtensionStatus();
}

function setupEventListeners() {
    // Toggle extension
    document.getElementById('extensionToggle').addEventListener('click', toggleExtension);
    
    // Open dashboard
    document.getElementById('openDashboard').addEventListener('click', openDashboard);
    
    // Refresh posts
    document.getElementById('refreshPosts').addEventListener('click', refreshPosts);
}

async function loadRecentPosts() {
    try {
        // Get posts from storage
        const result = await chrome.storage.local.get(['savedPosts']);
        const posts = result.savedPosts || [];
        
        const recentPostsList = document.getElementById('recentPostsList');
        
        if (posts.length === 0) {
            recentPostsList.innerHTML = `
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>No posts saved yet</p>
                    <small>Visit LinkedIn and click the save button on any post</small>
                </div>
            `;
            return;
        }
        
        // Show most recent 5 posts
        const recentPosts = posts.slice(0, 5);
        recentPostsList.innerHTML = recentPosts.map(post => `
            <div class="post-item">
                <div class="post-author">${post.author_name || 'Unknown Author'}</div>
                <div class="post-content">${post.content}</div>
                <div class="post-date">${formatDate(post.saved_at)}</div>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Error loading recent posts:', error);
        document.getElementById('recentPostsList').innerHTML = `
            <div class="empty-state">
                <p>Error loading posts</p>
            </div>
        `;
    }
}

async function updateStats() {
    try {
        const result = await chrome.storage.local.get(['savedPosts']);
        const posts = result.savedPosts || [];
        
        // Total posts
        document.getElementById('totalPosts').textContent = posts.length;
        
        // Posts saved today
        const today = new Date().toDateString();
        const todayPosts = posts.filter(post => 
            new Date(post.saved_at).toDateString() === today
        );
        document.getElementById('todayPosts').textContent = todayPosts.length;
        
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

async function toggleExtension() {
    const toggle = document.getElementById('extensionToggle');
    const isActive = toggle.classList.contains('active');
    
    try {
        // Get current tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab.url.includes('linkedin.com')) {
            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggleExtension' });
            
            if (response && response.active !== undefined) {
                if (response.active) {
                    toggle.classList.add('active');
                } else {
                    toggle.classList.remove('active');
                }
            }
        } else {
            // Just toggle the UI if not on LinkedIn
            toggle.classList.toggle('active');
        }
        
    } catch (error) {
        console.error('Error toggling extension:', error);
        // Fallback: just toggle the UI
        toggle.classList.toggle('active');
    }
}

async function checkExtensionStatus() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const toggle = document.getElementById('extensionToggle');
        
        if (!tab.url.includes('linkedin.com')) {
            // Disable toggle if not on LinkedIn
            toggle.style.opacity = '0.5';
            toggle.style.pointerEvents = 'none';
        } else {
            toggle.style.opacity = '1';
            toggle.style.pointerEvents = 'auto';
        }
    } catch (error) {
        console.error('Error checking extension status:', error);
    }
}

function openDashboard() {
    // Open the actual dashboard URL
    const dashboardUrl = 'https://nudl.lovable.app/dashboard';
    chrome.tabs.create({ url: dashboardUrl });
}

async function refreshPosts() {
    const button = document.getElementById('refreshPosts');
    const originalText = button.textContent;
    
    button.textContent = 'Refreshing...';
    button.disabled = true;
    
    try {
        await loadRecentPosts();
        await updateStats();
    } catch (error) {
        console.error('Error refreshing posts:', error);
    } finally {
        button.textContent = originalText;
        button.disabled = false;
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
        return 'Just now';
    } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
            return 'Yesterday';
        } else if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        } else {
            return date.toLocaleDateString();
        }
    }
}

async function loadUserDetails() {
    try {
        // Try to get user details from the web app
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        // First try to get from nudl.lovable.app tabs
        const tabs = await chrome.tabs.query({});
        const webAppTab = tabs.find(tab => 
            tab.url && tab.url.includes('nudl.lovable.app')
        );
        
        if (webAppTab) {
            try {
                const response = await chrome.tabs.sendMessage(webAppTab.id, { 
                    action: 'getUserDetails' 
                });
                
                if (response && response.user) {
                    userDetails = response.user;
                    updateUserUI();
                }
            } catch (error) {
                console.log('Could not get user details from web app:', error);
            }
        }
        
        // If no user details, show logged out state
        if (!userDetails) {
            updateUserUI();
        }
    } catch (error) {
        console.error('Error loading user details:', error);
        updateUserUI();
    }
}

function updateUserUI() {
    const userSection = document.getElementById('userSection');
    if (!userSection) return;
    
    if (userDetails) {
        userSection.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${userDetails.email?.charAt(0).toUpperCase() || 'U'}</div>
                <div class="user-details">
                    <div class="user-name">${userDetails.user_metadata?.full_name || 'User'}</div>
                    <div class="user-email">${userDetails.email}</div>
                </div>
                <div class="user-status online">●</div>
            </div>
        `;
    } else {
        userSection.innerHTML = `
            <div class="user-info logged-out">
                <div class="user-avatar">?</div>
                <div class="user-details">
                    <div class="user-name">Not logged in</div>
                    <div class="user-email">Please log in to the dashboard</div>
                </div>
                <div class="user-status offline">●</div>
            </div>
        `;
    }
}

// Listen for storage changes to update UI in real-time
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.savedPosts) {
        loadRecentPosts();
        updateStats();
    }
});
