const fs = require('fs');
const path = require('path');

// Script to add example file download functionality to Tad
// This patches the main.bundle.js file

const bundles = [
  path.join(__dirname, 'app', 'dist', 'main.bundle.js'),
  path.join(__dirname, 'resources', 'app', 'dist', 'main.bundle.js')
];

function patchBundle(bundlePath) {
  if (!fs.existsSync(bundlePath)) {
    console.log(`Skipping ${bundlePath} - file not found`);
    return false;
  }

  console.log(`Patching ${bundlePath}...`);
  let data = fs.readFileSync(bundlePath, 'utf8');
  
  // Check if already patched
  const hasHandler = data.includes('download-example-file');
  
  if (hasHandler) {
    console.log(`  Already patched, skipping`);
    return true;
  }
  
  // Find the openExample handler registration
  // Look for b.ipcMain.handle("openExample" pattern
  const openExamplePattern = 'b.ipcMain.handle("openExample"';
  let idx = data.indexOf(openExamplePattern);
  
  if (idx === -1) {
    console.log(`  Could not find openExample handler registration`);
    return false;
  }
  
  // Find the closing parenthesis of the handle call: b.ipcMain.handle("openExample",te)
  // We need to find where this call ends (the closing paren)
  let handlerEnd = idx;
  let parenDepth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = idx; i < Math.min(idx + 500, data.length); i++) {
    const char = data[i];
    const prevChar = i > 0 ? data[i - 1] : '';
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
    } else if (!inString) {
      if (char === '(') parenDepth++;
      else if (char === ')') {
        parenDepth--;
        if (parenDepth === 0 && i > idx + 50) {
          handlerEnd = i + 1;
          break;
        }
      }
    }
  }
  
  if (handlerEnd === idx) {
    console.log(`  Could not find end of openExample handler registration`);
    return false;
  }
  
  // Create the new handler code (minified to match the style)
  // This handler gets the example file path, shows save dialog, and copies the file
  // Variables: b=electron, w=electron wrapper, D=dialog, f=path, h=fs
  // We'll use b.ipcMain.handle since openExample uses handle
  const newHandler = `,b.ipcMain.handle("download-example-file",function(e){return T(void 0,void 0,void 0,function(){var t,r,o,i,a;return B(this,function(s){switch(s.label){case 0:return(t=b.BrowserWindow.fromWebContents(e.sender))?(r=w().app.getAppPath(),o=process.defaultApp?r:f().dirname(r),i=f().join(o,"examples","movie_metadata.csv"),a=f().basename(i),r=D.showSaveDialogSync(t,{title:"Save Example File",defaultPath:a,filters:[{name:"CSV files",extensions:["csv"]}]}),r?[4,new Promise(function(e,n){try{h().copyFile(i,r,function(t){t?n(t):e()})}catch(t){n(t)}})]:[2]):[2];case 1:return s.sent(),[2]}})})})`;
  
  // Insert the new handler right after openExample handler registration
  const before = data.substring(0, handlerEnd);
  const after = data.substring(handlerEnd);
  const newData = before + newHandler + after;
  
  // Check if path and fs modules are available (they should be)
  // The handler uses: path.join, fs.copyFile (as v()), BrowserWindow (as b), dialog (as D)
  // These should already be in the bundle
  
  fs.writeFileSync(bundlePath, newData, 'utf8');
  console.log(`  Successfully patched`);
  return true;
}

// Patch both bundles
let successCount = 0;
for (const bundle of bundles) {
  if (patchBundle(bundle)) {
    successCount++;
  }
}

console.log(`\nPatched ${successCount} of ${bundles.length} bundles.`);

