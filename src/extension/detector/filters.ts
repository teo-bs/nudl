export function isPromotedPost(postElement: Element): boolean {
  // Check for sponsored/promoted attributes
  if (postElement.querySelector('[data-sponsored]') || 
      postElement.querySelector('[data-ad-choice]') ||
      postElement.querySelector('[data-promoted]')) {
    console.log('PostDetector: Found promoted post via attributes, skipping save button');
    return true;
  }
  
  // Fallback to text content check for older LinkedIn versions
  const allText = postElement.textContent?.toLowerCase() || '';
  if (allText.includes('promoted') || allText.includes('sponsored') || allText.includes('•promoted')) {
    console.log('PostDetector: Found promoted/sponsored text in post content, skipping save button');
    return true;
  }
  
  return false;
}

export function isJobPost(postElement: Element): boolean {
  // Check for job-related attributes first
  if (postElement.querySelector('[data-job-card]') ||
      postElement.querySelector('[data-job-posting]') ||
      postElement.querySelector('.job-posting') ||
      postElement.querySelector('.hiring-card')) {
    console.log('PostDetector: Found job posting elements, skipping save button');
    return true;
  }
  
  // Fallback to text content check
  const allText = postElement.textContent?.toLowerCase() || '';
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
  
  return false;
}