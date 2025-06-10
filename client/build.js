// build.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  // Delete the .next/trace directory if it exists to avoid permission issues
  const traceDirPath = path.join(__dirname, '.next', 'trace');
  if (fs.existsSync(traceDirPath)) {
    try {
      fs.rmdirSync(traceDirPath, { recursive: true, force: true });
      console.log('Removed .next/trace directory');
    } catch (err) {
      console.warn('Warning: Could not remove .next/trace directory:', err.message);
    }
  }
  console.log('Starting build with increased memory limit...');
  // Add --max-old-space-size=4096 to increase memory limit to 4GB
  execSync('node --max-old-space-size=4096 node_modules/next/dist/bin/next build', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--no-warnings' } 
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
