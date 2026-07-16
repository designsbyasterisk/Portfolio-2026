const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/app_standalone.html';
const SCREENS_DIR = path.resolve(__dirname, '..', 'figma_screens');

// Read CSS (same for all screens)
const assetsDir = path.resolve(__dirname, 'dist', 'assets');
const cssFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.css'));
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

const ONBOARDING_STEPS = [
  { name: 'onboarding_01_welcome',    label: '01 – Welcome' },
  { name: 'onboarding_02_basics',     label: '02 – Basics' },
  { name: 'onboarding_03_fagerstrom', label: '03 – Fagerström' },
  { name: 'onboarding_04_triggers',   label: '04 – Triggers' },
  { name: 'onboarding_05_routine',    label: '05 – Routine' },
  { name: 'onboarding_06_history',    label: '06 – History' },
  { name: 'onboarding_07_motivation', label: '07 – Motivation' },
  { name: 'onboarding_08_summary',    label: '08 – Summary' },
];

async function captureBodyHtml(page, label) {
  await page.waitForTimeout(700);

  // Try phone container first, else fall back to full body
  let html = '';
  const container = page.locator('.relative.w-\\[393px\\]');
  const count = await container.count();
  if (count > 0) {
    html = await container.evaluate(el => el.outerHTML);
  } else {
    html = await page.evaluate(() => document.body.innerHTML);
  }

  return `
  <!-- ============================================================ -->
  <!-- ${label.toUpperCase()} -->
  <!-- ============================================================ -->
  <div class="screen-wrapper">
    <div class="screen-label">${label}</div>
    <div class="phone-shell">
      ${html}
    </div>
  </div>`;
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Clear state so we start at the onboarding
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => localStorage.clear());

  // Navigate to welcome
  await page.goto(`${BASE_URL}#/welcome`);
  await page.waitForLoadState('networkidle');

  const blocks = [];

  // ── Step 1: Welcome ──────────────────────────────────────────────
  console.log('Capturing: 01 – Welcome...');
  blocks.push(await captureBodyHtml(page, ONBOARDING_STEPS[0].label));

  // ── Step 2: Basics ───────────────────────────────────────────────
  console.log('Capturing: 02 – Basics...');
  await page.click('button:has-text("Let\'s begin")');
  blocks.push(await captureBodyHtml(page, ONBOARDING_STEPS[1].label));

  // Fill basics
  await page.fill('input[placeholder="e.g. 15"]', '15');
  await page.fill('input[placeholder="e.g. 8"]', '5');
  await page.fill('input[placeholder="e.g. 350"]', '300');
  await page.click('button:has-text("Continue")');

  // ── Step 3: Fagerström ───────────────────────────────────────────
  console.log('Capturing: 03 – Fagerström...');
  blocks.push(await captureBodyHtml(page, ONBOARDING_STEPS[2].label));

  // Answer all 6 Fagerstrom questions
  await page.click('button:has-text("Within 5 minutes")');
  await page.waitForTimeout(350);
  await page.click('button:has-text("Yes")');
  await page.waitForTimeout(350);
  await page.click('button:has-text("The first one in the morning")');
  await page.waitForTimeout(350);
  await page.click('button:has-text("10 or fewer")');
  await page.waitForTimeout(350);
  await page.click('button:has-text("Yes")');
  await page.waitForTimeout(350);
  await page.click('button:has-text("Yes")');
  await page.waitForTimeout(350);
  await page.click('button:has-text("Continue")');

  // ── Step 4: Triggers ─────────────────────────────────────────────
  console.log('Capturing: 04 – Triggers...');
  blocks.push(await captureBodyHtml(page, ONBOARDING_STEPS[3].label));
  await page.click('button:has-text("Stress")');
  await page.click('button:has-text("Coffee")');
  await page.click('button:has-text("Social")');
  await page.click('button:has-text("Continue")');

  // ── Step 5: Routine ──────────────────────────────────────────────
  console.log('Capturing: 05 – Routine...');
  blocks.push(await captureBodyHtml(page, ONBOARDING_STEPS[4].label));
  await page.click('button:has-text("morning")');
  await page.click('button:has-text("Continue")');

  // ── Step 6: History ──────────────────────────────────────────────
  console.log('Capturing: 06 – History...');
  blocks.push(await captureBodyHtml(page, ONBOARDING_STEPS[5].label));
  await page.fill('input[type="number"]', '2');
  await page.fill('textarea[placeholder*="e.g. patches"]', 'Tried patches before.');
  await page.click('button:has-text("Continue")');

  // ── Step 7: Motivation ───────────────────────────────────────────
  console.log('Capturing: 07 – Motivation...');
  blocks.push(await captureBodyHtml(page, ONBOARDING_STEPS[6].label));
  await page.click('button:has-text("Health")');
  await page.click('button:has-text("Money")');
  await page.fill('textarea[placeholder*="So I can play"]', 'To live longer for my family.');
  await page.click('button:has-text("Continue")');

  // ── Step 8: Summary ──────────────────────────────────────────────
  console.log('Capturing: 08 – Summary...');
  blocks.push(await captureBodyHtml(page, ONBOARDING_STEPS[7].label));

  await browser.close();

  // ── Layout CSS ────────────────────────────────────────────────────
  const layoutCss = `
*, *::before, *::after { box-sizing: border-box; }
html, body {
  margin: 0; padding: 40px;
  background: #0f172a;
  font-family: 'Inter', sans-serif;
  display: flex; flex-direction: row; align-items: flex-start;
  gap: 48px; width: max-content; min-height: 100vh;
}
.screen-wrapper { display: flex; flex-direction: column; align-items: center; gap: 16px; flex-shrink: 0; }
.screen-label { color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; }
.phone-shell {
  width: 393px; height: 852px; overflow: hidden;
  border-radius: 48px; border: 10px solid #1e293b;
  box-shadow: 0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
  position: relative; background: #f1f5f9; flex-shrink: 0;
}
.phone-shell > * {
  position: absolute; inset: 0;
  width: 100% !important; height: 100% !important;
  border-radius: 0 !important; border: none !important;
  box-shadow: none !important; transform: none !important;
}
`;

  const combinedHtml = `<div id="root">
  <div style="display:flex;flex-direction:row;align-items:flex-start;gap:48px;padding:40px;background:#0f172a;width:max-content;min-height:100vh;">
${blocks.join('\n')}
  </div>
</div>`;

  const combinedCss = layoutCss + '\n\n' + cssContent;

  const outHtml = path.join(SCREENS_DIR, 'ONBOARDING_ALL_STEPS_HTML.txt');
  const outCss  = path.join(SCREENS_DIR, 'ONBOARDING_ALL_STEPS_CSS.txt');
  fs.writeFileSync(outHtml, combinedHtml, 'utf8');
  fs.writeFileSync(outCss,  combinedCss,  'utf8');

  console.log('\n✅ Done!');
  console.log(`   HTML → figma_screens/ONBOARDING_ALL_STEPS_HTML.txt  (${(fs.statSync(outHtml).size / 1024).toFixed(1)} KB)`);
  console.log(`   CSS  → figma_screens/ONBOARDING_ALL_STEPS_CSS.txt   (${(fs.statSync(outCss).size / 1024).toFixed(1)} KB)`);
}

run().catch(console.error);
