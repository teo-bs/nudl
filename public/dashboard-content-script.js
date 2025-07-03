// Dashboard Content Script - Handles communication between extension and web app
console.log('Dashboard content script loaded');

// Listen for messages from the extension background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Dashboard content script received message:', message);
  
  if (message.action === 'savePostToDatabase') {
    // Forward the message to the web app via window messaging
    window.postMessage({
      action: 'savePostToDatabase',
      postData: message.postData
    }, '*');
    
    // Send immediate response
    sendResponse({ success: true, message: 'Message forwarded to web app' });
    return true; // Keep the channel open for async response
  }
  
  if (message.action === 'getUserDetails') {
    // Forward the message to the web app
    window.postMessage({
      action: 'getUserDetails'
    }, '*');
    
    // Listen for response from web app
    const responseHandler = (event) => {
      if (event.data.action === 'getUserDetailsResponse') {
        window.removeEventListener('message', responseHandler);
        sendResponse({ success: true, user: event.data.user });
      }
    };
    
    window.addEventListener('message', responseHandler);
    
    // Timeout after 5 seconds
    setTimeout(() => {
      window.removeEventListener('message', responseHandler);
      sendResponse({ success: false, user: null });
    }, 5000);
    
    return true; // Keep the channel open for async response
  }
});

// Listen for responses from the web app and forward them back to extension
window.addEventListener('message', (event) => {
  if (event.data.action === 'savePostResponse') {
    console.log('Dashboard content script: Received save response from web app:', event.data);
  }
});