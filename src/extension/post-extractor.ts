
export interface PostData {
  content: string;
  author_name: string;
  author_avatar_url: string;
  author_profile_url: string;
  post_url: string;
  linkedin_post_id: string;
  post_date: string;
  title: string;
  notes?: string;
}

export class PostExtractor {
  extractPostData(postElement: Element): PostData | null {
    try {
      console.log('PostExtractor: Extracting post data from element:', postElement);

      // Extract post content
      const contentSelectors = [
        '.feed-shared-update-v2__description .break-words',
        '.feed-shared-text',
        '.feed-shared-update-v2__commentary .break-words',
        '[data-test-id="main-feed-activity-card"] .break-words',
        '.update-components-text .break-words'
      ];

      let content = '';
      for (const selector of contentSelectors) {
        const contentElement = postElement.querySelector(selector);
        if (contentElement) {
          content = contentElement.textContent?.trim() || '';
          if (content) break;
        }
      }

      // Extract author information
      const authorSelectors = [
        '.feed-shared-actor__name',
        '.update-components-actor__name',
        '.feed-shared-update-v2__actor-name'
      ];

      let authorName = '';
      let authorProfileUrl = '';
      for (const selector of authorSelectors) {
        const authorElement = postElement.querySelector(selector);
        if (authorElement) {
          const linkElement = authorElement.querySelector('a') || authorElement.closest('a');
          if (linkElement) {
            authorName = linkElement.textContent?.trim() || '';
            authorProfileUrl = linkElement.getAttribute('href') || '';
            if (authorName) break;
          }
        }
      }

      // Extract author avatar
      const avatarSelectors = [
        '.feed-shared-actor__avatar img',
        '.update-components-actor__avatar img',
        '.EntityPhoto-circle-3 img'
      ];

      let authorAvatarUrl = '';
      for (const selector of avatarSelectors) {
        const avatarElement = postElement.querySelector(selector);
        if (avatarElement) {
          authorAvatarUrl = avatarElement.getAttribute('src') || '';
          if (authorAvatarUrl) break;
        }
      }

      // Extract LinkedIn post ID from various attributes
      const postId = this.extractPostId(postElement);
      
      // Generate post URL
      const postUrl = postId ? `https://www.linkedin.com/feed/update/${postId}/` : window.location.href;

      // Extract post date
      const dateSelectors = [
        '.feed-shared-actor__sub-description time',
        '.update-components-actor__sub-description time',
        '[data-test-id="main-feed-activity-card"] time'
      ];

      let postDate = new Date().toISOString();
      for (const selector of dateSelectors) {
        const dateElement = postElement.querySelector(selector);
        if (dateElement) {
          const datetime = dateElement.getAttribute('datetime');
          if (datetime) {
            postDate = new Date(datetime).toISOString();
            break;
          }
        }
      }

      // Generate title from content
      const title = content.length > 100 ? content.substring(0, 100) + '...' : content;

      const postData: PostData = {
        content: content || 'No content found',
        author_name: authorName || 'Unknown Author',
        author_avatar_url: authorAvatarUrl,
        author_profile_url: authorProfileUrl,
        post_url: postUrl,
        linkedin_post_id: postId || '',
        post_date: postDate,
        title: title || 'LinkedIn Post',
        notes: ''
      };

      console.log('PostExtractor: Extracted post data:', postData);
      return postData;

    } catch (error) {
      console.error('PostExtractor: Error extracting post data:', error);
      return null;
    }
  }

  private extractPostId(postElement: Element): string {
    // Try multiple methods to extract LinkedIn post ID
    const urnAttributes = [
      'data-urn',
      'data-id',
      'data-activity-urn'
    ];

    for (const attr of urnAttributes) {
      const urn = postElement.getAttribute(attr);
      if (urn && urn.includes('urn:li:activity:')) {
        const match = urn.match(/urn:li:activity:(\d+)/);
        if (match) {
          return match[1];
        }
      }
    }

    // Try to find URN in child elements
    const urnElement = postElement.querySelector('[data-urn*="urn:li:activity:"]');
    if (urnElement) {
      const urn = urnElement.getAttribute('data-urn');
      if (urn) {
        const match = urn.match(/urn:li:activity:(\d+)/);
        if (match) {
          return match[1];
        }
      }
    }

    return '';
  }
}
