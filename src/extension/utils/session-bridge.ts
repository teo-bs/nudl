
/// <reference types="chrome"/>

// Session bridge for sharing Supabase session between extension and web app
export class SessionBridge {
  private static readonly STORAGE_KEY = 'supabase-session';
  
  static async saveSession(session: any): Promise<void> {
    try {
      await chrome.storage.local.set({
        [this.STORAGE_KEY]: JSON.stringify(session)
      });
      console.log('Session saved to extension storage');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }
  
  static async getSession(): Promise<any | null> {
    try {
      const result = await chrome.storage.local.get([this.STORAGE_KEY]);
      const sessionData = result[this.STORAGE_KEY];
      
      if (sessionData) {
        return JSON.parse(sessionData);
      }
      
      return null;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }
  
  static async clearSession(): Promise<void> {
    try {
      await chrome.storage.local.remove([this.STORAGE_KEY]);
      console.log('Session cleared from extension storage');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }
  
  static async syncWithWebApp(): Promise<void> {
    try {
      // Try to get session from web app tabs
      const tabs = await chrome.tabs.query({});
      const webAppTab = tabs.find(tab => 
        tab.url && (
          tab.url.includes('nudl.lovable.app') || 
          tab.url.includes('lovable.app') ||
          tab.url.includes('localhost') ||
          tab.url.includes('127.0.0.1')
        )
      );
      
      if (webAppTab && webAppTab.id) {
        try {
          const response = await chrome.tabs.sendMessage(webAppTab.id, {
            action: 'getSession'
          });
          
          if (response && response.session) {
            await this.saveSession(response.session);
            console.log('Session synced from web app');
          }
        } catch (error) {
          console.log('Could not sync session from web app:', error);
        }
      }
    } catch (error) {
      console.error('Error syncing with web app:', error);
    }
  }
}
