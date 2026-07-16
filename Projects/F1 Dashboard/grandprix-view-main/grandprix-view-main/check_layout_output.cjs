const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log("Launching browser for layout diagnostics...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR] ${err.message}`);
    console.error(err.stack);
  });

  // Bypass tour overlay
  await page.addInitScript(() => {
    localStorage.setItem('f1_dashboard_tour_seen', 'true');
  });

  const distPath = `file:///${path.resolve(__dirname, '..', '..', 'F1_Dashboard_Standalone.html').replace(/\\/g, '/')}`;
  console.log(`Loading standalone dashboard from: ${distPath}`);

  try {
    await page.goto(distPath, { timeout: 15000, waitUntil: 'networkidle' });
    console.log("Page loaded. Waiting for layout elements to mount...");
    await page.waitForTimeout(3000);

    // Retrieve active layout items from the DOM
    const items = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.react-grid-item'));
      return elements.map(el => {
        const titleEl = el.querySelector('.card-title-adaptive, h3, .panel-title');
        return {
          title: titleEl ? titleEl.innerText : 'Unknown Title',
          classes: el.className,
          style: el.getAttribute('style')
        };
      });
    });

    console.log(`\nRendered Grid Items (${items.length} total):`);
    items.forEach((item, index) => {
      console.log(`[${index + 1}] Title: "${item.title.trim()}"`);
      console.log(`    Style: ${item.style}`);
    });

  } catch (e) {
    console.error("Diagnostic run failed:", e);
  }

  await browser.close();
})();
