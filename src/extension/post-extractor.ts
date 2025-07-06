
interface PostData {
  content: string;
  author_name?: string;
  author_profile_url?: string;
  author_avatar_url?: string;
  post_url: string;
  post_date?: string;
  linkedin_post_id?: string;
  title?: string;
}

export class PostExtractor {
  extractPostData(postElement: Element): PostData | null {
    try {
      // Extract post content with enhanced selectors
      const contentSelectors = [
        '.feed-shared-update-v2__description .feed-shared-text__text-view',
        '.feed-shared-update-v2__description',
        '.feed-shared-text',
        '.update-components-text',
        '.feed-shared-update-v2__commentary',
        '.feed-shared-text span[dir="ltr"]',
        '.attributed-text-segment-list__content'
      ];
      
      let content = '';
      for (const selector of contentSelectors) {
        const contentEl = postElement.querySelector(selector);
        if (contentEl) {
          // Get text content, handling "see more" expansions
          const fullTextEl = contentEl.querySelector('.feed-shared-inline-show-more-text__text-view') || contentEl;
          content = fullTextEl.textContent?.trim() || '';
          if (content) break;
        }
      }
      
      if (!content || content.length < 5) {
        console.warn('PostExtractor: No meaningful content found');
        return null;
      }
      
      // Generate title from content (first 60 characters)
      const title = content.length > 60 ? 
        content.substring(0, 57).trim() + '...' : 
        content;
      
      // Extract author information with enhanced selectors
      const authorSelectors = [
        '.update-components-actor__name .visually-hidden',
        '.update-components-actor__name',
        '.feed-shared-actor__name .visually-hidden',
        '.feed-shared-actor__name',
        '.update-components-actor__title'
      ];
      
      let author_name = 'Unknown Author';
      for (const selector of authorSelectors) {
        const authorEl = postElement.querySelector(selector);
        if (authorEl && authorEl.textContent?.trim()) {
          author_name = authorEl.textContent.trim();
          break;
        }
      }
      
      // Extract author profile URL
      const authorLinkSelectors = [
        '.update-components-actor__container a',
        '.feed-shared-actor__container a',
        '.update-components-actor__title a'
      ];
      
      let author_profile_url = '';
      for (const selector of authorLinkSelectors) {
        const linkEl = postElement.querySelector(selector);
        if (linkEl) {
          author_profile_url = linkEl.getAttribute('href') || '';
          if (author_profile_url && !author_profile_url.startsWith('http')) {
            author_profile_url = 'https://www.linkedin.com' + author_profile_url;
          }
          break;
        }
      }
      
      // Extract author avatar
      const avatarSelectors = [
        '.update-components-actor__avatar img',
        '.feed-shared-actor__avatar img',
        '.EntityPhoto-circle-1 img'
      ];
      
      let author_avatar_url = '';
      for (const selector of avatarSelectors) {
        const avatarEl = postElement.querySelector(selector);
        if (avatarEl) {
          author_avatar_url = avatarEl.getAttribute('src') || '';
          break;
        }
      }
      
      // Extract post URL and ID with enhanced logic
      const postUrn = this.extractPostUrn(postElement);
      const linkedin_post_id = postUrn;
      const post_url = postUrn ? 
        `https://www.linkedin.com/feed/update/${postUrn}` : 
        window.location.href;
      
      // Extract post date with enhanced selectors
      const dateSelectors = [
        'time[datetime]',
        '.update-components-actor__sub-description time',
        '.feed-shared-actor__sub-description time',
        '.update-components-actor__sub-description'
      ];
      
      let post_date = new Date().toISOString();
      for (const selector of dateSelectors) {
        const dateEl = postElement.querySelector(selector);
        if (dateEl) {
          const datetime = dateEl.getAttribute('datetime');
          if (datetime) {
            post_date = datetime;
            break;
          }
          // Fallback: try to parse text content
          const dateText = dateEl.textContent?.trim();
          if (dateText && this.isValidDateText(dateText)) {
            post_date = this.parseDateText(dateText);
            break;
          }
        }
      }
      
      return {
        content,
        title,
        author_name,
        author_profile_url,
        author_avatar_url,
        post_url,
        post_date,
        linkedin_post_id
      };
    } catch (error) {
      console.error('PostExtractor: Error extracting post data:', error);
      return null;
    }
  }
  
  private extractPostUrn(postElement: Element): string {
    // Try multiple methods to get post URN
    const urnSources = [
      () => postElement.getAttribute('data-urn'),
      () => postElement.getAttribute('data-id'),
      () => postElement.getAttribute('data-activity-urn'),
      () => postElement.querySelector('[data-urn]')?.getAttribute('data-urn'),
      () => postElement.querySelector('[data-id*="urn:li:activity:"]')?.getAttribute('data-id'),
      () => this.extractUrnFromUrl(postElement)
    ];
    
    for (const getUrn of urnSources) {
      try {
        const urn = getUrn();
        if (urn && urn.includes('urn:li:activity:')) {
          return urn;
        }
      } catch (e) {
        // Continue to next method
      }
    }
    
    return '';
  }
  
  private extractUrnFromUrl(postElement: Element): string {
    // Look for URLs in the post that might contain the URN
    const links = postElement.querySelectorAll('a[href*="feed/update/"]');
    for (const link of links) {
      const href = link.getAttribute('href') || '';
      const match = href.match(/feed\/update\/(urn:li:activity:\d+)/);
      if (match) {
        return match[1];
      }
    }
    return '';
  }
  
  private isValidDateText(text: string): boolean {
    // Check if text looks like a date (e.g., "2h", "1d", "3w", "now")
    return /^\d+[smhdw]$|^now$|^\d+\s+(second|minute|hour|day|week|month)s?\s+ago$/.test(text.toLowerCase());
  }
  
  private parseDateText(text: string): string {
    // Convert relative time text to ISO date
    const now = new Date();
    const lowerText = text.toLowerCase();
    
    if (lowerText === 'now') {
      return now.toISOString();
    }
    
    const match = lowerText.match(/^(\d+)([smhdw])/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 's': now.setSeconds(now.getSeconds() - value); break;
        case 'm': now.setMinutes(now.getMinutes() - value); break;
        case 'h': now.setHours(now.getHours() - value); break;
        case 'd': now.setDate(now.getDate() - value); break;
        case 'w': now.setDate(now.getDate() - (value * 7)); break;
      }
      
      return now.toISOString();
    }
    
    return new Date().toISOString();
  }
}
