const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function generatePresentation() {
  const portfolioDir = path.join(__dirname, 'portfolio');
  if (!fs.existsSync(portfolioDir)){
      fs.mkdirSync(portfolioDir);
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe' 
  });
  const page = await browser.newPage();
  
  // Set iPhone 15 Viewport
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });

  console.log('Navigating to app dashboard...');
  await page.goto('http://localhost:5173/app/dashboard', { waitUntil: 'networkidle2' });
  console.log('Waiting for map tiles to load...');
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  const dashboardImgPath = path.join(portfolioDir, '1_dashboard.png');
  await page.screenshot({ path: dashboardImgPath });

  console.log('Navigating to SOS List...');
  await page.goto('http://localhost:5173/app/sos', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 1000));
  const sosListImgPath = path.join(portfolioDir, '2_sos_list.png');
  await page.screenshot({ path: sosListImgPath });

  console.log('Navigating to Incident screen...');
  await page.goto('http://localhost:5173/app/sos/UNIT-01', { waitUntil: 'networkidle2' });
  console.log('Waiting for map tiles to load...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  const incidentImgPath = path.join(portfolioDir, '3_incident.png');
  await page.screenshot({ path: incidentImgPath });

  console.log('Navigating to Settings screen...');
  await page.goto('http://localhost:5173/app/settings', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 1000));
  const settingsImgPath = path.join(portfolioDir, '4_settings.png');
  await page.screenshot({ path: settingsImgPath });

  console.log('Closing app page...');
  await page.close();

  console.log('Generating HTML presentation...');
  
  const getBase64 = (filePath) => 'data:image/png;base64,' + fs.readFileSync(filePath).toString('base64');
  
  const imgDash = getBase64(dashboardImgPath);
  const imgSos = getBase64(sosListImgPath);
  const imgInc = getBase64(incidentImgPath);
  const imgSet = getBase64(settingsImgPath);

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    font-family: 'Inter', sans-serif;
    background-color: #0b0d11;
    color: #e2e8f0;
  }
  
  .slide {
    width: 1920px;
    height: 1080px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    display: flex;
    padding: 80px 120px;
    box-sizing: border-box;
    background: radial-gradient(circle at 0% 0%, #151a24 0%, #0b0d11 100%);
  }
  
  /* Grid pattern background for a technical control room vibe */
  .grid-bg {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-size: 50px 50px;
    background-image: 
      linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    z-index: 0;
    pointer-events: none;
  }
  
  .content-left {
    z-index: 1;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding-right: 80px;
  }
  
  .content-right {
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .slide-num {
    font-family: 'JetBrains Mono', monospace;
    color: #ff4f00;
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 4px;
    margin-bottom: 24px;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .slide-num::before {
    content: '';
    display: block;
    width: 40px;
    height: 4px;
    background-color: #ff4f00;
  }

  h1 { font-size: 110px; color: #ffffff; margin: 0 0 20px 0; letter-spacing: -2px; line-height: 1.1; }
  h2 { font-size: 64px; color: #ffffff; margin: 0 0 30px 0; letter-spacing: -1px; line-height: 1.2; }
  h3 { font-size: 32px; color: #94a3b8; margin: 0 0 20px 0; font-weight: 500; }
  p { font-size: 26px; line-height: 1.6; color: #94a3b8; margin: 0 0 30px 0; }
  
  ul { font-size: 26px; line-height: 2; color: #cbd5e1; padding-left: 30px; }
  li { margin-bottom: 16px; }
  li::marker { color: #ff4f00; }
  
  /* Phone Mockup Styling */
  .phone-mockup {
    position: relative;
    width: 420px;
    height: 879px;
    background: #000;
    border-radius: 56px;
    border: 14px solid #2a2f3a;
    box-shadow: 
      inset 0 0 0 4px #1a1e26,
      0 40px 80px -20px rgba(0,0,0,0.8),
      0 0 40px rgba(255, 79, 0, 0.1);
    overflow: hidden;
    transform: rotate(-2deg);
    transition: transform 0.3s ease;
  }
  
  .phone-mockup img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  
  /* Dynamic Island / Notch */
  .phone-notch {
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 30px;
    background-color: #000;
    border-radius: 20px;
    z-index: 10;
  }

  .footer {
    position: absolute;
    bottom: 60px;
    left: 120px;
    right: 120px;
    display: flex;
    justify-content: space-between;
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    color: #475569;
    letter-spacing: 2px;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 30px;
    z-index: 10;
  }
  
  /* Typography block */
  .type-block {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 16px;
    padding: 40px;
    margin-bottom: 30px;
  }
  
  /* Color swatch */
  .color-swatch {
    width: 100%;
    height: 120px;
    border-radius: 12px;
    margin-bottom: 16px;
  }
  
  .color-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30px;
    margin-top: 40px;
  }
  .color-col { text-align: left; }
  .color-hex { font-family: 'JetBrains Mono', monospace; font-size: 20px; color: #fff; font-weight: 700;}
  .color-name { font-size: 16px; color: #94a3b8; margin-top: 8px; }

  /* Feature tags */
  .feature-tag {
    display: inline-block;
    padding: 8px 16px;
    background: rgba(255, 79, 0, 0.1);
    color: #ff4f00;
    border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 20px;
  }
  
  /* For Center aligned slides */
  .slide-center {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 100px 200px;
  }
  .slide-center .content-left {
    padding-right: 0;
    align-items: center;
  }
  .slide-center .slide-num::before { display: none; }
</style>
</head>
<body>

  <!-- Slide 1: Cover -->
  <div class="slide slide-center">
    <div class="grid-bg"></div>
    <div class="content-left">
      <div style="font-family: 'JetBrains Mono', monospace; color: #ff4f00; font-size: 32px; letter-spacing: 8px; margin-bottom: 40px;">MISSION CONTROL UI</div>
      <h1>Restease</h1>
      <p style="font-size: 36px; max-width: 1200px; margin-top: 20px; color: #cbd5e1;">A highly resilient, specialized mobile interface for disaster response tracking and SOS incident dispatch.</p>
    </div>
    <div class="footer"><span>UI/UX PORTFOLIO</span><span>2026</span></div>
  </div>

  <!-- Slide 2: Problem & Solution -->
  <div class="slide">
    <div class="grid-bg"></div>
    <div class="content-left">
      <div class="slide-num">01 / Overview</div>
      <h2>High-Stress Operations Demand Absolute Clarity.</h2>
      <p>During extreme environmental crises, rescue units suffer from cognitive overload, delayed telemetry, and fragmented communication.</p>
      <p><strong>The Solution:</strong> Restease provides a focused, dark-themed command center on mobile devices. It aggregates real-time environmental hazards, GPS telemetry, and SOS vectors into a single, unbreakable UI layout that prioritizes function over form.</p>
    </div>
    <div class="content-right">
      <div class="phone-mockup" style="transform: rotate(2deg);">
        <div class="phone-notch"></div>
        <img src="${imgDash}" alt="Dashboard"/>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>PROBLEM & SOLUTION</span></div>
  </div>

  <!-- Slide 3: Typography -->
  <div class="slide slide-center" style="align-items: flex-start; text-align: left; padding: 80px 120px;">
    <div class="grid-bg"></div>
    <div class="slide-num" style="align-self: flex-start;">02 / Design System</div>
    <h2 style="align-self: flex-start;">Typography & Purpose</h2>
    <div style="display: flex; gap: 60px; width: 100%; margin-top: 40px; text-align: left; z-index: 1;">
      <div class="type-block" style="flex: 1;">
        <div style="font-size: 72px; font-weight: 700; color: #fff; margin-bottom: 20px;">Inter</div>
        <p><strong>Primary Sans-Serif</strong><br><br>Used for high legibility across dense information blocks, primary navigation, and action buttons. The balanced x-height ensures readability even in harsh outdoor lighting.</p>
        <div style="font-size: 48px; color: #475569; font-weight: 400; margin-top: 40px;">Aa Bb Cc Dd Ee Ff</div>
      </div>
      <div class="type-block" style="flex: 1;">
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 64px; font-weight: 700; color: #ff4f00; margin-bottom: 28px;">JetBrains Mono</div>
        <p><strong>Technical Monospace</strong><br><br>Strictly reserved for telemetry data, GPS coordinates, live ETAs, and technical statuses. Monospace styling prevents character shifting and ensures distinct numeral recognition during critical reads.</p>
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 40px; color: #475569; font-weight: 400; margin-top: 40px;">01 23 45 67 89</div>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>TYPOGRAPHY</span></div>
  </div>

  <!-- Slide 4: Colors -->
  <div class="slide slide-center" style="align-items: flex-start; text-align: left; padding: 80px 120px;">
    <div class="grid-bg"></div>
    <div class="slide-num" style="align-self: flex-start;">03 / Design System</div>
    <h2 style="align-self: flex-start;">Color Palette</h2>
    <p style="align-self: flex-start; max-width: 1000px; z-index: 1;">A purpose-built dark theme designed to reduce eye strain in low-light conditions while providing maximum contrast for critical alerts.</p>
    
    <div class="color-grid" style="width: 100%; z-index: 1;">
      <div class="color-col">
        <div class="color-swatch" style="background: #0f1115; border: 1px solid #333;"></div>
        <div class="color-hex">#0F1115</div>
        <div class="color-name">Void Black (App Background)</div>
      </div>
      <div class="color-col">
        <div class="color-swatch" style="background: #1e293b;"></div>
        <div class="color-hex">#1E293B</div>
        <div class="color-name">Slate (Cards & Panels)</div>
      </div>
      <div class="color-col">
        <div class="color-swatch" style="background: #ff4f00;"></div>
        <div class="color-hex">#FF4F00</div>
        <div class="color-name">Alert Orange (SOS & Warnings)</div>
      </div>
      <div class="color-col">
        <div class="color-swatch" style="background: #10b981;"></div>
        <div class="color-hex">#10B981</div>
        <div class="color-name">Safe Green (Active / Nominal)</div>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>COLORS</span></div>
  </div>

  <!-- Slide 5: Dashboard Screen -->
  <div class="slide">
    <div class="grid-bg"></div>
    <div class="content-left">
      <div class="slide-num">04 / Screen Breakdown 1</div>
      <div class="feature-tag">MAP & TELEMETRY</div>
      <h2>Control Dashboard</h2>
      <p>The core view. The map provides real-time geospatial tracking of all units, combining unit telemetry with critical geofencing.</p>
      <ul>
        <li><strong>Environmental Banner:</strong> Live rain rates and computed landslide risk thresholds pinned to the top.</li>
        <li><strong>Visual Geofencing:</strong> Safe zones and danger zones are explicitly rendered.</li>
        <li><strong>Layer Toggles:</strong> Quick toggles to declutter the UI (Paths & Zones) without deep menus.</li>
      </ul>
    </div>
    <div class="content-right">
      <div class="phone-mockup" style="transform: rotate(-3deg);">
        <div class="phone-notch"></div>
        <img src="${imgDash}" alt="Dashboard"/>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>DASHBOARD</span></div>
  </div>

  <!-- Slide 6: SOS List Screen -->
  <div class="slide">
    <div class="grid-bg"></div>
    <div class="content-right" style="justify-content: flex-start; padding-left: 80px;">
      <div class="phone-mockup" style="transform: rotate(3deg);">
        <div class="phone-notch"></div>
        <img src="${imgSos}" alt="SOS List"/>
      </div>
    </div>
    <div class="content-left" style="padding-left: 80px; padding-right: 0;">
      <div class="slide-num">05 / Screen Breakdown 2</div>
      <div class="feature-tag">TRIAGE LOG</div>
      <h2>Active SOS Triage</h2>
      <p>When emergencies happen, the SOS log acts as an un-ignorable queue for dispatchers.</p>
      <ul>
        <li><strong>Time-Elapsed Tracking:</strong> Every SOS card calculates exact time elapsed since trigger.</li>
        <li><strong>Status Highlighting:</strong> Unacknowledged alerts pulse with high-contrast borders.</li>
        <li><strong>Direct Actions:</strong> Immediate access to the incident details from the high-level list view.</li>
      </ul>
    </div>
    <div class="footer"><span>RESTEASE</span><span>SOS LOG</span></div>
  </div>

  <!-- Slide 7: Incident Screen -->
  <div class="slide">
    <div class="grid-bg"></div>
    <div class="content-left">
      <div class="slide-num">06 / Screen Breakdown 3</div>
      <div class="feature-tag">DISPATCH & ROUTING</div>
      <h2>Incident Response</h2>
      <p>A highly focused, drill-down screen providing exact context for a specific distressed unit.</p>
      <ul>
        <li><strong>Precision Coordinates:</strong> Displaying exact lat/long for pinpoint rescue operations.</li>
        <li><strong>Live Dispatch Tracking:</strong> Real-time calculations of the dispatched unit's distance (km) and estimated ETA (mins).</li>
        <li><strong>Unit Context:</strong> Immediate access to the distressed unit's battery life, signal strength, and team roster.</li>
      </ul>
    </div>
    <div class="content-right">
      <div class="phone-mockup" style="transform: rotate(-2deg);">
        <div class="phone-notch"></div>
        <img src="${imgInc}" alt="Incident Screen"/>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>INCIDENT RESPONSE</span></div>
  </div>
  
  <!-- Slide 8: Settings Screen -->
  <div class="slide">
    <div class="grid-bg"></div>
    <div class="content-right" style="justify-content: flex-start; padding-left: 80px;">
      <div class="phone-mockup" style="transform: rotate(2deg);">
        <div class="phone-notch"></div>
        <img src="${imgSet}" alt="Settings"/>
      </div>
    </div>
    <div class="content-left" style="padding-left: 80px; padding-right: 0;">
      <div class="slide-num">07 / Screen Breakdown 4</div>
      <div class="feature-tag">RESILIENCE</div>
      <h2>System Settings</h2>
      <p>System-level controls and resilience configurations for edge environments.</p>
      <ul>
        <li><strong>Theme Engine:</strong> Deep toggles for Light/Dark modes, allowing on-the-fly contrast adjustments based on ambient lighting.</li>
        <li><strong>Sync Status:</strong> Visibility into the offline/online synchronization state, a critical factor for remote missions.</li>
        <li><strong>Data Logs:</strong> Direct export paths for post-mission analysis and debriefing.</li>
      </ul>
    </div>
    <div class="footer"><span>RESTEASE</span><span>SETTINGS</span></div>
  </div>

  <!-- Slide 9: Conclusion -->
  <div class="slide slide-center">
    <div class="grid-bg"></div>
    <div class="content-left">
      <div class="slide-num" style="margin-bottom: 20px;">08 / Conclusion</div>
      <h2 style="font-size: 80px;">Design That Saves Lives.</h2>
      <p style="font-size: 32px; max-width: 1400px; margin-top: 20px; color: #cbd5e1;">Restease proves that functional UI is beautiful UI. By stripping away non-essential elements, employing a strict typographic hierarchy, and integrating intelligent dispatch mechanics natively into the map, we reduce the time from SOS trigger to rescue.</p>
    </div>
    <div class="footer"><span>UI/UX PORTFOLIO</span><span>RESTEASE</span></div>
  </div>

</body>
</html>
  `;

  const htmlPath = path.join(portfolioDir, 'temp-presentation.html');
  fs.writeFileSync(htmlPath, htmlContent);

  console.log('Printing PDF...');
  const pdfPage = await browser.newPage();
  // We don't use viewport size here because PDF rendering uses explicit width/height
  await pdfPage.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  
  const pdfPath = path.join(portfolioDir, 'Restease-UI-Portfolio.pdf');
  await pdfPage.pdf({
    path: pdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();
  fs.unlinkSync(htmlPath);
  
  console.log('Presentation generated successfully at:', pdfPath);
}

generatePresentation().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
