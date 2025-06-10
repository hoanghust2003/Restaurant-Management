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
    console.log('Starting production build (skipping type checking)...');
  // Skip type checking and linting to reduce build time
  execSync('next build --no-lint', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      NODE_OPTIONS: '--no-warnings --max-old-space-size=4096',
      NEXT_TELEMETRY_DISABLED: '1',
      DISABLE_ESLINT: 'true',
      NEXT_DISABLE_SOURCEMAPS: 'true'
    } 
  });
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
