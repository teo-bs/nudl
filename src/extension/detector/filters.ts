
// Enhanced filtering logic for posts
export function isPromotedPost(postElement: Element): boolean {
  const allText = postElement.textContent?.toLowerCase() || '';
  
  // Check for promoted/sponsored indicators in text
  const promotedKeywords = [
    'promoted',
    'sponsored', 
    '•promoted',
    '• promoted',
    'ad ',
    ' ad•',
    'gesponsord', // German
    'promovido', // Spanish/Portuguese
    'sponsorisé' // French
  ];
  
  for (const keyword of promotedKeywords) {
    if (allText.includes(keyword)) {
      return true;
    }
  }
  
  // Check for promoted indicators in attributes
  const promotedSelectors = [
    '[data-test-id*="promoted"]',
    '[aria-label*="Promoted"]',
    '[aria-label*="Sponsored"]',
    '.feed-shared-actor__sub-description:contains("Promoted")'
  ];
  
  for (const selector of promotedSelectors) {
    if (postElement.querySelector(selector)) {
      return true;
    }
  }
  
  return false;
}

export function isJobPost(postElement: Element): boolean {
  const allText = postElement.textContent?.toLowerCase() || '';
  
  // Check for job-related keywords
  const jobKeywords = [
    'is hiring',
    'we\'re hiring',
    'join our team',
    'job opportunity',
    'open position',
    'career opportunity',
    'apply now',
    'new job',
    'job opening',
    'hiring for',
    'looking for a',
    'posted a job',
    'join us',
    'we are looking for',
    'remote job',
    'full-time',
    'part-time',
    'contract position'
  ];
  
  for (const keyword of jobKeywords) {
    if (allText.includes(keyword)) {
      return true;
    }
  }
  
  // Check for job posting elements
  const jobSelectors = [
    '[data-test-id*="job"]',
    '.job-posting',
    '.hiring-card',
    '[aria-label*="job"]',
    '[aria-label*="hiring"]',
    '.job-card'
  ];
  
  for (const selector of jobSelectors) {
    if (postElement.querySelector(selector)) {
      return true;
    }
  }
  
  return false;
}

export function hasValidContent(postElement: Element): boolean {
  // Check if post has meaningful content
  const contentSelectors = [
    '.feed-shared-update-v2__description',
    '.feed-shared-text',
    '.update-components-text',
    '.feed-shared-update-v2__commentary'
  ];
  
  for (const selector of contentSelectors) {
    const contentEl = postElement.querySelector(selector);
    if (contentEl && contentEl.textContent?.trim().length > 10) {
      return true;
    }
  }
  
  return false;
}
