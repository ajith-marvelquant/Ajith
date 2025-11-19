const fs = require('fs');
const path = require('path');

// Script to add IPC handler for the download button
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
  const hasHandler = data.includes('trigger-parquet-download-button');
  
  if (hasHandler) {
    console.log(`  Already patched, skipping`);
    return true;
  }
  
  // Find where IPC handlers are registered - look for openExample handler
  const openExamplePattern = 'b.ipcMain.handle("openExample"';
  let idx = data.indexOf(openExamplePattern);
  
  if (idx === -1) {
    console.log(`  Could not find openExample handler registration`);
    return false;
  }
  
  // Find the closing parenthesis of the handle call
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
  // This handler does what the menu item does - gets current window, app state, and triggers download
  // Variables: b=electron, w=electron wrapper, D=dialog, f=path, h=fs, S=fs/promises, T=async wrapper, B=generator wrapper
  // Y=serialize app state function
  const newHandler = `,b.ipcMain.handle("trigger-parquet-download-button",function(e){return T(void 0,void 0,void 0,function(){var t,r,o,i,a,s,l,u;return B(this,function(d){switch(d.label){case 0:return(t=b.BrowserWindow.fromWebContents(e.sender))?[4,Y(t)]:[2];case 1:return r=d.sent(),o=r.dsPath||r.fspath,o?(i=o.sourceId?o.sourceId.resourceId:o.path,i&&(/\.parquet$/i.test(i)||h().statSync(i).isDirectory())?[4,S().stat(i)]:[2]):[2];case 2:return a=d.sent(),a.isDirectory()?[3,3]:(s=f().basename(i).replace(/\.parquet$/i,"")+".csv",l=D.showSaveDialogSync(t,{title:"Save Parquet as CSV",defaultPath:s,filters:[{name:"CSV files",extensions:["csv"]}]}),l?[4,convertSingleParquet(i,l)]:[2]);case 3:return u=f().basename(i)+".zip",s=D.showSaveDialogSync(t,{title:"Save Parquet Directory as ZIP",defaultPath:u,filters:[{name:"ZIP files",extensions:["zip"]}]}),s?[4,convertParquetDir(i,s)]:[2];case 4:return d.sent(),[2]}})})})`;
  
  // Insert the new handler right after openExample handler registration
  const before = data.substring(0, handlerEnd);
  const after = data.substring(handlerEnd);
  const newData = before + newHandler + after;
  
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

