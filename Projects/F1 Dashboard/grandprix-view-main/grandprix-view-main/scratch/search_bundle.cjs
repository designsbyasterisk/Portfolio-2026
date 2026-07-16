const fs = require('fs');
const path = require('path');

const bundlePath = path.resolve(__dirname, '..', '..', '..', 'F1_Dashboard.html');
if (!fs.existsSync(bundlePath)) {
  console.log("Bundle does not exist at: " + bundlePath);
  process.exit(1);
}

const content = fs.readFileSync(bundlePath, 'utf8');

console.log("Searching compiled bundle F1_Dashboard.html for 'compactType'...");
let pos = 0;
while ((pos = content.indexOf('compactType', pos)) !== -1) {
  console.log(`Found 'compactType' at position ${pos}: ${content.substring(pos - 20, pos + 100)}`);
  pos += 11;
}

console.log("Search complete.");
