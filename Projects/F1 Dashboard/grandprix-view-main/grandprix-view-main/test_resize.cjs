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

  const url = 'http://localhost:8081/';
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log("Waiting 3 seconds for rendering...");
    await new Promise(r => setTimeout(r, 3000));

    // Find the Circuit Specs card
    const cards = await page.$$('.react-grid-item');
    console.log(`Found ${cards.length} grid items.`);

    let targetCard = null;
    for (const card of cards) {
      const text = await page.evaluate(el => el.innerText, card);
      if (text.includes('CIRCUIT SPECS')) {
        targetCard = card;
        console.log("Found Circuit Specs card! Inner text matches.");
        break;
      }
    }

    if (targetCard) {
      const box = await targetCard.boundingBox();
      console.log(`Circuit Specs box: x=${box.x}, y=${box.y}, w=${box.width}, h=${box.height}`);

      // Let's find the resize handle inside targetCard
      const handle = await targetCard.$('.react-resizable-handle');
      if (handle) {
        const handleBox = await handle.boundingBox();
        console.log(`Found resize handle at: x=${handleBox.x}, y=${handleBox.y}, w=${handleBox.width}, h=${handleBox.height}`);

        const startX = handleBox.x + handleBox.width / 2;
        const startY = handleBox.y + handleBox.height / 2;
        
        // We want to reduce the size, so we drag the handle to the left (reducing width)
        const endX = startX - 200; // Drag 200px to the left
        const endY = startY;

        console.log(`Dragging resize handle from (${startX}, ${startY}) to (${endX}, ${endY})...`);
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.mouse.move(endX, endY, { steps: 20 });
        await page.mouse.up();

        console.log("Resize complete. Waiting 3 seconds to check final state...");
        await new Promise(r => setTimeout(r, 3000));

        // Re-find the Circuit Specs card because gridKey changes forced a remount
        const cardsAfter = await page.$$('.react-grid-item');
        let targetCardAfter = null;
        for (const card of cardsAfter) {
          const text = await page.evaluate(el => el.innerText, card);
          if (text.includes('CIRCUIT SPECS')) {
            targetCardAfter = card;
            break;
          }
        }

        if (targetCardAfter) {
          const boxAfter = await targetCardAfter.boundingBox();
          console.log(`Circuit Specs box AFTER resize (post-remount): x=${boxAfter.x}, y=${boxAfter.y}, w=${boxAfter.width}, h=${boxAfter.height}`);
          
          console.log("Waiting 3 more seconds while replay time updates to see if it reverts...");
          await new Promise(r => setTimeout(r, 3000));
          
          const cardsFinal = await page.$$('.react-grid-item');
          let targetCardFinal = null;
          for (const card of cardsFinal) {
            const text = await page.evaluate(el => el.innerText, card);
            if (text.includes('CIRCUIT SPECS')) {
              targetCardFinal = card;
              break;
            }
          }
          if (targetCardFinal) {
            const boxFinal = await targetCardFinal.boundingBox();
            console.log(`Circuit Specs box FINAL: x=${boxFinal.x}, y=${boxFinal.y}, w=${boxFinal.width}, h=${boxFinal.height}`);
          }
        } else {
          console.error("Could not find Circuit Specs card after resize.");
        }
      } else {
        console.error("Could not find resize handle in the card.");
      }
    } else {
      console.error("Could not find Circuit Specs card.");
    }
  } catch (e) {
    console.error("Execution failed:", e.stack || e.message);
  }

  await browser.close();
  console.log("Browser closed.");
})();
