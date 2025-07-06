
interface PostData {
  content: string;
  author_name?: string;
  author_profile_url?: string;
  author_avatar_url?: string;
  post_url: string;
  post_date?: string;
  linkedin_post_id?: string;
}

export class PostExtractor {
  extractPostData(postElement: Element): PostData | null {
    try {
      // Extract post content
      const contentSelectors = [
        '.feed-shared-update-v2__description',
        '.feed-shared-text',
        '.update-components-text',
        '.feed-shared-update-v2__commentary'
      ];
      
      let content = '';
      for (const selector of contentSelectors) {
        const contentEl = postElement.querySelector(selector);
        if (contentEl) {
          content = contentEl.textContent?.trim() || '';
          break;
        }
      }
      
      if (!content) {
        console.warn('PostExtractor: No content found');
        return null;
      }
      
      // Extract author information
      const authorNameEl = postElement.querySelector('.update-components-actor__name, .feed-shared-actor__name');
      const author_name = authorNameEl?.textContent?.trim() || 'Unknown Author';
      
      const authorLinkEl = postElement.querySelector('.update-components-actor__container a, .feed-shared-actor__container a');
      const author_profile_url = authorLinkEl?.getAttribute('href') || '';
      
      const authorAvatarEl = postElement.querySelector('.update-components-actor__avatar img, .feed-shared-actor__avatar img');
      const author_avatar_url = authorAvatarEl?.getAttribute('src') || '';
      
      // Extract post URL and ID
      const postUrn = postElement.getAttribute('data-urn') || 
                     postElement.getAttribute('data-id') || 
                     postElement.querySelector('[data-urn]')?.getAttribute('data-urn') || '';
      
      const linkedin_post_id = postUrn;
      const post_url = postUrn ? `https://www.linkedin.com/feed/update/${postUrn}` : window.location.href;
      
      // Extract post date
      const dateEl = postElement.querySelector('time, .update-components-actor__sub-description');
      const post_date = dateEl?.getAttribute('datetime') || new Date().toISOString();
      
      return {
        content,
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
}
