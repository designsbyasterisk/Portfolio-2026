const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log("Launching browser to capture front and back tyre card screenshots...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Bypass tour overlay
  await page.addInitScript(() => {
    localStorage.setItem('f1_dashboard_tour_seen', 'true');
  });

  const distPath = `file:///${path.resolve(__dirname, '..', '..', 'F1_Dashboard_Standalone.html').replace(/\\/g, '/')}`;
  await page.goto(distPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Let it render fully

  const rootDir = path.resolve(__dirname, '..', '..');

  // Locate the tyre card
  const tyreCard = page.locator('.react-grid-item:has-text("Click to flip")').first();
  if (await tyreCard.isVisible()) {
    console.log("Capturing front face...");
    await tyreCard.screenshot({ path: path.join(rootDir, 'tyre_card_front.png') });
    
    console.log("Clicking tyre card to flip...");
    await tyreCard.click();
    await page.waitForTimeout(1000); // Wait for flip animation
    
    console.log("Capturing back face...");
    await tyreCard.screenshot({ path: path.join(rootDir, 'tyre_card_back.png') });
    console.log("Screenshots saved!");
  } else {
    console.log("Tyre card not found.");
  }

  await browser.close();
})();
