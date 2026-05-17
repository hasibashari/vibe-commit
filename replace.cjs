const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('frontend/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('var(--theme-')) {
      content = content.replace(/shadow-\[([^\]]+)_var\((--theme-\d00-rgb)\),([\d.]+)\)\]/g, 'shadow-[$1_rgba(var($2),$3)]');
      content = content.replace(/drop-shadow-\[([^\]]+)_var\((--theme-\d00-rgb)\),([\d.]+)\)\]/g, 'drop-shadow-[$1_rgba(var($2),$3)]');
      fs.writeFileSync(filePath, content);
      console.log('Fixed ' + filePath);
    }
  }
});

