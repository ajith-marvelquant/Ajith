const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// This script adds parquet-to-csv download functionality
// It injects code into main.bundle.js

const mainBundlePath = path.join(__dirname, 'app', 'dist', 'main.bundle.js');
const resourcesBundlePath = path.join(__dirname, 'resources', 'app', 'dist', 'main.bundle.js');

function addParquetDownloadHandler(bundlePath) {
  if (!fs.existsSync(bundlePath)) {
    console.log(`Bundle not found: ${bundlePath}`);
    return;
  }

  let data = fs.readFileSync(bundlePath, 'utf8');
  
  // Find where to inject the new handler (after export-file handler)
  const exportFilePattern = 'A.on("export-file"';
  const idx = data.indexOf(exportFilePattern);
  
  if (idx === -1) {
    console.log(`Could not find export-file handler in ${bundlePath}`);
    return;
  }
  
  // Find the end of the export-file handler
  let endIdx = data.indexOf('})});', idx);
  if (endIdx === -1) {
    endIdx = data.indexOf('});', idx);
  }
  if (endIdx === -1) {
    console.log(`Could not find end of export-file handler`);
    return;
  }
  
  // Create the new handler code
  const newHandler = `,A.on("download-parquet-as-csv",function(e,n){return T(void 0,void 0,void 0,function(){var t,r,o,i,a,s,l,u,d,p;return B(this,function(v){switch(v.label){case 0:return(t=b.BrowserWindow.fromWebContents(e.sender))?(r=n.sourcePath,o=n.isDirectory,[4,S().stat(r)]):[2];case 1:return i=v.sent(),i.isDirectory()?[3,2]:(a=f().basename(r).replace(/\.parquet$/i,"")+".csv",s=D.showSaveDialogSync(t,{title:"Save Parquet as CSV",defaultPath:a,filters:[{name:"CSV files",extensions:["csv"]}]}),s?[4,convertParquetToCsv(r,s)]:[2]);case 2:return l=f().basename(r)+".zip",u=D.showSaveDialogSync(t,{title:"Save Parquet Directory as ZIP",defaultPath:l,filters:[{name:"ZIP files",extensions:["zip"]}]}),u?[4,convertParquetDirToZip(r,u)]:[2];case 3:return v.sent(),[2]}})})})`;
  
  // Insert the new handler
  const before = data.substring(0, endIdx + 5);
  const after = data.substring(endIdx + 5);
  const newData = before + newHandler + after;
  
  // Add helper functions at the top (after require statements)
  const requireEnd = data.lastIndexOf('require(');
  const requireEndIdx = data.indexOf(')', requireEnd) + 1;
  
  const helperFunctions = `
const archiver=require('archiver');
function convertParquetToCsv(parquetPath,csvPath){return new Promise(function(e,n){var t=c.getExportConnection(),r="SELECT * FROM read_parquet('"+parquetPath.replace(/'/g,"''")+"')",o=k.format({headers:!0}),i=v.createWriteStream(csvPath);o.pipe(i),t.evalQuery({query:r,offset:0,limit:1e6}).then(function(a){a.rowData.forEach(function(e){var n=a.schema.columns.map(function(n){return[a.schema.displayName(n),e[n]]});o.write(n)}),o.end(),i.on('finish',function(){e()}),i.on('error',n)}).catch(n)})}
function convertParquetDirToZip(dirPath,zipPath){return new Promise(function(e,n){var t=archiver('zip',{zlib:{level:9}}),r=v.createWriteStream(zipPath);t.pipe(r),S().readdir(dirPath).then(function(o){var i=o.filter(function(e){return/\.parquet$/i.test(e)}),a=0;if(0===i.length)return t.finalize(),void r.on('close',function(){e()});i.forEach(function(o){var s=f().join(dirPath,o),l=o.replace(/\.parquet$/i,".csv"),u=c.getExportConnection(),d="SELECT * FROM read_parquet('"+s.replace(/'/g,"''")+"')",p=k.format({headers:!0});t.append(p,{name:l}),u.evalQuery({query:d,offset:0,limit:1e6}).then(function(n){n.rowData.forEach(function(e){var n=n.schema.columns.map(function(n){return[n.schema.displayName(n),e[n]]});p.write(n)}),p.end(),++a===i.length&&(t.finalize(),r.on('close',function(){e()}))}).catch(n)})}).catch(n)})}
`;
  
  // For now, let's use a simpler approach - append to the end before the final })()
  const finalPattern = /}\)\)\(\)$/;
  if (finalPattern.test(newData)) {
    // Insert helper functions before the final call
    const finalIdx = newData.lastIndexOf('})()');
    const beforeFinal = newData.substring(0, finalIdx);
    const afterFinal = newData.substring(finalIdx);
    
    // Actually, we need to add the requires and functions earlier
    // Let's find a better insertion point - after the fast-csv require
    const fastCsvIdx = data.indexOf('require("fast-csv")');
    if (fastCsvIdx !== -1) {
      const afterFastCsv = data.indexOf(';', fastCsvIdx) + 1;
      const beforeRequires = data.substring(0, afterFastCsv);
      const afterRequires = data.substring(afterFastCsv);
      
      // Check if archiver is already required
      if (data.indexOf('require("archiver")') === -1) {
        const archiverRequire = 'const archiver=require("archiver");';
        const updatedData = beforeRequires + archiverRequire + '\n' + afterRequires;
        
        // Now add the handler
        const handlerIdx = updatedData.indexOf(exportFilePattern);
        const handlerEndIdx = updatedData.indexOf('})});', handlerIdx);
        if (handlerEndIdx !== -1) {
          const beforeHandler = updatedData.substring(0, handlerEndIdx + 5);
          const afterHandler = updatedData.substring(handlerEndIdx + 5);
          const finalData = beforeHandler + newHandler + afterHandler;
          
          fs.writeFileSync(bundlePath, finalData, 'utf8');
          console.log(`Added parquet download handler to ${bundlePath}`);
          return true;
        }
      }
    }
  }
  
  console.log(`Could not modify ${bundlePath}`);
  return false;
}

// Try to add to both bundles
addParquetDownloadHandler(mainBundlePath);
addParquetDownloadHandler(resourcesBundlePath);

console.log('Done! Note: You may need to install archiver package if not already present.');

