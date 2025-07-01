
// Post Extractor Class
export class PostExtractor {
  extractPostData(postElement) {
    try {
      const authorElement = postElement.querySelector([
        '.feed-shared-actor__name',
        '.update-components-actor__name',
        '.feed-shared-actor__title',
        '.feed-shared-actor .visually-hidden'
      ].join(', '));
      const authorName = authorElement?.textContent?.trim() || 'Unknown Author';
      
      const authorImageElement = postElement.querySelector([
        '.feed-shared-actor__avatar img',
        '.presence-entity__image',
        '.feed-shared-actor img'
      ].join(', '));
      const authorAvatar = authorImageElement?.src || '';
      
      const contentElement = postElement.querySelector([
        '.feed-shared-text',
        '.update-components-text',
        '.feed-shared-update-v2__description',
        '[data-test-id="main-feed-activity-card"] .break-words'
      ].join(', '));
      const content = contentElement?.textContent?.trim() || '';
      
      const postUrl = window.location.href.split('?')[0] + '?utm_source=linkedin_post_saver';
      
      const postId = postElement.getAttribute('data-urn') || 
                   postElement.getAttribute('data-id') || 
                   Date.now().toString();
      
      const timeElement = postElement.querySelector([
        'time',
        '.feed-shared-actor__sub-description time',
        '.feed-shared-actor__sub-description'
      ].join(', '));
      const timestamp = timeElement?.getAttribute('datetime') || 
                       timeElement?.textContent?.trim() || 
                       new Date().toISOString();

      const result = {
        content,
        author_name: authorName,
        author_avatar_url: authorAvatar,
        post_url: postUrl,
        linkedin_post_id: postId,
        post_date: timestamp,
        title: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
      };

      console.log('LinkedIn Post Saver: Extracted post data:', result);
      return result;
    } catch (error) {
      console.error('Error extracting post data:', error);
      return null;
    }
  }
}
