const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log("Launching browser for high-action recording...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: 'videos/',
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();

  // Mouse tracking state
  let mouseX = 960;
  let mouseY = 540;

  // Faster smooth move for high-action feel
  async function smoothMove(endX, endY, steps = 15) {
    const startX = mouseX;
    const startY = mouseY;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      const y = startY + (endY - startY) * (i / steps);
      await page.mouse.move(x, y);
      mouseX = x;
      mouseY = y;
      await page.waitForTimeout(10);
    }
  }

  // Rapid drag and drop
  async function dragAndDrop(cardElement, offsetX, offsetY) {
    const box = await cardElement.boundingBox();
    if (!box) return;
    const startX = box.x + 80;
    const startY = box.y + 20;
    
    await smoothMove(startX, startY, 12);
    await page.mouse.down();
    await smoothMove(startX + offsetX, startY + offsetY, 20);
    await page.mouse.up();
    await page.waitForTimeout(300);
  }

  // Rapid resize
  async function resizeCard(cardElement, resizeHandle, offsetX, offsetY) {
    const handleBox = await resizeHandle.boundingBox();
    if (!handleBox) return;
    const startX = handleBox.x + handleBox.width / 2;
    const startY = handleBox.y + handleBox.height / 2;
    
    await smoothMove(startX, startY, 12);
    await page.mouse.down();
    await smoothMove(startX + offsetX, startY + offsetY, 20);
    await page.mouse.up();
    await page.waitForTimeout(300);
  }

  // Bypass tour overlay
  await page.addInitScript(() => {
    localStorage.setItem('f1_dashboard_tour_seen', 'true');
  });

  const distPath = `file:///${path.resolve(__dirname, 'dist', 'index.html').replace(/\\/g, '/')}`;
  await page.goto(distPath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500); // initial render

  // Helper to re-query active cards
  async function getCardMap() {
    const cards = await page.$$('.react-grid-item');
    const map = {};
    for (const card of cards) {
      const text = await card.innerText();
      if (text.includes('CIRCUIT SPECS')) map.circuit = card;
      if (text.includes('TELEMETRY')) map.telemetry = card;
      if (text.includes('LAP TIMING')) map.lapTiming = card;
      if (text.includes('LIVE ORDER')) map.liveOrder = card;
      if (text.includes('TEAMMATE BATTLE')) map.teammate = card;
      if (text.includes('RACE SUMMARY')) map.raceSummary = card;
      if (text.includes('LIVE REPLAY') || text.includes('Monaco GP')) map.liveReplay = card;
    }
    return map;
  }

  // --- SHOWCASE: Rapid Layout Customization ---
  let map = await getCardMap();

  // Action 1: Drag Lap Timing Chart
  if (map.lapTiming) {
    console.log("Dragging Lap Timing...");
    await dragAndDrop(map.lapTiming, -300, 100);
  }

  // Action 2: Drag Telemetry
  map = await getCardMap();
  if (map.telemetry) {
    console.log("Dragging Telemetry...");
    await dragAndDrop(map.telemetry, 400, -200);
  }

  // Action 3: Drag Circuit Specs
  map = await getCardMap();
  if (map.circuit) {
    console.log("Dragging Circuit Specs...");
    await dragAndDrop(map.circuit, -200, 300);
  }

  // Action 4: Drag Live Order
  map = await getCardMap();
  if (map.liveOrder) {
    console.log("Dragging Live Order...");
    await dragAndDrop(map.liveOrder, 300, -100);
  }

  // Action 5: Resize Circuit Specs (Make wider)
  map = await getCardMap();
  if (map.circuit) {
    console.log("Resizing Circuit Specs...");
    const handle = await map.circuit.$('.react-resizable-handle');
    if (handle) await resizeCard(map.circuit, handle, 150, 50);
  }

  // Action 6: Drag Teammate Battle
  map = await getCardMap();
  if (map.teammate) {
    console.log("Dragging Teammate...");
    await dragAndDrop(map.teammate, -400, -200);
  }

  // Action 7: Drag Race Summary
  map = await getCardMap();
  if (map.raceSummary) {
    console.log("Dragging Race Summary...");
    await dragAndDrop(map.raceSummary, 300, 200);
  }

  // Action 8: Resize Telemetry (Make taller)
  map = await getCardMap();
  if (map.telemetry) {
    console.log("Resizing Telemetry...");
    const handle = await map.telemetry.$('.react-resizable-handle');
    if (handle) await resizeCard(map.telemetry, handle, 50, 150);
  }

  // Action 9: Drag Live Replay (3D viewport)
  map = await getCardMap();
  if (map.liveReplay) {
    console.log("Dragging Live Replay...");
    // Live replay draggable handle is the title bar area
    const box = await map.liveReplay.boundingBox();
    if (box) {
      // Live replay header is near the top right
      const startX = box.x + box.width - 150;
      const startY = box.y + 20;
      await smoothMove(startX, startY, 15);
      await page.mouse.down();
      await smoothMove(startX - 200, startY + 100, 25);
      await page.mouse.up();
      await page.waitForTimeout(500);
    }
  }

  // Action 10: Toggle Widgets dropdown
  console.log("Opening widgets dropdown...");
  const widgetsBtn = page.locator('button:has-text("Widgets")');
  const btnBox = await widgetsBtn.boundingBox();
  if (btnBox) {
    await smoothMove(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, 15);
    await widgetsBtn.click();
    await page.waitForTimeout(300);

    // Uncheck and check to show rearrangement
    console.log("Removing Teammate Battle...");
    const teammateCheckbox = page.locator('label:has-text("Teammate Battle Chart")');
    const teammateBox = await teammateCheckbox.boundingBox();
    if (teammateBox) {
      await smoothMove(teammateBox.x + 20, teammateBox.y + teammateBox.height / 2, 10);
      await teammateCheckbox.click();
      await page.waitForTimeout(300);
    }

    console.log("Closing dropdown...");
    await smoothMove(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2, 10);
    await widgetsBtn.click();
    await page.waitForTimeout(1000);
  }

  // Action 11: Lock/Unlock Showcase
  map = await getCardMap();
  if (map.circuit) {
    console.log("Locking Circuit Specs...");
    const lockBtn = await map.circuit.$('button[title*="Lock"]');
    if (lockBtn) {
      const lockBox = await lockBtn.boundingBox();
      if (lockBox) {
        await smoothMove(lockBox.x + lockBox.width/2, lockBox.y + lockBox.height/2, 15);
        await lockBtn.click();
        await page.waitForTimeout(800);
      }
    }
  }

  // Move cursor away and wait a bit
  await smoothMove(100, 100, 15);
  await page.waitForTimeout(2000);

  console.log("Closing browser...");
  await context.close();
  await browser.close();
})();
