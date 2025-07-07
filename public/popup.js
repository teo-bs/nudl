
// Popup script for the Chrome extension
console.log('Croi Extension Popup: Script loaded');

let isActive = true;
let postsCount = 0;
let buttonsCount = 0;

// DOM elements
const loading = document.getElementById('loading');
const mainContent = document.getElementById('main-content');
const statusElement = document.getElementById('status');
const statusText = document.getElementById('status-text');
const errorElement = document.getElementById('error');
const toggleBtn = document.getElementById('toggle-btn');
const syncBtn = document.getElementById('sync-btn');
const openDashboardBtn = document.getElementById('open-dashboard');
const postsCountElement = document.getElementById('posts-count');
const buttonsCountElement = document.getElementById('buttons-count');

// Initialize popup
async function initializePopup() {
  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url?.includes('linkedin.com')) {
      showError('Please navigate to LinkedIn to use this extension');
      return;
    }
    
    // Get extension status
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getStatus' });
    
    if (response?.success) {
      updateStatus(response.active);
      updateStats(response.postsCount || 0, response.buttonsCount || 0);
    }
    
    // Get saved posts count
    const savedPosts = await getSavedPosts();
    updateStats(savedPosts.length, buttonsCount);
    
    showMainContent();
    
  } catch (error) {
    console.error('Error initializing popup:', error);
    showError('Failed to connect to extension. Please refresh the page.');
  }
}

// Show main content
function showMainContent() {
  loading.style.display = 'none';
  mainContent.style.display = 'block';
}

// Show error
function showError(message) {
  loading.style.display = 'none';
  mainContent.style.display = 'block';
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}

// Update status
function updateStatus(active) {
  isActive = active;
  
  if (active) {
    statusElement.classList.remove('inactive');
    statusText.textContent = 'Extension Active';
    toggleBtn.textContent = 'Disable Extension';
  } else {
    statusElement.classList.add('inactive');
    statusText.textContent = 'Extension Inactive';
    toggleBtn.textContent = 'Enable Extension';
  }
}

// Update stats
function updateStats(posts, buttons) {
  postsCount = posts;
  buttonsCount = buttons;
  postsCountElement.textContent = posts.toString();
  buttonsCountElement.textContent = buttons.toString();
}

// Get saved posts
async function getSavedPosts() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSavedPosts' });
    return response?.posts || [];
  } catch (error) {
    console.error('Error getting saved posts:', error);
    return [];
  }
}

// Toggle extension
async function toggleExtension() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'toggleExtension' });
    
    if (response?.success) {
      updateStatus(response.active);
    }
  } catch (error) {
    console.error('Error toggling extension:', error);
    showError('Failed to toggle extension');
  }
}

// Sync with dashboard
async function syncWithDashboard() {
  try {
    syncBtn.textContent = 'Syncing...';
    syncBtn.disabled = true;
    
    const response = await chrome.runtime.sendMessage({ action: 'syncWithBackend' });
    
    if (response?.success) {
      showTemporaryMessage('Sync completed successfully!');
    } else {
      showError(response?.error || 'Sync failed');
    }
  } catch (error) {
    console.error('Error syncing:', error);
    showError('Sync failed');
  } finally {
    syncBtn.textContent = 'Sync with Dashboard';
    syncBtn.disabled = false;
  }
}

// Open dashboard
function openDashboard() {
  chrome.tabs.create({ 
    url: 'https://nudl.lovable.app/' 
  });
}

// Show temporary message
function showTemporaryMessage(message) {
  const originalText = statusText.textContent;
  statusText.textContent = message;
  setTimeout(() => {
    statusText.textContent = originalText;
  }, 3000);
}

// Event listeners
toggleBtn.addEventListener('click', toggleExtension);
syncBtn.addEventListener('click', syncWithDashboard);
openDashboardBtn.addEventListener('click', openDashboard);

// Initialize when popup opens
document.addEventListener('DOMContentLoaded', initializePopup);
