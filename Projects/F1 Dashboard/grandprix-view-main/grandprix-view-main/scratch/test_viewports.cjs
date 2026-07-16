const { chromium } = require('playwright');
const path = require('path');

async function testWidth(width, height) {
  console.log(`\nTesting viewport size: ${width}x${height}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width, height }
  });
  const page = await context.newPage();
  
  await page.addInitScript(() => {
    localStorage.setItem('f1_dashboard_tour_seen', 'true');
  });

  const distPath = `file:///${path.resolve(__dirname, '..', '..', '..', 'F1_Dashboard_Standalone.html').replace(/\\/g, '/')}`;
  
  try {
    await page.goto(distPath, { timeout: 15000, waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    const items = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('.react-grid-item'));
      return elements.map(el => {
        const titleEl = el.querySelector('.card-title-adaptive, h3, .panel-title');
        return {
          title: titleEl ? titleEl.innerText : 'Unknown Title',
          style: el.getAttribute('style')
        };
      });
    });

    items.forEach((item, index) => {
      console.log(`[${index + 1}] Title: "${item.title.trim()}"`);
      console.log(`    Style: ${item.style}`);
    });

  } catch (e) {
    console.error("Test failed:", e);
  }

  await browser.close();
}

(async () => {
  await testWidth(1920, 1080);
  await testWidth(1280, 800);
  await testWidth(1000, 700);
})();
