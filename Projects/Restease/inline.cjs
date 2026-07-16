const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function inlineAssets() {
  console.log('Step 1: Running Vite build for production...');
  try {
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname });
    console.log('Build completed successfully!');
  } catch (error) {
    console.error('Error running build:', error);
    process.exit(1);
  }

  const distDir = path.join(__dirname, 'dist');
  const assetsDir = path.join(distDir, 'assets');

  // Read index.html
  console.log('Step 2: Locating build outputs...');
  const htmlPath = path.join(distDir, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.error('Could not find dist/index.html!');
    process.exit(1);
  }
  let html = fs.readFileSync(htmlPath, 'utf8');

  // Find CSS and JS in assets
  if (!fs.existsSync(assetsDir)) {
    console.error('Assets directory does not exist!');
    process.exit(1);
  }
  const files = fs.readdirSync(assetsDir);
  const jsFile = files.find(f => f.endsWith('.js'));
  const cssFile = files.find(f => f.endsWith('.css'));

  if (!jsFile || !cssFile) {
    console.error('Could not find both JS and CSS files in dist/assets!');
    process.exit(1);
  }

  console.log(`Found CSS: ${cssFile}`);
  console.log(`Found JS: ${jsFile}`);

  // Read contents
  const jsContent = fs.readFileSync(path.join(assetsDir, jsFile), 'utf8');
  const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

  console.log('Step 3: Inlining CSS and JS into index.html...');

  // Match the CSS link tag: <link rel="stylesheet" crossorigin href="/assets/index-xxxx.css">
  const cssRegex = /<link\s+[^>]*rel="stylesheet"[^>]*href="\/assets\/[^"]+"[^>]*>/i;
  // Match the JS script tag: <script type="module" crossorigin src="/assets/index-xxxx.js"></script>
  const jsRegex = /<script\s+[^>]*src="\/assets\/[^"]+"[^>]*><\/script>/i;

  // Replace link tag with style tag
  if (cssRegex.test(html)) {
    html = html.replace(cssRegex, () => `<style>${cssContent}</style>`);
    console.log('CSS inlined successfully.');
  } else {
    console.warn('Could not find matching CSS link tag in index.html, appending style tag instead...');
    html = html.replace('</head>', () => `<style>${cssContent}</style></head>`);
  }

  // Replace script tag with inline script (retaining type="module" for module scoping)
  if (jsRegex.test(html)) {
    html = html.replace(jsRegex, () => `<script type="module">${jsContent}</script>`);
    console.log('JS inlined successfully.');
  } else {
    console.warn('Could not find matching script tag in index.html, appending script tag instead...');
    html = html.replace('</body>', () => `<script type="module">${jsContent}</script></body>`);
  }

  // Write single file output to root directory
  const destPath = path.join(__dirname, 'restease.html');
  fs.writeFileSync(destPath, html, 'utf8');
  console.log(`\n🎉 Success! Standalone single-file HTML generated at:`);
  console.log(destPath);
}

inlineAssets();
