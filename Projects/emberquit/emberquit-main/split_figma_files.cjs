const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.resolve(__dirname, '..', 'figma_screens');
const files = fs.readdirSync(SCREENS_DIR).filter(f => f.endsWith('.html'));

for (const file of files) {
  const name = file.replace('.html', '');
  const html = fs.readFileSync(path.join(SCREENS_DIR, file), 'utf8');

  // Extract CSS (between first <style> and </style>)
  const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  const css = cssMatch ? cssMatch[1].trim() : '';

  // Extract body HTML (between <body> and </body>)
  const bodyMatch = html.match(/<body>([\s\S]*?)<\/body>/);
  const bodyHtml = bodyMatch ? bodyMatch[1].trim() : '';

  // Write separate files
  fs.writeFileSync(path.join(SCREENS_DIR, `${name}_PASTE_HTML.txt`), bodyHtml, 'utf8');
  fs.writeFileSync(path.join(SCREENS_DIR, `${name}_PASTE_CSS.txt`), css, 'utf8');

  console.log(`✅ ${name}:`);
  console.log(`   HTML → ${name}_PASTE_HTML.txt  (${(bodyHtml.length / 1024).toFixed(1)} KB)`);
  console.log(`   CSS  → ${name}_PASTE_CSS.txt   (${(css.length / 1024).toFixed(1)} KB)`);
}

console.log('\nDone! Open any _PASTE_HTML.txt and _PASTE_CSS.txt in Notepad,');
console.log('select all (Ctrl+A), copy, and paste into the Figma plugin fields.');
