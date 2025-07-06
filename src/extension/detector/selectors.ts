
// Enhanced LinkedIn post selectors for the extension
export const POST_SELECTORS = [
  // Primary selectors for LinkedIn posts
  'div[data-id*="urn:li:activity:"]',
  'div[data-urn*="urn:li:activity:"]',
  '.feed-shared-update-v2',
  'article[data-urn]',
  
  // Additional content selectors
  '.feed-shared-update-v2__content',
  '[data-test-id="main-feed-activity-card"]',
  '.feed-shared-update-v2[data-urn]',
  '.feed-shared-update-v2__description-wrapper',
  '[data-urn*="urn:li:activity"]',
  '.update-components-update-v2',
  '.feed-shared-post',
  
  // New enhanced selectors for better detection
  '[data-id*="activity"]',
  '.scaffold-finite-scroll__item',
  '.feed-shared-update-v2__wrapper',
  'div[data-finite-scroll-hotkey-item]',
  '.relative.feed-shared-update-v2',
  
  // Fallback selectors
  'article[role="article"]',
  'div[role="article"]'
];

// Selectors for elements to exclude (promoted posts, jobs, etc.)
export const EXCLUDE_SELECTORS = [
  '[data-test-id*="promoted"]',
  '[data-test-id*="job"]',
  '.job-card',
  '.hiring-card',
  '[aria-label*="Promoted"]',
  '[aria-label*="Sponsored"]'  
];

// Action bar selectors (where to place the save button)
export const ACTION_BAR_SELECTORS = [
  '.feed-shared-social-action-bar',
  '.social-actions-bar', 
  '.feed-shared-footer',
  '.feed-shared-social-counts-bar',
  '.social-counts-bar',
  '.feed-shared-control-menu'
];
