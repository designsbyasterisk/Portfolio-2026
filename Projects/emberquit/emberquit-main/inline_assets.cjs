const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, 'dist');
const htmlPath = path.join(distDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Find css reference: <link rel="stylesheet" crossorigin href="/assets/index-DUb-YEQS.css">
const cssRefRegex = /<link rel="stylesheet"[^>]*href="\/assets\/([^"]+)"[^>]*>/i;
const cssMatch = html.match(cssRefRegex);
if (cssMatch) {
  const cssFileName = cssMatch[1];
  const cssPath = path.join(distDir, 'assets', cssFileName);
  console.log(`Inlining CSS: ${cssFileName}...`);
  if (fs.existsSync(cssPath)) {
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    html = html.replace(cssMatch[0], () => `<style>\n${cssContent}\n</style>`);
  } else {
    console.error(`CSS file not found: ${cssPath}`);
  }
}

// Find js reference: <script type="module" crossorigin src="/assets/index-BW2_ji9C.js"></script>
const jsRefRegex = /<script type="module"[^>]*src="\/assets\/([^"]+)"[^>]*><\/script>/i;
const jsMatch = html.match(jsRefRegex);
if (jsMatch) {
  const jsFileName = jsMatch[1];
  const jsPath = path.join(distDir, 'assets', jsFileName);
  console.log(`Inlining JS: ${jsFileName}...`);
  if (fs.existsSync(jsPath)) {
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    html = html.replace(jsMatch[0], () => `<script type="module">\n${jsContent}\n</script>`);
  } else {
    console.error(`JS file not found: ${jsPath}`);
  }
}

// Save as standalone.html in the main folder (emberquit)
const outputPath = path.resolve(__dirname, '..', 'app_standalone.html');
fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Successfully created standalone app HTML file at: ${outputPath}`);
