const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log("Launching browser to capture presentation screenshots...");
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
  console.log(`Loading standalone dashboard from: ${distPath}`);
  await page.goto(distPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000); // Let it render fully

  console.log("Seeking replay to Lap 20...");
  const selectDropdown = page.locator('select').first();
  await selectDropdown.selectOption('20');
  await page.waitForTimeout(1000); // Wait for state change to propagate

  console.log("Pausing replay at Lap 20...");
  const pauseBtn = page.locator('button:has(svg.lucide-pause)');
  if (await pauseBtn.count() > 0) {
    await pauseBtn.first().click();
    console.log("Paused replay successfully.");
  } else {
    console.log("Could not find pause button or already paused.");
  }
  await page.waitForTimeout(2000); // Let charts and 3D canvas settle at Lap 20

  const rootDir = path.resolve(__dirname, '..', '..');

  // Screenshot 1: Full Dashboard
  console.log("Capturing full dashboard screenshot...");
  await page.screenshot({ path: path.join(rootDir, 'dashboard_full.png') });

  // Screenshot 2: Widgets Dropdown
  console.log("Opening widgets dropdown...");
  const widgetsBtn = page.locator('button:has-text("Widgets")');
  const btnBox = await widgetsBtn.boundingBox();
  if (btnBox) {
    await page.mouse.click(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);
    await page.waitForTimeout(500);
    console.log("Capturing widgets dropdown...");
    // Let's capture the top-right header area where the dropdown is open
    await page.screenshot({ 
      path: path.join(rootDir, 'widgets_dropdown.png'),
      clip: {
        x: 1400,
        y: 0,
        width: 520,
        height: 400
      }
    });
    // Close dropdown
    await page.mouse.click(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);
    await page.waitForTimeout(500);
  }

  // Screenshot 3: Telemetry Card
  console.log("Capturing Telemetry card...");
  const telemetryCard = page.locator('.react-grid-item', { hasText: 'TELEMETRY' }).first();
  if (await telemetryCard.isVisible()) {
    await telemetryCard.screenshot({ path: path.join(rootDir, 'telemetry_card.png') });
  }

  // Screenshot 4: Circuit Specs Card
  console.log("Capturing Circuit Specs card...");
  const circuitSpecsCard = page.locator('.react-grid-item', { hasText: 'CIRCUIT SPECS' }).first();
  if (await circuitSpecsCard.isVisible()) {
    await circuitSpecsCard.screenshot({ path: path.join(rootDir, 'circuit_specs_card.png') });
  }

  console.log("Screenshots captured successfully!");
  await browser.close();
})();
