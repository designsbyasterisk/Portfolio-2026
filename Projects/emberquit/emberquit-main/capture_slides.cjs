const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.resolve(__dirname, '..', 'presentation_screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function run() {
  console.log('Launching browser to capture presentation slides...');
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const fileUrl = `file://${path.resolve(__dirname, '..', 'presentation', 'index.html')}`;
  console.log(`Navigating to: ${fileUrl}`);
  await page.goto(fileUrl);
  await page.waitForLoadState('networkidle');

  // Let animations settle
  await page.waitForTimeout(1000);

  const totalSlides = 8;
  for (let i = 0; i < totalSlides; i++) {
    const slideNumber = i + 1;
    console.log(`Capturing slide ${slideNumber}...`);
    
    // Take screenshot of the page
    const filename = `slide_0${slideNumber}.png`;
    const outputPath = path.join(OUTPUT_DIR, filename);
    await page.screenshot({ path: outputPath });
    console.log(`Saved slide screenshot: ${filename}`);

    // Go to next slide if not the last one
    if (i < totalSlides - 1) {
      await page.keyboard.press('ArrowRight');
      // Wait for slide transition animation to complete (transition is 0.65s in CSS)
      await page.waitForTimeout(1000);
    }
  }

  await browser.close();
  console.log('All slides captured successfully!');
}

run().catch(console.error);
