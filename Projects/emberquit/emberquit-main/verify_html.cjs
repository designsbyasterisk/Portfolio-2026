const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'app_standalone.html');
const html = fs.readFileSync(filePath, 'utf8');

console.log("File size:", html.length, "bytes");

const scriptStartCount = (html.match(/<script type="module">/g) || []).length;
const scriptEndCount = (html.match(/<\/script>/g) || []).length;
const styleStartCount = (html.match(/<style>/g) || []).length;
const styleEndCount = (html.match(/<\/style>/g) || []).length;

console.log("<script type=\"module\"> count:", scriptStartCount);
console.log("</script> count:", scriptEndCount);
console.log("<style> count:", styleStartCount);
console.log("</style> count:", styleEndCount);

if (scriptStartCount === 1 && scriptEndCount === 1 && styleStartCount === 1 && styleEndCount === 1) {
  console.log("HTML structure looks completely valid!");
} else {
  console.error("HTML structure is invalid!");
}
