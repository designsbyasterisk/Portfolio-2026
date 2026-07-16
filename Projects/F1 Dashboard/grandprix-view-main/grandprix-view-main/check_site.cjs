const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.message}`);
    console.error(err.stack);
  });

  console.log("Navigating to localhost...");
  try {
    await page.goto('http://localhost:8080/', { timeout: 10000, waitUntil: 'load' });
    console.log("Navigated successfully. Page title:", await page.title());
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.error("Navigation failed:", e.message);
  }

  await browser.close();
})();
