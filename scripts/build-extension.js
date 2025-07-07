
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = 'dist/extension';
const PUBLIC_DIR = 'public';

console.log('🔨 Building Croi Chrome Extension...');

async function buildExtension() {
  try {
    // Clean and create dist directory
    console.log('🗑️  Cleaning dist directory...');
    await fs.emptyDir(DIST_DIR);

    // Copy static files first
    console.log('📋 Copying static files...');
    const staticFiles = [
      { src: 'manifest.json', required: true },
      { src: 'popup.html', required: true },
      { src: 'content-script.css', required: false }
    ];

    for (const file of staticFiles) {
      const srcPath = path.join(PUBLIC_DIR, file.src);
      const destPath = path.join(DIST_DIR, file.src);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        console.log(`✅ Copied ${file.src}`);
      } else if (file.required) {
        console.error(`❌ Required file ${file.src} not found!`);
        process.exit(1);
      } else {
        console.log(`⚠️  Optional file ${file.src} not found, skipping...`);
      }
    }

    // Build TypeScript files using Vite
    console.log('📦 Building TypeScript files...');
    
    try {
      execSync('npx vite build --config vite.config.extension.ts', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('✅ Built TypeScript files successfully');
    } catch (error) {
      console.error('❌ TypeScript build failed:', error.message);
      
      // Fallback: copy existing JS files if TypeScript build fails
      console.log('⚠️  Falling back to copying existing JS files...');
      
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

    // Update manifest.json to use the correct script names
    console.log('🔧 Updating manifest.json...');
    const manifestPath = path.join(DIST_DIR, 'manifest.json');
    
    if (await fs.pathExists(manifestPath)) {
      const manifest = await fs.readJson(manifestPath);
      
      // Update content scripts
      manifest.content_scripts = [
        {
          "matches": ["https://www.linkedin.com/*"],
          "js": ["content-script.js"],
          "css": ["content-script.css"]
        }
      ];

      // Update background script
      manifest.background = {
        "service_worker": "service-worker.js"
      };

      // Update popup
      manifest.action = {
        "default_popup": "popup.html",
        "default_title": "Croi - LinkedIn Post Saver"
      };

      // Update web accessible resources
      manifest.web_accessible_resources = [
        {
          "resources": [
            "popup.html", 
            "content-script.css"
          ],
          "matches": ["https://www.linkedin.com/*"]
        }
      ];

      await fs.writeJson(manifestPath, manifest, { spaces: 2 });
      console.log('✅ Updated manifest.json');
    }

    console.log('✨ Extension built successfully!');
    console.log(`📁 Extension files are in: ${DIST_DIR}`);
    console.log('\n🚀 To load the extension in Chrome:');
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
