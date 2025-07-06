
#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { spawn } = require('child_process');
const chokidar = require('chokidar');

const DIST_DIR = 'dist/extension';
const PUBLIC_DIR = 'public';
const SRC_DIR = 'src/extension';

console.log('🔨 Starting Croi Extension Development Mode...');

let buildProcess = null;

async function buildExtension() {
  try {
    console.log('🔄 Building extension...');
    
    // Kill existing build process
    if (buildProcess) {
      buildProcess.kill();
    }

    // Run the build script
    buildProcess = spawn('node', ['scripts/build-extension.js'], { 
      stdio: 'inherit',
      shell: true 
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Extension rebuilt successfully!');
      } else {
        console.log('❌ Extension build failed');
      }
      buildProcess = null;
    });

  } catch (error) {
    console.error('❌ Build failed:', error.message);
  }
}

async function startDevMode() {
  console.log('👀 Watching for changes...');

  // Initial build
  await buildExtension();

  // Watch for changes in source files
  const watcher = chokidar.watch([
    `${SRC_DIR}/**/*.ts`,
    `${PUBLIC_DIR}/manifest.json`,
    `${PUBLIC_DIR}/*.js`,
    `${PUBLIC_DIR}/*.css`,
    `${PUBLIC_DIR}/*.html`
  ], {
    ignored: /node_modules/,
    persistent: true
  });

  watcher.on('change', async (filePath) => {
    console.log(`📝 File changed: ${filePath}`);
    await buildExtension();
  });

  watcher.on('add', async (filePath) => {
    console.log(`➕ File added: ${filePath}`);
    await buildExtension();
  });

  console.log('🚀 Development mode started. Press Ctrl+C to stop.');
  console.log('📁 Extension files will be built to:', DIST_DIR);
  console.log('🔄 Changes will trigger automatic rebuilds.');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Stopping development mode...');
  if (buildProcess) {
    buildProcess.kill();
  }
  process.exit(0);
});

startDevMode();
