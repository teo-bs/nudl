
// Filter functions to determine which posts should be skipped
export function isPromotedPost(postElement: Element): boolean {
  // Check all text content in the post first
  const allText = postElement.textContent?.toLowerCase() || '';
  
  // Check for promoted/sponsored indicators
  if (allText.includes('promoted') || allText.includes('sponsored') || allText.includes('•promoted')) {
    console.log('PostDetector: Found promoted/sponsored text in post content, skipping save button');
    return true;
  }
  
  return false;
}

export function isJobPost(postElement: Element): boolean {
  // Check for job update indicators
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
    'posted a job'
  ];
  
  for (const keyword of jobKeywords) {
    if (allText.includes(keyword)) {
      console.log('PostDetector: Found job update keywords, skipping save button');
      return true;
    }
  }
  
  // Check for job posting elements
  const jobSelectors = [
    '[data-test-id*="job"]',
    '.job-posting',
    '.hiring-card',
    '[aria-label*="job"]',
    '[aria-label*="hiring"]'
  ];
  
  for (const selector of jobSelectors) {
    if (postElement.querySelector(selector)) {
      console.log('PostDetector: Found job posting elements, skipping save button');
      return true;
    }
  }
  
  return false;
}
