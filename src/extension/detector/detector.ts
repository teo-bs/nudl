

import { POST_SELECTORS } from './selectors';
import { isPromotedPost, isJobPost } from './filters';
import { ButtonManager } from '../button-manager';
import { throttle } from '../utils/throttle';

export class PostDetector {
  private postSelectors: string[];
  private buttonManager: ButtonManager;
  private processedPosts: Set<string>;
  private observerTimeout: number | null;
  private throttledAddButtons: () => void;

  constructor() {
    this.postSelectors = POST_SELECTORS;
    this.buttonManager = new ButtonManager();
    this.processedPosts = new Set();
    this.observerTimeout = null;
    
    // Throttle the addSaveButtonsToExistingPosts method
    this.throttledAddButtons = throttle(() => {
      this.addSaveButtonsToExistingPosts();
    }, 800);
    
    console.log('PostDetector initialized with enhanced selectors:', this.postSelectors);
  }

  initialize(): void {
    console.log('PostDetector: Starting initialization');
    this.throttledAddButtons();
    this.observeNewPosts();
  }

  private addSaveButtonsToExistingPosts(): void {
    try {
      console.log('PostDetector: Looking for existing posts...');
      
      const allPosts = document.querySelectorAll(this.postSelectors.join(', '));
      console.log(`PostDetector: Total posts found: ${allPosts.length}`);
      
      allPosts.forEach((post, index) => {
        const postId = this.getPostId(post) || `fallback-${index}-${Date.now()}`;
        
        // Skip if already has button
        if (post.querySelector('.croi-btn')) {
          console.log(`PostDetector: Post ${index + 1} already has button`);
          return;
        }
        
        // Skip if already processed
        if (this.processedPosts.has(postId)) {
          console.log(`PostDetector: Post ${index + 1} already processed`);
          return;
        }
        
        // Check if this post should be skipped
        if (isPromotedPost(post) || isJobPost(post)) {
          console.log(`PostDetector: Skipping post ${index + 1} - promoted or job update`);
          this.processedPosts.add(postId);
          return;
        }
        
        console.log(`PostDetector: Processing new post ${index + 1}`, post);
        this.addSaveButtonToPost(post);
        this.processedPosts.add(postId);
      });
    } catch (error) {
      console.error('PostDetector: Error adding save buttons:', error);
    }
  }

  private getPostId(postElement: Element): string | null {
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

  private addSaveButtonToPost(postElement: Element): void {
    try {
      console.log('PostDetector: Adding save button to post', postElement);
      
      // Double-check if this post should be skipped (redundant safety check)
      if (isPromotedPost(postElement) || isJobPost(postElement)) {
        console.log('PostDetector: Skipping post - promoted or job update');
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
          console.log(`PostDetector: Found actions bar with selector: ${selector}`);
          break;
        }
      }
      
      if (actionsBar) {
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'croi-btn-container';
        buttonContainer.appendChild(saveButton);
        
        // Insert at the beginning of the actions bar for better alignment
        actionsBar.insertBefore(buttonContainer, actionsBar.firstChild);
        console.log('PostDetector: Save button added successfully to actions bar');
      } else {
        // Fallback: add to a more reliable location within the post
        console.log('PostDetector: No actions bar found, trying fallback locations');
        
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
        
        if (fallbackLocation) {
          const buttonContainer = document.createElement('div');
          buttonContainer.className = 'croi-btn-container croi-btn-fallback';
          buttonContainer.appendChild(saveButton);
          fallbackLocation.parentNode?.insertBefore(buttonContainer, fallbackLocation.nextSibling);
          console.log('PostDetector: Save button added to fallback location');
        } else {
          console.log('PostDetector: No suitable location found for save button');
        }
      }
    } catch (error) {
      console.error('PostDetector: Error adding button to post:', error);
    }
  }

  private observeNewPosts(): void {
    console.log('PostDetector: Starting post observation');
    
    const observer = new MutationObserver((mutations) => {
      // Clear existing timeout to debounce rapid mutations
      if (this.observerTimeout) {
        clearTimeout(this.observerTimeout);
      }
      
      this.observerTimeout = window.setTimeout(() => {
        this.processNewPosts(mutations);
        // Also re-check existing posts periodically with throttling
        this.throttledAddButtons();
      }, 500);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    console.log('PostDetector: Observer started');
  }

  private processNewPosts(mutations: MutationRecord[]): void {
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
    console.log(`PostDetector: Processing ${uniquePosts.length} unique new posts`);
    
    uniquePosts.forEach(post => {
      const postId = this.getPostId(post) || `new-${Date.now()}-${Math.random()}`;
      
      // Skip if already has button
      if (post.querySelector('.croi-btn')) {
        return;
      }
      
      // Skip if already processed
      if (this.processedPosts.has(postId)) {
        return;
      }
      
      // Check if this post should be skipped
      if (isPromotedPost(post) || isJobPost(post)) {
        console.log('PostDetector: Skipping new post - promoted or job update');
        this.processedPosts.add(postId);
        return;
      }
      
      console.log('PostDetector: Adding button to new post', post);
      this.addSaveButtonToPost(post);
      this.processedPosts.add(postId);
    });
  }
}

