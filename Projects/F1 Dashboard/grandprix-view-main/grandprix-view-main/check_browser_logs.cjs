const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Catch console logs with serialization
  page.on('console', async (msg) => {
    try {
      const args = await Promise.all(
        msg.args().map(arg => 
          arg.jsonValue().then(val => {
            if (typeof val === 'object') {
              return JSON.stringify(val, null, 2);
            }
            return String(val);
          }).catch(() => '[unserializable]')
        )
      );
      console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}:`, ...args);
    } catch (e) {
      console.log(`[BROWSER CONSOLE] ${msg.type().toUpperCase()}: ${msg.text()}`);
    }
  });

  page.on('pageerror', err => {
    console.error(`[BROWSER ERROR]:`, err.message);
  });

  console.log("Navigating to http://localhost:8080/...");
  try {
    await page.goto('http://localhost:8080/', { waitUntil: 'load', timeout: 15000 });
    console.log("Page loaded. Waiting 5 seconds for React components to mount...");
    await new Promise(r => setTimeout(r, 5000));
  } catch (e) {
    console.error("Navigation failed:", e.message);
  }

  await browser.close();
  console.log("Browser closed.");
})();
