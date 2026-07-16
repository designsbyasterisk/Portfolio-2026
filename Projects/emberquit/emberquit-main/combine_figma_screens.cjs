const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.resolve(__dirname, '..', 'figma_screens');

// Screen order and labels
const SCREENS = [
  { file: 'onboarding', label: 'Onboarding' },
  { file: 'dashboard',  label: 'Dashboard' },
  { file: 'log',        label: 'Log' },
  { file: 'insights',   label: 'Insights' },
  { file: 'toolkit',    label: 'Toolkit' },
  { file: 'profile',    label: 'Profile' },
];

// Read CSS (same for all screens, take from first)
const firstCss = fs.readFileSync(path.join(SCREENS_DIR, 'dashboard_PASTE_CSS.txt'), 'utf8');

// Read each screen's body HTML
const screenBlocks = SCREENS.map(({ file, label }) => {
  const htmlPath = path.join(SCREENS_DIR, `${file}_PASTE_HTML.txt`);
  if (!fs.existsSync(htmlPath)) {
    console.warn(`  ⚠️  Missing: ${file}_PASTE_HTML.txt — skipping`);
    return '';
  }
  const html = fs.readFileSync(htmlPath, 'utf8');
  return `
  <!-- ============================================================ -->
  <!-- SCREEN: ${label.toUpperCase()} -->
  <!-- ============================================================ -->
  <div class="screen-wrapper">
    <div class="screen-label">${label}</div>
    <div class="phone-shell">
      ${html}
    </div>
  </div>`;
}).join('\n');

// Combined CSS: app styles + layout styles for the wrapper
const layoutCss = `
/* ========================
   FIGMA IMPORT LAYOUT
   ======================== */
*, *::before, *::after { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 40px;
  background: #0f172a;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 48px;
  width: max-content;
  min-height: 100vh;
}

.screen-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.screen-label {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.phone-shell {
  width: 393px;
  height: 852px;
  overflow: hidden;
  border-radius: 48px;
  border: 10px solid #1e293b;
  box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
  position: relative;
  background: #f1f5f9;
  flex-shrink: 0;
}

.phone-shell > * {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0 !important;
  border: none !important;
  box-shadow: none !important;
  transform: none !important;
}
`;

const combinedCss = layoutCss + '\n\n' + firstCss;

const combinedHtml = `<div id="root">
  <div style="display:flex; flex-direction:row; align-items:flex-start; gap:48px; padding:40px; background:#0f172a; width:max-content; min-height:100vh;">
${screenBlocks}
  </div>
</div>`;

// Write output files
const outHtml = path.resolve(SCREENS_DIR, 'ALL_SCREENS_PASTE_HTML.txt');
const outCss  = path.resolve(SCREENS_DIR, 'ALL_SCREENS_PASTE_CSS.txt');

fs.writeFileSync(outHtml, combinedHtml, 'utf8');
fs.writeFileSync(outCss,  combinedCss,  'utf8');

console.log('✅ Combined files created:');
console.log(`   HTML → figma_screens/ALL_SCREENS_PASTE_HTML.txt  (${(fs.statSync(outHtml).size / 1024).toFixed(1)} KB)`);
console.log(`   CSS  → figma_screens/ALL_SCREENS_PASTE_CSS.txt   (${(fs.statSync(outCss).size / 1024).toFixed(1)} KB)`);
console.log('\n→ Paste ALL_SCREENS_PASTE_HTML.txt into the HTML CODE field');
console.log('→ Paste ALL_SCREENS_PASTE_CSS.txt  into the CSS CODE field');
console.log('→ All 6 screens will import as one frame in Figma!');
