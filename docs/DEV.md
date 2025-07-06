# Croi Extension Development Guide

## Building and Testing the Extension

### Prerequisites
- Node.js and npm installed
- Chrome browser for testing

### Development Workflow

1. **Pull latest changes**
   ```bash
   git pull
   ```

2. **Build the extension**
   ```bash
   npm run build:ext
   ```
   
   For development with auto-rebuild:
   ```bash
   npm run dev:ext
   ```

3. **Load the extension in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the `dist/extension` folder from your project
   
   ![Chrome Extensions Developer Mode](https://developer.chrome.com/static/docs/extensions/get-started/tutorial/hello-world/image/extensions-page-e0d64d89a6acf_1920.png)

4. **Reload after changes**
   - After running `npm run build:ext`, click the refresh button on your extension in `chrome://extensions/`
   - Or use the keyboard shortcut `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac) while focused on the extension

### Testing the Extension
1. Navigate to [LinkedIn](https://www.linkedin.com/feed/)
2. Look for "Save" buttons on posts in your feed
3. Click a save button to test the functionality
4. Check the browser console for any errors

### Development Tips
- Use `npm run dev:ext` for continuous building during development
- Check the Chrome Developer Console for debugging information
- The extension logs debug information with the prefix "Croi Extension:"

### File Structure
```
src/extension/
├── content.ts              # Main content script
├── service-worker.ts       # Background service worker
├── detector/
│   ├── detector.ts         # Main post detection logic
│   ├── selectors.ts        # CSS selectors for posts
│   └── filters.ts          # Post filtering logic
├── button-manager.ts       # Save button creation and handling
├── storage-manager.ts      # Chrome storage interface
├── notification-manager.ts # In-page notifications
├── post-extractor.ts      # Post data extraction
├── content-styles.css      # Extension styles
└── utils/
    └── throttle.ts         # Utility functions
```

### Troubleshooting
- **Extension not loading**: Check the console in `chrome://extensions/` for error messages
- **Save buttons not appearing**: Check the browser console on LinkedIn for error logs
- **Posts not saving**: Verify the service worker is running in `chrome://extensions/`