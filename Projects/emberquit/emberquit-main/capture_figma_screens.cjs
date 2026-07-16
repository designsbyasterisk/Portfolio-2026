const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000/app_standalone.html';

const defaultState = {
  schemaVersion: 1,
  profile: {
    currency: "₹",
    locale: "en-IN",
    narrationTone: "playful",
  },
  cigarettes: [
    { id: '1', ts: Date.now() - 3600000 * 4, trigger: 'coffee' },
    { id: '2', ts: Date.now() - 3600000 * 2, trigger: 'stress' },
    { id: '3', ts: Date.now() - 3600000 * 5, trigger: 'social' },
    { id: '4', ts: Date.now() - 86400000 - 3600000 * 3, trigger: 'coffee' },
    { id: '5', ts: Date.now() - 86400000 - 3600000 * 1, trigger: 'habit' },
  ],
  cravings: [
    { id: 'c1', ts: Date.now() - 3600000 * 6, outcome: 'beat' },
    { id: 'c2', ts: Date.now() - 3600000 * 3, outcome: 'beat' },
  ],
  companion: { name: "Ember", stage: "sprout", vitality: 70 },
  badges: [],
  xp: 150,
  seenNarrationIds: [],
  onboardedAt: Date.now() - 86400000 * 7,
  assessment: {
    ageRange: "25-34",
    cigsPerDay: 15,
    yearsSmoking: 5,
    pricePerPack: 300,
    cigsPerPack: 20,
    fagerstrom: [2, 1, 1, 1, 0, 1],
    triggers: ["stress", "coffee", "social"],
    hardestTime: "morning",
    pastAttempts: 1,
    motivations: ["health", "money"],
    whySentence: "For my family and to run again.",
    goalMode: "let_app_decide",
  },
  plan: {
    startDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    dependenceLevel: "medium",
    fagerstromScore: 6,
    weeks: 10,
    schedule: [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    baselineCigsPerDay: 15,
  }
};

const SCREENS = [
  { name: 'dashboard',  hash: '#/home',     label: 'Dashboard' },
  { name: 'log',        hash: '#/log',      label: 'Log' },
  { name: 'insights',   hash: '#/insights', label: 'Insights' },
  { name: 'toolkit',    hash: '#/toolkit',  label: 'Toolkit' },
  { name: 'profile',    hash: '#/profile',  label: 'Profile' },
  { name: 'onboarding', hash: '#/welcome',  label: 'Onboarding', skipState: true },
];

const OUTPUT_DIR = path.resolve(__dirname, '..', 'figma_screens');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function run() {
  const browser = await chromium.launch();

  // Read the CSS file
  const assetsDir = path.resolve(__dirname, 'dist', 'assets');
  const cssFile = fs.readdirSync(assetsDir).find(f => f.endsWith('.css'));
  const cssContent = fs.readFileSync(path.join(assetsDir, cssFile), 'utf8');

  for (const screen of SCREENS) {
    console.log(`Capturing: ${screen.label}...`);

    const context = await browser.newContext({
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    // Go to root first to set state
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    if (!screen.skipState) {
      await page.evaluate((state) => {
        localStorage.setItem('ember.state.v1', JSON.stringify(state));
      }, defaultState);
    }

    // Navigate to screen
    await page.goto(`${BASE_URL}${screen.hash}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500); // Let React render + animations settle

    // Get the phone container's rendered HTML
    const phoneContainer = page.locator('.relative.w-\\[393px\\]');
    const htmlContent = await phoneContainer.evaluate(el => el.outerHTML).catch(async () => {
      // If no phone container (e.g. onboarding), get the main content
      const body = await page.evaluate(() => document.body.innerHTML);
      return body;
    });

    // Build a self-contained HTML for Figma paste
    const output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Emberquit – ${screen.label}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${cssContent}
    html, body { margin: 0; padding: 0; width: 393px; height: 852px; overflow: hidden; background: #0f172a; }
  </style>
</head>
<body>
  <div id="root">
    ${htmlContent}
  </div>
</body>
</html>`;

    const htmlPath = path.join(OUTPUT_DIR, `${screen.name}.html`);
    fs.writeFileSync(htmlPath, output, 'utf8');
    console.log(`  Saved: figma_screens/${screen.name}.html`);

    await context.close();
  }

  await browser.close();
  console.log('\n✅ All screens captured! Files are in: figma_screens/');
  console.log('   For each screen:');
  console.log('   1. Open the .html file in a text editor');
  console.log('   2. Copy everything between <body> tags → paste into Figma plugin HTML field');
  console.log('   3. Copy the CSS content inside <style> tags → paste into Figma plugin CSS field');
}

run().catch(console.error);
