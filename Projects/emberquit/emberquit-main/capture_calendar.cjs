const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8086;
const BASE_URL = `http://localhost:${PORT}`;

const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

function waitForServer(url, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for server to start'));
        return;
      }
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {});
    }, 500);
  });
}

async function run() {
  console.log('Starting Vite server...');
  const viteProcess = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: __dirname,
    shell: true,
    stdio: 'inherit'
  });

  const cleanup = () => {
    try {
      viteProcess.kill();
      console.log('Vite server stopped.');
    } catch (e) {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });
  process.on('SIGTERM', () => { cleanup(); process.exit(1); });

  try {
    console.log(`Waiting for server to be ready at ${BASE_URL}...`);
    await waitForServer(BASE_URL);
    console.log('Server ready. Launching browser...');

    const browser = await chromium.launch();
    const context = await browser.newContext({
      viewport: { width: 450, height: 920 },
      deviceScaleFactor: 2, // High resolution
    });

    const page = await context.newPage();

    // Start on onboarding/welcome and bypass to set plan
    await page.goto(`${BASE_URL}/welcome`);
    await page.waitForLoadState('networkidle');

    // Onboard
    await page.click('button:has-text("Let\'s begin")');
    await page.waitForTimeout(1000);
    
    await page.fill('input[placeholder="e.g. 15"]', '15');
    await page.fill('input[placeholder="e.g. 8"]', '5');
    await page.fill('input[placeholder="e.g. 350"]', '300');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);

    // Answer Qs
    await page.click('button:has-text("Within 5 minutes")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Yes")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("The first one in the morning")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("10 or fewer")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Yes")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Yes")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);

    // Triggers
    await page.click('button:has-text("Stress")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);

    // Routine
    await page.click('button:has-text("morning")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);

    // History
    await page.fill('input[type="number"]', '2');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);

    // Motivation
    await page.click('button:has-text("Health")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Continue")');
    await page.waitForTimeout(1000);

    // Start
    await page.click('button:has-text("Start my journey")');
    await page.waitForTimeout(2000);

    // Go to You (Profile) to seed
    await page.click('a:has-text("You")');
    await page.waitForTimeout(500);

    console.log('Seeding 35 days of data...');
    await page.click('button:has-text("Seed 35 days of test data")');
    // Wait for toast notification to clear
    await page.waitForTimeout(4500);

    // Go to Log tab
    console.log('Navigating to Log tab...');
    await page.click('a:has-text("Log")');
    await page.waitForTimeout(1000);

    // Selector for the calendar card element (the first card on the Log page)
    console.log('Capturing calendar card element...');
    const calendarCard = page.locator('.p-5.glass').first();
    const outputPath = path.join(SCREENSHOTS_DIR, '21_calendar_5_weeks.png');
    
    await calendarCard.screenshot({ path: outputPath });
    console.log(`Successfully saved: 21_calendar_5_weeks.png`);

    await context.close();
    await browser.close();
    cleanup();
  } catch (error) {
    console.error('Error during capture:', error);
    cleanup();
    process.exit(1);
  }
}

run();
