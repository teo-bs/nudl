
export function isPromotedPost(postElement: Element): boolean {
  const allText = postElement.textContent?.toLowerCase() || '';
  
  // Check for promoted/sponsored indicators
  const promotedKeywords = [
    'promoted',
    'sponsored',
    '•promoted',
    'advertisement',
    'ad',
    'sponsored content'
  ];
  
  return promotedKeywords.some(keyword => allText.includes(keyword));
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
    'posted a job'
  ];
  
  return jobKeywords.some(keyword => allText.includes(keyword));
}
