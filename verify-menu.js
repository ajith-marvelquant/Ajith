const fs = require('fs');
const path = require('path');

// Verify the menu item is correctly formatted
const bundles = [
  path.join(__dirname, 'app', 'dist', 'main.bundle.js'),
  path.join(__dirname, 'resources', 'app', 'dist', 'main.bundle.js')
];

bundles.forEach(bundlePath => {
  if (!fs.existsSync(bundlePath)) {
    console.log(`Skipping ${bundlePath} - not found`);
    return;
  }
  
  const data = fs.readFileSync(bundlePath, 'utf8');
  const menuIdx = data.indexOf('Download Parquet as CSV');
  
  if (menuIdx === -1) {
    console.log(`\n${bundlePath}: Menu item NOT FOUND`);
    return;
  }
  
  console.log(`\n${bundlePath}:`);
  console.log(`  ✓ Menu item found at index ${menuIdx}`);
  
  // Check if it's properly closed
  const menuSnippet = data.slice(menuIdx, menuIdx + 500);
  const openBraces = (menuSnippet.match(/{/g) || []).length;
  const closeBraces = (menuSnippet.match(/}/g) || []).length;
  
  console.log(`  Open braces: ${openBraces}, Close braces: ${closeBraces}`);
  
  // Check if handler exists
  const hasHandler = data.includes('download-parquet-as-csv');
  console.log(`  ✓ Handler exists: ${hasHandler}`);
  
  // Check if helper functions exist
  const hasConvertSingle = data.includes('convertSingleParquet');
  const hasConvertDir = data.includes('convertParquetDir');
  console.log(`  ✓ convertSingleParquet: ${hasConvertSingle}`);
  console.log(`  ✓ convertParquetDir: ${hasConvertDir}`);
  
  // Show menu item snippet
  console.log(`  Menu item code (first 200 chars):`);
  console.log(`  ${menuSnippet.slice(0, 200)}...`);
});

console.log('\n\nIMPORTANT: After patching, you MUST restart Tad.exe for the menu to appear!');
console.log('The menu is built when the application starts, so changes require a restart.');

