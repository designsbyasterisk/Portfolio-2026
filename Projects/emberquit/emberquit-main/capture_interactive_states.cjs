const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/app_standalone.html';
const SCREENS_DIR = path.resolve(__dirname, '..', 'figma_screens');

const assetsDir = path.resolve(__dirname, 'dist', 'assets');
const cssFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.css'));
const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

const defaultState = {
  schemaVersion: 1,
  profile: { currency: "₹", locale: "en-IN", narrationTone: "playful" },
  cigarettes: [
    { id: '1', ts: Date.now() - 3600000 * 4, trigger: 'coffee' },
    { id: '2', ts: Date.now() - 3600000 * 2, trigger: 'stress' },
  ],
  cravings: [],
  companion: { name: "Ember", stage: "sprout", vitality: 70 },
  badges: [],
  xp: 50,
  seenNarrationIds: [],
  onboardedAt: Date.now() - 86400000 * 3,
  assessment: {
    ageRange: "25-34", cigsPerDay: 15, yearsSmoking: 5,
    pricePerPack: 300, cigsPerPack: 20,
    fagerstrom: [2, 1, 1, 1, 0, 1],
    triggers: ["stress", "coffee", "social"],
    hardestTime: "morning", pastAttempts: 1,
    motivations: ["health", "money"],
    whySentence: "For my family.",
    goalMode: "let_app_decide",
  },
  plan: {
    startDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    dependenceLevel: "medium", fagerstromScore: 6, weeks: 10,
    schedule: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    baselineCigsPerDay: 15,
  }
};

async function getPhoneHtml(page) {
  await page.waitForTimeout(800);
  const container = page.locator('.relative.w-\\[393px\\]');
  const count = await container.count();
  if (count > 0) return await container.evaluate(el => el.outerHTML);
  return await page.evaluate(() => document.body.innerHTML);
}

function makeBlock(label, html) {
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
  const blocks = [];

  // ─────────────────────────────────────────────────────────────────
  // GROUP 1: BOX BREATHING (2 states)
  // ─────────────────────────────────────────────────────────────────
  {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.evaluate((s) => localStorage.setItem('ember.state.v1', JSON.stringify(s)), defaultState);
    await page.goto(`${BASE_URL}#/toolkit`);
    await page.waitForLoadState('networkidle');

    // Toolkit idle
    console.log('Capturing: Toolkit (idle)...');
    blocks.push(makeBlock('Toolkit – Idle', await getPhoneHtml(page)));

    // Click Start → breathing active
    await page.click('button:has-text("Start")');
    await page.waitForTimeout(1200); // let animation settle
    console.log('Capturing: Toolkit – Box Breathing Active...');
    blocks.push(makeBlock('Toolkit – Box Breathing Active', await getPhoneHtml(page)));

    await context.close();
  }

  // ─────────────────────────────────────────────────────────────────
  // GROUP 2: I SMOKED + TRIGGER POPUP
  // ─────────────────────────────────────────────────────────────────
  {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.evaluate((s) => localStorage.setItem('ember.state.v1', JSON.stringify(s)), defaultState);
    await page.goto(`${BASE_URL}#/home`);
    await page.waitForLoadState('networkidle');

    // Dashboard before clicking
    console.log('Capturing: Dashboard (home)...');
    blocks.push(makeBlock('Dashboard – Home', await getPhoneHtml(page)));

    // Click "I smoked one"
    await page.click('button:has-text("I smoked one")');
    await page.waitForTimeout(600);
    console.log('Capturing: Trigger Popup (after I smoked)...');
    blocks.push(makeBlock('I Smoked – Trigger Popup', await getPhoneHtml(page)));

    // Select a trigger
    await page.click('button:has-text("Stress")');
    await page.waitForTimeout(600);
    console.log('Capturing: Dashboard after trigger selected...');
    blocks.push(makeBlock('After Trigger Selected – Updated Dashboard', await getPhoneHtml(page)));

    await context.close();
  }

  // ─────────────────────────────────────────────────────────────────
  // GROUP 3: CRAVING SOS (3 states)
  // ─────────────────────────────────────────────────────────────────
  {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.evaluate((s) => localStorage.setItem('ember.state.v1', JSON.stringify(s)), defaultState);
    await page.goto(`${BASE_URL}#/home`);
    await page.waitForLoadState('networkidle');

    // Open Craving SOS
    await page.click('button:has-text("Craving SOS")');
    await page.waitForTimeout(700);
    console.log('Capturing: Craving SOS modal...');
    blocks.push(makeBlock('Craving SOS – Open', await getPhoneHtml(page)));

    // Click "I beat it"
    await page.click('button:has-text("I beat it")');
    await page.waitForTimeout(700);
    console.log('Capturing: Craving SOS – I beat it (success state)...');
    blocks.push(makeBlock('Craving SOS – Beaten! 🎉', await getPhoneHtml(page)));

    // Close and re-open, then click "I slipped"
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(400);
    await page.click('button:has-text("Craving SOS")');
    await page.waitForTimeout(700);
    // click smoked from SOS
    const smokedFromSOS = page.locator('button:has-text("I smoked")').first();
    const smokeCount = await smokedFromSOS.count();
    if (smokeCount > 0) {
      await smokedFromSOS.click();
      await page.waitForTimeout(600);
      console.log('Capturing: Craving SOS – I slipped (smoked) + trigger popup...');
      blocks.push(makeBlock('Craving SOS – I Slipped (trigger popup)', await getPhoneHtml(page)));
    }

    await context.close();
  }

  await browser.close();

  // ─────────────────────────────────────────────────────────────────
  // BUILD OUTPUT
  // ─────────────────────────────────────────────────────────────────
  const layoutCss = `
*, *::before, *::after { box-sizing: border-box; }
html, body {
  margin: 0; padding: 40px;
  background: #0f172a; font-family: 'Inter', sans-serif;
  display: flex; flex-direction: row; align-items: flex-start;
  gap: 48px; width: max-content; min-height: 100vh;
}
.screen-wrapper { display: flex; flex-direction: column; align-items: center; gap: 16px; flex-shrink: 0; }
.screen-label { color: rgba(255,255,255,0.5); font-size: 12px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-align: center; max-width: 393px; }
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

  const outHtml = path.join(SCREENS_DIR, 'INTERACTIVE_STATES_HTML.txt');
  const outCss  = path.join(SCREENS_DIR, 'INTERACTIVE_STATES_CSS.txt');
  fs.writeFileSync(outHtml, combinedHtml, 'utf8');
  fs.writeFileSync(outCss,  combinedCss,  'utf8');

  console.log('\n✅ Done!');
  console.log(`   HTML → figma_screens/INTERACTIVE_STATES_HTML.txt  (${(fs.statSync(outHtml).size / 1024).toFixed(1)} KB)`);
  console.log(`   CSS  → figma_screens/INTERACTIVE_STATES_CSS.txt   (${(fs.statSync(outCss).size / 1024).toFixed(1)} KB)`);
  console.log('\nScreens captured:');
  blocks.forEach((b, i) => {
    const match = b.match(/<!-- ([^-]+) -->/);
    if (match) console.log(`   ${i+1}. ${match[1].trim()}`);
  });
}

run().catch(console.error);
