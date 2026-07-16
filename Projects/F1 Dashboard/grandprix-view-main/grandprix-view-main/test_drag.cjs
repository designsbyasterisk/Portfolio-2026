const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Set standard desktop viewport
  await page.setViewport({ width: 1920, height: 1080 });

  // Bypass the tour overlay on load
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('f1_dashboard_tour_seen', 'true');
  });

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
    console.log("Waiting 3 seconds for rendering...");
    await new Promise(r => setTimeout(r, 3000));

    // Take a screenshot of the initial state
    const initialPath = path.resolve(__dirname, 'drag_initial.png');
    await page.screenshot({ path: initialPath });
    console.log("Initial screenshot saved to:", initialPath);

    // Find the Lap Timing card
    const cardSelector = '.react-grid-item';
    const cards = await page.$$(cardSelector);
    console.log(`Found ${cards.length} grid items.`);

    let lapTimingCard = null;
    for (const card of cards) {
      const text = await page.evaluate(el => el.innerText, card);
      if (text.includes('LAP TIMING') || text.includes('LAP TIMINGS') || text.includes('LAP TIMING - TOP PACE')) {
        lapTimingCard = card;
        break;
      }
    }

    if (lapTimingCard) {
      console.log("Found Lap Timing card!");
      const box = await lapTimingCard.boundingBox();
      if (box) {
        console.log(`Card box: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);
        
        // Drag from card's very top padding area (above charts, below top boundary)
        const startX = box.x + box.width / 2;
        const startY = box.y + 10;
        
        // Drag to left and down
        const endX = box.x - 400;
        const endY = box.y + 200;

        console.log(`Simulating drag from (${startX}, ${startY}) to (${endX}, ${endY})...`);
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 50 }); // slower movement to trigger grid layout updates
        await page.mouse.up();

        console.log("Drag complete. Waiting 3 seconds...");
        await new Promise(r => setTimeout(r, 3000));

        // Take a screenshot of the state after drag
        const afterPath = path.resolve(__dirname, 'drag_after.png');
        await page.screenshot({ path: afterPath });
        console.log("After-drag screenshot saved to:", afterPath);
      } else {
        console.error("Could not get bounding box for card.");
      }
    } else {
      console.error("Could not find Lap Timing card.");
    }
  } catch (e) {
    console.error("Navigation/execution failed:", e.stack || e.message);
  }

  await browser.close();
  console.log("Browser closed.");
})();
