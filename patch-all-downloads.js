// Combined patch script for all download functionality
// Run both patch scripts in sequence

console.log('=== Patching Tad for Download Functionality ===\n');

// Note: We need to run the patches by executing them, not requiring
// Since they modify files, we'll run them via child_process

const { execSync } = require('child_process');
const path = require('path');

try {
  console.log('1. Patching example file download...');
  execSync(`node "${path.join(__dirname, 'patch-example-download.js')}"`, { stdio: 'inherit' });
  
  console.log('\n2. Patching parquet download (menu item already exists)...');
  execSync(`node "${path.join(__dirname, 'patch-parquet-download.js')}"`, { stdio: 'inherit' });
  
  console.log('\n3. Patching download button IPC handler...');
  execSync(`node "${path.join(__dirname, 'patch-download-button-handler.js')}"`, { stdio: 'inherit' });
  
  console.log('\n4. Patching sidebar button...');
  execSync(`node "${path.join(__dirname, 'patch-sidebar-button.js')}"`, { stdio: 'inherit' });
  
  console.log('\n=== All patches completed successfully! ===');
  console.log('\nNote: Parquet download is available via:');
  console.log('      - Download button in top-right corner (when parquet file is open)');
  console.log('      - File > Download Parquet as CSV... menu');
  console.log('      Example file download is available via the Download button on Quick Start page');
} catch (error) {
  console.error('Error running patches:', error.message);
  process.exit(1);
}

