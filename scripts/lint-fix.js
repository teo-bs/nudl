
#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('Running ESLint with --fix...');
  execSync('npx eslint . --ext .ts,.tsx --fix', { stdio: 'inherit' });
  console.log('ESLint completed successfully!');
} catch (error) {
  console.error('ESLint failed:', error.message);
  process.exit(1);
}
