const fs = require('fs');
const path = require('path');

// Script to add parquet-to-csv download functionality to Tad
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
  
  // Check if already patched (but still check menu item)
  const hasHandler = data.includes('download-parquet-as-csv');
  const hasMenuItem = data.includes('Download Parquet as CSV');
  
  // Force re-patch to fix any issues
  // if (hasHandler && hasMenuItem) {
  //   console.log(`  Already fully patched, skipping`);
  //   return true;
  // }
  
  if (hasHandler && !hasMenuItem) {
    console.log(`  Handler exists but menu item missing, adding menu item...`);
  } else if (!hasHandler) {
    console.log(`  Adding handler and menu item...`);
  } else {
    console.log(`  Re-patching to ensure correctness...`);
  }
  
  // Also add menu item - find the Export menu item
  const exportMenuPattern = '{label:"Export...",click:';
  const menuIdx = data.indexOf(exportMenuPattern);
  
  // Find the export-file handler
  const exportFilePattern = 'A.on("export-file"';
  const idx = data.indexOf(exportFilePattern);
  
  if (idx === -1) {
    console.log(`  Could not find export-file handler`);
    return false;
  }
  
  // Find the end of the export-file handler (look for the closing });
  let endIdx = idx;
  let depth = 0;
  let inString = false;
  let stringChar = '';
  
  for (let i = idx; i < data.length; i++) {
    const char = data[i];
    const prevChar = i > 0 ? data[i - 1] : '';
    
    if (!inString && (char === '"' || char === "'")) {
      inString = true;
      stringChar = char;
    } else if (inString && char === stringChar && prevChar !== '\\') {
      inString = false;
    } else if (!inString) {
      if (char === '{') depth++;
      else if (char === '}') {
        depth--;
        if (depth === 0 && i > idx + 100) {
          endIdx = i + 1;
          break;
        }
      }
    }
  }
  
  if (endIdx === idx) {
    console.log(`  Could not find end of export-file handler`);
    return false;
  }
  
  // Create the new handler code (minified to match the style)
  const newHandler = `,A.on("download-parquet-as-csv",function(e,n){return T(void 0,void 0,void 0,function(){var t,r,o,i,a,s,l,u,d,p,v;return B(this,function(h){switch(h.label){case 0:return(t=b.BrowserWindow.fromWebContents(e.sender))?(r=n.sourcePath,o=n.isDirectory,[4,S().stat(r)]):[2];case 1:return i=h.sent(),i.isDirectory()?[3,2]:(a=f().basename(r).replace(/\\.parquet$/i,"")+".csv",s=D.showSaveDialogSync(t,{title:"Save Parquet as CSV",defaultPath:a,filters:[{name:"CSV files",extensions:["csv"]}]}),s?[4,convertSingleParquet(r,s)]:[2]);case 2:return l=f().basename(r)+".zip",u=D.showSaveDialogSync(t,{title:"Save Parquet Directory as ZIP",defaultPath:l,filters:[{name:"ZIP files",extensions:["zip"]}]}),u?[4,convertParquetDir(r,u)]:[2];case 3:return h.sent(),[2]}})})})`;
  
  // Insert the new handler right after export-file (only if not already present)
  let newData = data;
  if (!hasHandler) {
    const before = data.substring(0, endIdx);
    const after = data.substring(endIdx);
    newData = before + newHandler + after;
  }
  
  // Now add the helper functions before the final IIFE
  // Find a good place to add them - after the fast-csv require
  const fastCsvIdx = newData.indexOf('require("fast-csv")');
  if (fastCsvIdx !== -1) {
    const afterFastCsv = newData.indexOf(';', fastCsvIdx) + 1;
    const beforeRequires = newData.substring(0, afterFastCsv);
    const afterRequires = newData.substring(afterFastCsv);
    
    // Add archiver require if not present
    let archiverRequire = '';
    if (newData.indexOf('require("archiver")') === -1) {
      archiverRequire = 'const archiver=require("archiver");';
    }
    
    // Add helper functions
    const helperFunctions = `
function convertSingleParquet(parquetPath,csvPath){return new Promise(function(e,n){try{var t=c.getExportConnection(),r="SELECT * FROM read_parquet('"+parquetPath.replace(/'/g,"''")+"')",o=k.format({headers:!0}),i=v.createWriteStream(csvPath);o.pipe(i),t.evalQuery({query:r,offset:0,limit:1e6}).then(function(a){a.rowData.forEach(function(e){var n=a.schema.columns.map(function(n){return[a.schema.displayName(n),e[n]]});o.write(n)}),o.end(),i.on("finish",e),i.on("error",n)}).catch(n)}catch(t){n(t)}})}
function convertParquetDir(dirPath,zipPath){return new Promise(function(e,n){try{var t=archiver("zip",{zlib:{level:9}}),r=v.createWriteStream(zipPath);t.pipe(r),S().readdir(dirPath).then(function(o){var i=o.filter(function(e){return/\\.parquet$/i.test(e)}),a=0;if(0===i.length){t.finalize(),r.on("close",e);return}i.forEach(function(o){var s=f().join(dirPath,o),l=o.replace(/\\.parquet$/i,".csv"),u=c.getExportConnection(),d="SELECT * FROM read_parquet('"+s.replace(/'/g,"''")+"')",p=k.format({headers:!0});t.append(p,{name:l}),u.evalQuery({query:d,offset:0,limit:1e6}).then(function(n){n.rowData.forEach(function(e){var n=n.schema.columns.map(function(n){return[n.schema.displayName(n),e[n]]});p.write(n)}),p.end(),++a===i.length&&(t.finalize(),r.on("close",e))}).catch(n)})}).catch(n)}catch(t){n(t)}})}
`;
    
    let finalData = beforeRequires + archiverRequire + helperFunctions + afterRequires;
    
    // Add menu item for parquet download
    if (menuIdx !== -1 && !finalData.includes('Download Parquet as CSV')) {
      // Find the Export menu item and add Download Parquet as CSV after it
      // Look for the closing of the Export menu item: }}]
      let exportMenuEnd = finalData.indexOf('}}]', menuIdx);
      if (exportMenuEnd === -1) {
        // Try alternative pattern
        exportMenuEnd = finalData.indexOf('}]', menuIdx);
      }
      if (exportMenuEnd !== -1) {
        const beforeMenu = finalData.substring(0, exportMenuEnd);
        const afterMenu = finalData.substring(exportMenuEnd);
        // Get the current file path from app state and trigger download
        // Menu click handler: (event, window, details) - window is BrowserWindow object
        const newMenuItem = `},{label:"Download Parquet as CSV...",click:function(e,n,t){n&&function(e){T(void 0,void 0,void 0,function(){var t,r,o,i,a,s,l,u;return B(this,function(d){switch(d.label){case 0:return[4,Y(e)];case 1:return t=d.sent(),r=t.dsPath||t.fspath,r?(o=r.sourceId?r.sourceId.resourceId:r.path,o&&(/\.parquet$/i.test(o)||h().statSync(o).isDirectory())?[4,S().stat(o)]:[2]):[2];case 2:return i=d.sent(),i.isDirectory()?[3,3]:(a=f().basename(o).replace(/\\.parquet$/i,"")+".csv",s=D.showSaveDialogSync(e,{title:"Save Parquet as CSV",defaultPath:a,filters:[{name:"CSV files",extensions:["csv"]}]}),s?[4,convertSingleParquet(o,s)]:[2]);case 3:return l=f().basename(o)+".zip",u=D.showSaveDialogSync(e,{title:"Save Parquet Directory as ZIP",defaultPath:l,filters:[{name:"ZIP files",extensions:["zip"]}]}),u?[4,convertParquetDir(o,u)]:[2];case 4:return d.sent(),[2]}})})}(n)}}`;
        finalData = beforeMenu + newMenuItem + afterMenu;
        console.log(`  Added menu item`);
      } else {
        console.log(`  Could not find menu insertion point`);
      }
    } else if (finalData.includes('Download Parquet as CSV')) {
      console.log(`  Menu item already exists`);
    }
    
    fs.writeFileSync(bundlePath, finalData, 'utf8');
    console.log(`  Successfully patched`);
    return true;
  }
  
  console.log(`  Could not find insertion point for helper functions`);
  return false;
}

// Patch both bundles
let successCount = 0;
for (const bundle of bundles) {
  if (patchBundle(bundle)) {
    successCount++;
  }
}

console.log(`\nPatched ${successCount} of ${bundles.length} bundles.`);
console.log('\nNote: You may need to install the "archiver" package if it\'s not already available.');
console.log('Run: npm install archiver (if you have npm/node_modules)');

