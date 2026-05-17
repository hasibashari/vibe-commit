const fs = require('fs');
let file = 'frontend/src/features/profile/components/ProfileModal.tsx';
let txt = fs.readFileSync(file, 'utf8');
txt = txt.replace(/await buyItem\(([^,]+), (\d+)\);/g, 'await buyItem($1, $2, coins);');
fs.writeFileSync(file, txt);
