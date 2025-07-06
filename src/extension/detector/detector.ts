
import { POST_SELECTORS } from './selectors';
import { isPromotedPost, isJobPost } from './filters';
import { throttle } from '../utils/throttle';

export class PostDetector {
  private postSelectors: string[];
  private buttonManager: any;
  private processedPosts: Set<string>;
  private observerTimeout: number | null;
  private isInitialized: boolean;

  constructor() {
    this.postSelectors = POST_SELECTORS;
    this.processedPosts = new Set();
    this.observerTimeout = null;
    this.isInitialized = false;
    
    // Ensure ButtonManager is available
    if (!window.ButtonManager) {
      console.error('PostDetector: ButtonManager not available');
      return;
    }
    
    this.buttonManager = new window.ButtonManager();
    
    console.log('PostDetector initialized with enhanced selectors:', this.postSelectors.length, 'selectors');
  }

  initialize() {
    if (this.isInitialized) {
      console.log('PostDetector: Already initialized, skipping');
      return;
    }
    
    if (!this.buttonManager) {
      console.error('PostDetector: Cannot initialize without ButtonManager');
      return;
    }
    
    console.log('PostDetector: Starting initialization');
    this.isInitialized = true;
    
    // Add initial delay to ensure page is ready
    setTimeout(() => {
      this.addSaveButtonsToExistingPosts();
      this.observeNewPosts();
    }, 1000);
  }

  private addSaveButtonsToExistingPosts() {
    try {
      console.log('PostDetector: Looking for existing posts...');
      
      const allPosts = document.querySelectorAll(this.postSelectors.join(', '));
      console.log(`PostDetector: Total posts found: ${allPosts.length}`);
      
      let processedCount = 0;
      let skippedCount = 0;
      
      allPosts.forEach((post, index) => {
        const postId = this.getPostId(post) || `fallback-${index}-${Date.now()}`;
        
        // Skip if already has button
        if (post.querySelector('.linkedin-post-saver-btn')) {
          skippedCount++;
          return;
        }
        
        // Skip if already processed
        if (this.processedPosts.has(postId)) {
          skippedCount++;
          return;
        }
        
        // Check if this post should be skipped
        if (isPromotedPost(post) || isJobPost(post)) {
          this.processedPosts.add(postId);
          skippedCount++;
          return;
        }
        
        this.addSaveButtonToPost(post);
        this.processedPosts.add(postId);
        processedCount++;
      });
      
      console.log(`PostDetector: Processed ${processedCount} posts, skipped ${skippedCount} posts`);
    } catch (error) {
      console.error('PostDetector: Error adding save buttons:', error);
    }
  }

  private getPostId(postElement: Element): string {
    // Try multiple methods to get a unique ID
    const urn = postElement.getAttribute('data-urn') || 
                postElement.getAttribute('data-id') || 
                postElement.getAttribute('data-activity-urn') ||
                postElement.querySelector('[data-urn]')?.getAttribute('data-urn');
                
    if (urn) return urn;
    
    // Fallback: create ID from post content
    const content = postElement.textContent?.trim();
    if (content) {
      return `content-${content.substring(0, 50).replace(/\s+/g, '-')}-${content.length}`;
    }
    
    // Last resort: position-based ID
    return `position-${Array.from(document.querySelectorAll(this.postSelectors.join(', '))).indexOf(postElement)}`;
  }

  private addSaveButtonToPost(postElement: Element) {
    try {
      // Double-check if this post should be skipped
      if (isPromotedPost(postElement) || isJobPost(postElement)) {
        return;
      }
      
      const saveButton = this.buttonManager.createSaveButton();
      
      // Try multiple possible locations for the actions bar in order of preference
      const actionSelectors = [
        '.feed-shared-social-action-bar',
        '.social-actions-bar', 
        '.feed-shared-footer',
        '.feed-shared-social-counts-bar',
        '.social-counts-bar'
      ];
      
      let actionsBar: Element | null = null;
      for (const selector of actionSelectors) {
        actionsBar = postElement.querySelector(selector);
        if (actionsBar) {
          break;
        }
      }
      
      if (actionsBar) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'linkedin-post-saver-container';
        buttonContainer.style.cssText = 'display: inline-flex; align-items: center; margin-right: 8px;';
        buttonContainer.appendChild(saveButton);
        
        // Insert at the beginning of the actions bar for better alignment
        actionsBar.insertBefore(buttonContainer, actionsBar.firstChild);
      } else {
        // Fallback: add to a more reliable location within the post
        const fallbackSelectors = [
          '.feed-shared-update-v2__description',
          '.feed-shared-text',
          '.feed-shared-update-v2'
        ];
        
        let fallbackLocation: Element | null = null;
        for (const selector of fallbackSelectors) {
          fallbackLocation = postElement.querySelector(selector);
          if (fallbackLocation) break;
        }
        
        if (fallbackLocation && fallbackLocation.parentNode) {
          const buttonContainer = document.createElement('div');
          buttonContainer.className = 'linkedin-post-saver-container';
          buttonContainer.style.cssText = 'margin: 10px 0; text-align: right; border-top: 1px solid #e0e0e0; padding-top: 8px;';
          buttonContainer.appendChild(saveButton);
          fallbackLocation.parentNode.insertBefore(buttonContainer, fallbackLocation.nextSibling);
        }
      }
    } catch (error) {
      console.error('PostDetector: Error adding button to post:', error);
    }
  }

  private observeNewPosts() {
    console.log('PostDetector: Starting post observation');
    
    const throttledProcess = throttle(() => {
      this.addSaveButtonsToExistingPosts();
    }, 800);
    
    const observer = new MutationObserver((mutations) => {
      // Clear existing timeout to debounce rapid mutations
      if (this.observerTimeout) {
        clearTimeout(this.observerTimeout);
      }
      
      this.observerTimeout = window.setTimeout(() => {
        this.processNewPosts(mutations);
        throttledProcess();
      }, 800);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('PostDetector: Observer started');
  }

  private processNewPosts(mutations: MutationRecord[]) {
    const newPosts: Element[] = [];
    
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const element = node as Element;
          
          // Check if the node itself is a post
          if (element.matches && element.matches(this.postSelectors.join(', '))) {
            newPosts.push(element);
          }
          
          // Check for posts within the added node
          if (element.querySelectorAll) {
            const posts = element.querySelectorAll(this.postSelectors.join(', '));
            posts.forEach(post => newPosts.push(post));
          }
        }
      });
    });

    // Process unique posts only
    const uniquePosts = Array.from(new Set(newPosts));
    if (uniquePosts.length > 0) {
      console.log(`PostDetector: Processing ${uniquePosts.length} unique new posts`);
    }
    
    uniquePosts.forEach(post => {
      const postId = this.getPostId(post) || `new-${Date.now()}-${Math.random()}`;
      
      // Skip if already has button
      if (post.querySelector('.linkedin-post-saver-btn')) {
        return;
      }
      
      // Skip if already processed
      if (this.processedPosts.has(postId)) {
        return;
      }
      
      // Check if this post should be skipped
      if (isPromotedPost(post) || isJobPost(post)) {
        this.processedPosts.add(postId);
        return;
      }
      
      this.addSaveButtonToPost(post);
      this.processedPosts.add(postId);
    });
  }
}
