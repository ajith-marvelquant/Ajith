const fs = require('fs');
const path = require('path');

// Script to add a button in the left sidebar (red box area)
// This patches the index.html file

const indexFiles = [
  path.join(__dirname, 'app', 'dist', 'index.html'),
  path.join(__dirname, 'resources', 'app', 'dist', 'index.html')
];

function patchIndexHtml(indexPath) {
  if (!fs.existsSync(indexPath)) {
    console.log(`Skipping ${indexPath} - file not found`);
    return false;
  }

  console.log(`Patching ${indexPath}...`);
  let data = fs.readFileSync(indexPath, 'utf8');
  
  // Check if already patched
  if (data.includes('tad-sidebar-button')) {
    console.log(`  Already patched, skipping`);
    return true;
  }
  
  // Find the closing </style> tag to add sidebar button styles
  const styleEnd = data.indexOf('</style>');
  if (styleEnd === -1) {
    console.log(`  Could not find </style> tag`);
    return false;
  }
  
  // Add CSS for sidebar button
  const sidebarButtonCSS = `
      #tad-sidebar-button {
        position: fixed;
        left: 0;
        top: 120px;
        width: 48px;
        height: 48px;
        z-index: 10000;
        background-color: #0072ce;
        color: white;
        border: 2px solid #ff0000;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 4px;
        transition: background-color 0.2s;
      }
      #tad-sidebar-button:hover {
        background-color: #005a9e;
      }
      #tad-sidebar-button:active {
        background-color: #004880;
      }
`;
  
  // Insert CSS before </style>
  const beforeStyle = data.substring(0, styleEnd);
  const afterStyle = data.substring(styleEnd);
  let newData = beforeStyle + sidebarButtonCSS + afterStyle;
  
  // Find the body tag to add the button element
  const bodyTag = newData.indexOf('<body>');
  if (bodyTag === -1) {
    console.log(`  Could not find <body> tag`);
    return false;
  }
  
  // Find the closing of body tag or the div#app
  const bodyEnd = newData.indexOf('</body>');
  if (bodyEnd === -1) {
    console.log(`  Could not find </body> tag`);
    return false;
  }
  
  // Add button element before </body>
  const buttonHTML = `    <button id="tad-sidebar-button" title="Sidebar Button">Btn</button>\n`;
  const beforeBody = newData.substring(0, bodyEnd);
  const afterBody = newData.substring(bodyEnd);
  newData = beforeBody + buttonHTML + afterBody;
  
  // Find where to add the JavaScript - look for the last </script> before </html>
  const lastScriptEnd = newData.lastIndexOf('</script>');
  if (lastScriptEnd === -1) {
    console.log(`  Could not find </script> tag`);
    return false;
  }
  
  // Add JavaScript to inject button into sidebar dynamically
  const sidebarButtonJS = `
  <script>
    // Inject sidebar button functionality
    (function() {
      function initSidebarButton() {
        const sidebarBtn = document.getElementById('tad-sidebar-button');
        
        if (!sidebarBtn) {
          console.warn('Sidebar button element not found');
          return;
        }
        
        // Function to find the sidebar and inject button
        function injectIntoSidebar() {
          // Check if already injected
          if (document.getElementById('tad-sidebar-button-injected')) {
            return true;
          }
          
          // Strategy 1: Look for vertical container on the left with small icon-like children
          let sidebar = null;
          const allDivs = document.querySelectorAll('div');
          
          for (const div of allDivs) {
            const rect = div.getBoundingClientRect();
            const styles = window.getComputedStyle(div);
            
            // Check if it's positioned on the left side (within first 100px)
            if (rect.left >= 0 && rect.left < 100 && rect.width < 150) {
              // Check if it has vertical layout with multiple children
              const children = Array.from(div.children);
              if (children.length >= 2) {
                // Check if children are small (icon-like)
                const hasSmallChildren = children.some(child => {
                  const childRect = child.getBoundingClientRect();
                  return childRect.width < 80 && childRect.height < 80;
                });
                
                if (hasSmallChildren && (styles.display === 'flex' || styles.display === 'block')) {
                  sidebar = div;
                  break;
                }
              }
            }
          }
          
          // Strategy 2: Look for elements with specific class patterns
          if (!sidebar) {
            const classSelectors = [
              '*[class*="Toolbar"]',
              '*[class*="toolbar"]',
              '*[class*="Sidebar"]',
              '*[class*="sidebar"]',
              '*[class*="LeftPanel"]',
              '*[class*="left-panel"]'
            ];
            
            for (const selector of classSelectors) {
              try {
                const elements = document.querySelectorAll(selector);
                for (const el of elements) {
                  const rect = el.getBoundingClientRect();
                  if (rect.left < 100 && el.children.length >= 2) {
                    sidebar = el;
                    break;
                  }
                }
                if (sidebar) break;
              } catch (e) {
                // Invalid selector, continue
              }
            }
          }
          
          if (sidebar) {
            // Find the target slot (red box area)
            // Look for empty divs or divs with minimal content
            const children = Array.from(sidebar.children);
            let targetSlot = null;
            
            // First, look for an empty div (the red box)
            for (const child of children) {
              const childRect = child.getBoundingClientRect();
              if (childRect.width < 80 && childRect.height < 80) {
                // Check if it's empty or has minimal content
                const childText = child.textContent.trim();
                const childChildren = child.children.length;
                if ((childChildren === 0 && childText === '') || 
                    (childChildren === 0 && childRect.width > 40)) {
                  targetSlot = child;
                  break;
                }
              }
            }
            
            // If no empty slot found, use the last child or append to sidebar
            if (!targetSlot) {
              if (children.length > 0) {
                targetSlot = children[children.length - 1];
              } else {
                // Create a new container div
                targetSlot = document.createElement('div');
                sidebar.appendChild(targetSlot);
              }
            }
            
            // Create button element
            const btn = document.createElement('button');
            btn.id = 'tad-sidebar-button-injected';
            btn.textContent = 'Btn';
            btn.title = 'Sidebar Button';
            btn.style.cssText = 'width: 100%; height: 48px; background-color: #0072ce; color: white; border: 2px solid #ff0000; border-radius: 4px; cursor: pointer; font-size: 12px; font-weight: 500; display: flex; align-items: center; justify-content: center; padding: 4px; margin: 2px 0;';
            
            // Add hover styles via event listeners
            btn.addEventListener('mouseenter', function() {
              this.style.backgroundColor = '#005a9e';
            });
            btn.addEventListener('mouseleave', function() {
              this.style.backgroundColor = '#0072ce';
            });
            
            // Add click handler
            btn.addEventListener('click', function(e) {
              e.preventDefault();
              e.stopPropagation();
              console.log('Sidebar button clicked!');
              // Add your button functionality here
              if (typeof window.tadSidebarButtonClick === 'function') {
                window.tadSidebarButtonClick();
              } else {
                alert('Sidebar button clicked!');
              }
            });
            
            // Insert button into target slot
            if (targetSlot.children.length === 0 && targetSlot.textContent.trim() === '') {
              // Replace empty slot
              targetSlot.appendChild(btn);
            } else {
              // Insert before or after target slot
              if (targetSlot.nextSibling) {
                sidebar.insertBefore(btn, targetSlot.nextSibling);
              } else {
                sidebar.appendChild(btn);
              }
            }
            
            // Hide the fixed button
            sidebarBtn.style.display = 'none';
            
            console.log('Sidebar button injected successfully');
            return true;
          }
          
          return false;
        }
        
        // Try to inject immediately
        if (!injectIntoSidebar()) {
          // Retry after a delay (React may not have rendered yet)
          setTimeout(() => {
            if (!injectIntoSidebar()) {
              // Try again after longer delay
              setTimeout(() => {
                injectIntoSidebar();
              }, 2000);
            }
          }, 500);
        }
        
        // Also try when DOM changes (React renders)
        const observer = new MutationObserver(function() {
          const injected = document.getElementById('tad-sidebar-button-injected');
          if (!injected) {
            injectIntoSidebar();
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
      
      // Initialize when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebarButton);
      } else {
        initSidebarButton();
      }
      
      // Also try after React loads
      window.addEventListener('load', initSidebarButton);
    })();
  </script>
`;
  
  // Insert JavaScript before the last </script>
  const beforeScript = newData.substring(0, lastScriptEnd);
  const afterScript = newData.substring(lastScriptEnd);
  newData = beforeScript + sidebarButtonJS + afterScript;
  
  fs.writeFileSync(indexPath, newData, 'utf8');
  console.log(`  Successfully patched`);
  return true;
}

// Patch both index.html files
let successCount = 0;
for (const indexFile of indexFiles) {
  if (patchIndexHtml(indexFile)) {
    successCount++;
  }
}

console.log(`\nPatched ${successCount} of ${indexFiles.length} index.html files.`);
console.log('\nNote: The button will appear in the left sidebar (red box area) when Tad loads.');

