
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = 'dist/extension';
const PUBLIC_DIR = 'public';
const SRC_DIR = 'src/extension';

console.log('🔨 Building Croi Chrome Extension...');

async function buildExtension() {
  try {
    // Clean dist directory
    console.log('🗑️  Cleaning dist directory...');
    await fs.emptyDir(DIST_DIR);

    // Copy manifest and static files first
    console.log('📋 Copying manifest and static files...');
    const staticFiles = [
      'manifest.json',
      'popup.html',
      'content-script.css'
    ];

    for (const file of staticFiles) {
      const srcPath = path.join(PUBLIC_DIR, file);
      const destPath = path.join(DIST_DIR, file);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
      } else {
        console.log(`⚠️  Warning: ${file} not found, skipping...`);
      }
    }

    // Build TypeScript files using esbuild if available, otherwise copy JS files
    console.log('📦 Building extension scripts...');
    
    try {
      // Try to build TypeScript files with esbuild
      execSync('npx esbuild src/extension/content.ts --bundle --outfile=dist/extension/content.js --format=iife --target=chrome91', { stdio: 'inherit' });
      console.log('✅ Built content script from TypeScript');
    } catch (error) {
      console.log('⚠️  TypeScript build failed, copying existing JS files...');
      
      // Fallback: copy existing JS files
      const jsFiles = [
        'post-extractor.js',
        'notification-manager.js', 
        'storage-manager.js',
        'button-manager.js',
        'post-detector.js',
        'main-content-script.js',
        'dashboard-content-script.js',
        'background.js',
        'popup.js'
      ];

      for (const file of jsFiles) {
        const srcPath = path.join(PUBLIC_DIR, file);
        const destPath = path.join(DIST_DIR, file);
        
        if (await fs.pathExists(srcPath)) {
          await fs.copy(srcPath, destPath);
          console.log(`✅ Copied ${file}`);
        } else {
          console.log(`⚠️  Warning: ${file} not found, skipping...`);
        }
      }
    }

    // Create a unified content script that loads all dependencies
    console.log('🔧 Creating unified content script...');
    const contentScript = `
// Unified Content Script for Croi Extension
console.log('Croi Extension: Loading unified content script...');

// Load all required scripts in order
const scripts = [
  'post-extractor.js',
  'notification-manager.js', 
  'storage-manager.js',
  'button-manager.js',
  'post-detector.js'
];

let loadedScripts = 0;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL(src);
    script.onload = () => {
      console.log('Croi Extension: Loaded', src);
      loadedScripts++;
      resolve();
    };
    script.onerror = () => {
      console.error('Croi Extension: Failed to load', src);
      reject(new Error('Failed to load ' + src));
    };
    document.head.appendChild(script);
  });
}

// Load scripts sequentially
async function initializeExtension() {
  try {
    for (const script of scripts) {
      await loadScript(script);
    }
    
    // Wait for all classes to be available
    let attempts = 0;
    const maxAttempts = 50;
    
    while (attempts < maxAttempts) {
      if (window.PostDetector && window.ButtonManager && window.StorageManager && window.NotificationManager && window.PostExtractor) {
        console.log('Croi Extension: All classes loaded, initializing...');
        
        // Initialize the post detector
        const postDetector = new window.PostDetector();
        postDetector.initialize();
        
        console.log('Croi Extension: Extension initialized successfully');
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (attempts >= maxAttempts) {
      console.error('Croi Extension: Failed to load all dependencies');
    }
    
  } catch (error) {
    console.error('Croi Extension: Initialization error:', error);
  }
}

// Start initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log('Croi Extension: Received message:', request);
  
  if (request.action === 'getSavedPosts') {
    try {
      const storageManager = new window.StorageManager();
      const posts = await storageManager.getSavedPosts();
      sendResponse({ posts });
    } catch (error) {
      console.error('Croi Extension: Error getting saved posts:', error);
      sendResponse({ posts: [] });
    }
    return true;
  }
});
`;

    await fs.writeFile(path.join(DIST_DIR, 'content-unified.js'), contentScript);
    console.log('✅ Created unified content script');

    // Update manifest to use the unified content script
    const manifestPath = path.join(DIST_DIR, 'manifest.json');
    if (await fs.pathExists(manifestPath)) {
      const manifest = await fs.readJson(manifestPath);
      
      // Update content scripts to use unified script
      manifest.content_scripts = [
        {
          "matches": ["https://www.linkedin.com/*"],
          "js": ["content-unified.js"],
          "css": ["content-script.css"]
        },
        {
          "matches": ["https://nudl.lovable.app/*", "https://*.lovable.app/*"],
          "js": ["dashboard-content-script.js"]
        }
      ];

      // Ensure all scripts are in web_accessible_resources
      manifest.web_accessible_resources = [
        {
          "resources": [
            "popup.html", 
            "content-script.css",
            "post-extractor.js",
            "notification-manager.js", 
            "storage-manager.js",
            "button-manager.js",
            "post-detector.js"
          ],
          "matches": ["https://www.linkedin.com/*"]
        }
      ];

      await fs.writeJson(manifestPath, manifest, { spaces: 2 });
      console.log('✅ Updated manifest.json');
    }

    console.log('✨ Extension built successfully!');
    console.log(`📁 Extension files are in: ${DIST_DIR}`);
    console.log('🚀 Load the extension in Chrome by:');
    console.log('   1. Go to chrome://extensions/');
    console.log('   2. Enable "Developer mode"');
    console.log('   3. Click "Load unpacked"');
    console.log(`   4. Select the ${DIST_DIR} folder`);

    // List built files for verification
    console.log('\n📋 Built files:');
    const builtFiles = await fs.readdir(DIST_DIR);
    builtFiles.forEach(file => console.log(`   - ${file}`));

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildExtension();
