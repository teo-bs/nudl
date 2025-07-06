
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = 'dist/extension';
const PUBLIC_DIR = 'public';

console.log('🔨 Building Croi Chrome Extension...');

async function buildExtension() {
  try {
    // Clean dist directory
    console.log('🗑️  Cleaning dist directory...');
    await fs.emptyDir(DIST_DIR);

    // Build TypeScript files with Vite
    console.log('📦 Building TypeScript files...');
    execSync('npx vite build --config vite.ext.config.ts', { stdio: 'inherit' });

    // Copy manifest and other static files
    console.log('📋 Copying manifest and static files...');
    const filesToCopy = [
      'manifest.json',
      'popup.html',
      'popup.js',
      'content-script.css',
      'post-extractor.js',
      'notification-manager.js',
      'storage-manager.js',
      'button-manager.js',
      'post-detector.js',
      'main-content-script.js',
      'dashboard-content-script.js',
      'background.js'
    ];

    for (const file of filesToCopy) {
      const srcPath = path.join(PUBLIC_DIR, file);
      const destPath = path.join(DIST_DIR, file);
      
      if (await fs.pathExists(srcPath)) {
        await fs.copy(srcPath, destPath);
        console.log(`✅ Copied ${file}`);
      } else {
        console.log(`⚠️  Warning: ${file} not found, skipping...`);
      }
    }

    // Update manifest.json to use correct script names
    console.log('🔧 Updating manifest.json...');
    const manifestPath = path.join(DIST_DIR, 'manifest.json');
    const manifest = await fs.readJson(manifestPath);
    
    // Update service worker path if it was built
    if (await fs.pathExists(path.join(DIST_DIR, 'background.js'))) {
      manifest.background = {
        service_worker: 'background.js'
      };
    }

    await fs.writeJson(manifestPath, manifest, { spaces: 2 });

    console.log('✨ Extension built successfully!');
    console.log(`📁 Extension files are in: ${DIST_DIR}`);
    console.log('🚀 Load the extension in Chrome by:');
    console.log('   1. Go to chrome://extensions/');
    console.log('   2. Enable "Developer mode"');
    console.log('   3. Click "Load unpacked"');
    console.log(`   4. Select the ${DIST_DIR} folder`);

  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

buildExtension();
