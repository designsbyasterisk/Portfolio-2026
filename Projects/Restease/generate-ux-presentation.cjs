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
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe' 
  });
  
  console.log('Generating HTML presentation...');
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap');
  
  body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; background-color: #0b0d11; color: #e2e8f0; }
  
  .slide {
    width: 1920px; height: 1080px; page-break-after: always; position: relative; overflow: hidden; display: flex;
    padding: 80px 120px; box-sizing: border-box; background: radial-gradient(circle at 0% 0%, #151a24 0%, #0b0d11 100%);
  }
  
  .grid-bg {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-size: 50px 50px;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    z-index: 0; pointer-events: none;
  }
  
  .content-left { z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; padding-right: 80px; }
  
  .slide-num { font-family: 'JetBrains Mono', monospace; color: #ff4f00; font-size: 24px; font-weight: 700; letter-spacing: 4px; margin-bottom: 24px; text-transform: uppercase; display: flex; align-items: center; gap: 12px; }
  .slide-num::before { content: ''; display: block; width: 40px; height: 4px; background-color: #ff4f00; }
  
  h1 { font-size: 110px; color: #ffffff; margin: 0 0 20px 0; letter-spacing: -2px; line-height: 1.1; }
  h2 { font-size: 64px; color: #ffffff; margin: 0 0 30px 0; letter-spacing: -1px; line-height: 1.2; }
  p { font-size: 26px; line-height: 1.6; color: #94a3b8; margin: 0 0 30px 0; }
  
  .footer { position: absolute; bottom: 60px; left: 120px; right: 120px; display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 16px; color: #475569; letter-spacing: 2px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; z-index: 10; }
  
  .slide-center { flex-direction: column; align-items: center; text-align: center; padding: 100px 200px; }
  .slide-center .content-left { padding-right: 0; align-items: center; }
  .slide-center .slide-num::before { display: none; }

  /* Persona Styling */
  .persona-card { background: #1e293b; border: 2px solid #334155; border-radius: 24px; padding: 40px; display: flex; flex-direction: column; height: 100%; }
  .persona-card.primary { border-color: #ff4f00; background: linear-gradient(180deg, #1e293b 0%, rgba(255,79,0,0.05) 100%); }
  .persona-card.secondary { border-color: #10b981; background: linear-gradient(180deg, #1e293b 0%, rgba(16,185,129,0.05) 100%); }
  .persona-header { display: flex; align-items: center; gap: 24px; margin-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 24px; }
  .persona-avatar { width: 80px; height: 80px; border-radius: 50%; background: #334155; display: flex; align-items: center; justify-content: center; font-size: 32px; }
  .persona-title { font-size: 32px; color: #fff; font-weight: 700; margin: 0; }
  .persona-role { font-family: 'JetBrains Mono', monospace; color: #ff4f00; font-size: 16px; letter-spacing: 1px; }
  .persona-secondary-role { font-family: 'JetBrains Mono', monospace; color: #10b981; font-size: 16px; letter-spacing: 1px; }
  .persona-section-title { font-size: 18px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; margin-top: 24px; }
  .persona-text { font-size: 22px; color: #cbd5e1; line-height: 1.6; }

  /* IA Tree Styling */
  .ia-container { display: flex; width: 100%; height: 100%; align-items: flex-start; justify-content: center; gap: 30px; position: relative; z-index: 1; transform: scale(0.85); transform-origin: top center;}
  .ia-col { display: flex; flex-direction: column; gap: 12px; align-items: center; width: 320px; }
  .ia-node { background: #1e293b; border: 2px solid #334155; border-radius: 12px; padding: 16px; color: #fff; font-size: 20px; font-weight: 600; text-align: center; width: 100%; box-shadow: 0 10px 20px rgba(0,0,0,0.2); z-index: 2; position: relative; }
  .ia-node.root { border-color: #3b82f6; background: rgba(59,130,246,0.1); color: #60a5fa; font-size: 24px; padding: 24px; width: 400px; margin-bottom: 40px;}
  .ia-node.level-1 { border-color: #64748b; background: rgba(100,116,139,0.2); }
  .ia-node.level-2 { border-color: #475569; background: transparent; font-size: 16px; font-weight: 400; padding: 12px; text-align: left; }
  .ia-data-list { margin-top: 8px; padding-left: 20px; list-style-type: none; font-size: 14px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }
  .ia-data-list li { margin-bottom: 4px; position: relative; }
  .ia-data-list li::before { content: '↳'; position: absolute; left: -16px; color: #475569; }
  .ia-line-v { width: 2px; height: 30px; background: #334155; margin: -6px 0; z-index: 1; }
  
  /* Horizontal Flowchart Styling */
  .fc-container { display: flex; flex-direction: column; width: 100%; z-index: 1; margin-top: 40px; gap: 40px; align-items: center;}
  .fc-row { display: flex; flex-direction: row; align-items: center; justify-content: center; gap: 15px; position: relative; width: 100%; }
  
  .fc-node { padding: 15px 20px; color: #fff; font-size: 16px; font-weight: 600; text-align: center; position: relative; z-index: 2; width: 200px; min-height: 50px; display: flex; align-items: center; justify-content: center; line-height: 1.4; box-sizing: border-box;}
  .fc-node-text { z-index: 3; }
  
  /* Shapes */
  .shape-user { background: #1e293b; border: 3px solid #3b82f6; border-radius: 12px; box-shadow: 0 0 20px rgba(59,130,246,0.2); }
  .shape-system { background: #1e293b; border: 3px solid #a855f7; border-radius: 0; box-shadow: 0 0 20px rgba(168,85,247,0.2); }
  .shape-decision { 
    background: #1e293b; border: 3px solid #eab308; width: 140px; height: 140px; 
    transform: rotate(45deg); display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 20px rgba(234,179,8,0.2); margin: 0 20px; flex-shrink: 0;
  }
  .shape-decision .fc-node-text { transform: rotate(-45deg); width: 160px; font-size: 14px;}
  .shape-end { background: #1e293b; border: 3px solid #10b981; border-radius: 50px; color: #10b981; }
  .shape-error { background: #1e293b; border: 3px solid #ef4444; border-radius: 50px; color: #ef4444; }
  
  .fc-arrow { color: #475569; font-size: 28px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0;}
  .fc-arrow-right { margin: 0; }
  .fc-arrow-down { margin: -5px 0; transform: rotate(90deg); }
  
  .fc-legend { position: absolute; top: 100px; right: 120px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; }
  .fc-legend-item { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; font-size: 16px; color: #cbd5e1; }
  .fc-legend-box { width: 20px; height: 20px; border: 2px solid; }

</style>
</head>
<body>

  <!-- Slide 1: Cover -->
  <div class="slide slide-center">
    <div class="grid-bg"></div>
    <div class="content-left">
      <div style="font-family: 'JetBrains Mono', monospace; color: #ff4f00; font-size: 32px; letter-spacing: 8px; margin-bottom: 40px;">MISSION CONTROL UX</div>
      <h1>Restease</h1>
      <p style="font-size: 36px; max-width: 1200px; margin-top: 20px; color: #cbd5e1;">Extensive UX Research, Information Architecture, and Interaction Flows for disaster response.</p>
    </div>
    <div class="footer"><span>UX PORTFOLIO</span><span>2026</span></div>
  </div>

  <!-- Slide 2: Design Rationale -->
  <div class="slide">
    <div class="grid-bg"></div>
    <div class="content-left">
      <div class="slide-num">01 / Design Process</div>
      <h2>Designing for High-Stress Environments</h2>
      <p>In crisis scenarios, cognitive load is extremely high and decision-making time is minimal. The system must process complex multidimensional data (telemetry, weather, hardware diagnostics) and present only actionable vectors to the user.</p>
      
      <div style="display: flex; gap: 40px; margin-top: 40px;">
        <div style="flex: 1; background: rgba(255,255,255,0.02); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="color: #ff4f00; font-size: 40px; margin-bottom: 16px;">⊘</div>
          <h3 style="color: #fff; font-size: 24px; margin-bottom: 12px;">Cognitive Load Reduction</h3>
          <p style="font-size: 18px; margin: 0;">Stripping non-essential UI. Using high-contrast color coding against a void background to instantly draw the eye to anomalies and active alerts.</p>
        </div>
        <div style="flex: 1; background: rgba(255,255,255,0.02); padding: 30px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="color: #10b981; font-size: 40px; margin-bottom: 16px;">⚡</div>
          <h3 style="color: #fff; font-size: 24px; margin-bottom: 12px;">Immediate Actionability</h3>
          <p style="font-size: 18px; margin: 0;">Metrics like ETA, distance, and hardware battery are nested directly within context maps and incident cards, eliminating deep menu navigation.</p>
        </div>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>DESIGN RATIONALE</span></div>
  </div>

  <!-- Slide 3: User Personas -->
  <div class="slide">
    <div class="grid-bg"></div>
    <div style="z-index: 1; width: 100%; display: flex; flex-direction: column;">
      <div class="slide-num">02 / User Personas</div>
      <h2 style="margin-bottom: 60px;">Who are we designing for?</h2>
      <div style="display: flex; gap: 60px; height: 600px;">
        <div class="persona-card primary" style="flex: 1;">
          <div class="persona-header">
            <div class="persona-avatar">🎧</div>
            <div>
              <div class="persona-title">Command Dispatcher</div>
              <div class="persona-role">Base Camp Operations</div>
            </div>
          </div>
          <div class="persona-section-title">The Goal</div>
          <p class="persona-text">Maintain a holistic view of all deployed teams, receive distress signals instantly, and dispatch the closest available medical stretcher with zero friction.</p>
          <div class="persona-section-title">User Stories</div>
          <p class="persona-text" style="font-size: 18px; margin-bottom: 12px;">• <strong>As a dispatcher</strong>, I need SOS alerts to override all other UI elements so I don't miss critical events.</p>
          <p class="persona-text" style="font-size: 18px; margin-bottom: 12px;">• <strong>As a dispatcher</strong>, I need the system to auto-calculate the live ETA and distance between rescue units.</p>
        </div>
        <div class="persona-card secondary" style="flex: 1;">
          <div class="persona-header">
            <div class="persona-avatar">🪖</div>
            <div>
              <div class="persona-title">Rajesh K.</div>
              <div class="persona-secondary-role">Team Lead (NDRF Alpha)</div>
            </div>
          </div>
          <div class="persona-section-title">The Goal</div>
          <p class="persona-text">Navigate hazardous terrain safely, pair new hardware (stretchers/sensors) quickly in the field, and trust that telemetry is reaching base even with low connectivity.</p>
          <div class="persona-section-title">User Stories</div>
          <p class="persona-text" style="font-size: 18px; margin-bottom: 12px;">• <strong>As a field responder</strong>, I need an automated way to pair a smart-stretcher via NFC without manual data entry in the rain.</p>
          <p class="persona-text" style="font-size: 18px; margin-bottom: 12px;">• <strong>As a field responder</strong>, I need to see the sync and battery status of my gear at a glance.</p>
        </div>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>USER PERSONAS</span></div>
  </div>

  <!-- Slide 4: IA Extensive -->
  <div class="slide slide-center">
    <div class="grid-bg"></div>
    <div class="slide-num" style="align-self: flex-start; z-index: 2;">03 / Information Architecture</div>
    <h2 style="align-self: flex-start; z-index: 2; margin-bottom: 0px;">System Ontology & Data Map</h2>
    
    <div class="ia-container">
      <div style="display: flex; flex-direction: column; align-items: center; width: 100%;">
        <div class="ia-node root">Restease Global App Shell<br><span style="font-size: 14px; font-weight: 400;">(Context Provider, Auth, Theme State, Sync Engine)</span></div>
        <div class="ia-line-v" style="height: 40px; margin: 0;"></div>
        <div style="width: 80%; height: 2px; background: #334155;"></div>
        
        <div style="display: flex; justify-content: space-between; width: 95%; margin-top: 0;">
          <div class="ia-col">
            <div class="ia-line-v"></div>
            <div class="ia-node level-1">Dashboard (Map)</div>
            <div class="ia-line-v"></div>
            <div class="ia-node level-2">
              <strong>Telemetry Engine (Map Layer)</strong>
              <ul class="ia-data-list">
                <li>Coordinates (Lat/Lng)</li>
                <li>Unit Status (Moving, Static)</li>
                <li>Polylines (Movement Paths)</li>
              </ul>
            </div>
            <div class="ia-line-v"></div>
            <div class="ia-node level-2">
              <strong>Environmental Engine</strong>
              <ul class="ia-data-list">
                <li>Live Rain Rate (mm/h)</li>
                <li>Computed Landslide Risk (%)</li>
                <li>Visual Geofencing (Safe/Danger Zones)</li>
              </ul>
            </div>
          </div>

          <div class="ia-col">
            <div class="ia-line-v"></div>
            <div class="ia-node level-1">SOS Triage (Log)</div>
            <div class="ia-line-v"></div>
            <div class="ia-node level-2" style="border-color: #ff4f00;">
              <strong style="color: #ff4f00;">Active Alerts Queue</strong>
              <ul class="ia-data-list">
                <li>Unit ID & Name</li>
                <li>Live Elapsed Time Counter</li>
                <li>Sector Location</li>
                <li>Acknowledge Action</li>
              </ul>
            </div>
            <div class="ia-line-v"></div>
            <div class="ia-node level-2">
              <strong>Incident Detail View</strong>
              <ul class="ia-data-list">
                <li>Distressed Unit Context (Battery, Team)</li>
                <li>Dispatch Calculations (ETA, Distance)</li>
                <li>Nearest Unit Assignment</li>
              </ul>
            </div>
          </div>

          <div class="ia-col">
            <div class="ia-line-v"></div>
            <div class="ia-node level-1">The Kit (Inventory)</div>
            <div class="ia-line-v"></div>
            <div class="ia-node level-2">
              <strong>Unit Pairing Module</strong>
              <ul class="ia-data-list">
                <li>NFC Scanner State</li>
                <li>Hardware ID Linking</li>
                <li>Success/Error Modals</li>
              </ul>
            </div>
            <div class="ia-line-v"></div>
            <div class="ia-node level-2">
              <strong>Diagnostics & Personnel</strong>
              <ul class="ia-data-list">
                <li>Signal Health (0-4 Bars)</li>
                <li>Battery Warning Thresholds</li>
                <li>Crew Names & Roles</li>
                <li>Radio Channel Assignments</li>
              </ul>
            </div>
          </div>

          <div class="ia-col">
            <div class="ia-line-v"></div>
            <div class="ia-node level-1">System Settings</div>
            <div class="ia-line-v"></div>
            <div class="ia-node level-2">
              <strong>Theme & Appearance</strong>
              <ul class="ia-data-list">
                <li>Light / Dark Mode Toggle</li>
                <li>High Contrast Overrides</li>
              </ul>
            </div>
            <div class="ia-line-v"></div>
            <div class="ia-node level-2">
              <strong>Resilience & Data</strong>
              <ul class="ia-data-list">
                <li>Online / Offline Sync Status</li>
                <li>Export Mission Logs (CSV)</li>
                <li>Diagnostic Resets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>INFORMATION ARCHITECTURE</span></div>
  </div>

  <!-- Slide 5: Horizontal User Flow 1 -->
  <div class="slide">
    <div class="grid-bg"></div>
    <div class="fc-legend">
      <div class="fc-legend-item"><div class="fc-legend-box" style="border-color: #3b82f6; border-radius: 6px;"></div> User Action</div>
      <div class="fc-legend-item"><div class="fc-legend-box" style="border-color: #a855f7; border-radius: 0;"></div> System Action</div>
      <div class="fc-legend-item"><div class="fc-legend-box" style="border-color: #eab308; transform: rotate(45deg);"></div> Decision Point</div>
    </div>
    
    <div style="z-index: 1; width: 100%;">
      <div class="slide-num">04 / Deep Dive User Flow</div>
      <h2>Flow A: Critical SOS Dispatch</h2>
      
      <div class="fc-container">
        
        <!-- Row 1 -->
        <div class="fc-row" style="justify-content: flex-start; padding-left: 50px;">
          <div class="fc-node shape-user"><div class="fc-node-text">1. User monitors Map</div></div>
          <div class="fc-arrow fc-arrow-right">→</div>
          <div class="fc-node shape-system"><div class="fc-node-text">2. Hardware SOS API</div></div>
          <div class="fc-arrow fc-arrow-right">→</div>
          
          <div style="display: flex; flex-direction: column; align-items: center;">
            <div class="shape-decision"><div class="fc-node-text">3. Signal verified?</div></div>
            <div style="display: flex; flex-direction: column; align-items: center; margin-top: 10px;">
              <div class="fc-arrow fc-arrow-down" style="margin-bottom: 5px;">→</div>
              <span style="color: #94a3b8; font-weight: bold; margin-bottom: 10px; font-size: 14px;">[ NO ]</span>
              <div class="fc-node shape-system" style="min-height: 40px; padding: 10px; font-size: 14px;"><div class="fc-node-text">Filter out</div></div>
            </div>
          </div>
          
          <div style="display: flex; align-items: center;">
            <div class="fc-arrow fc-arrow-right">→</div>
            <span style="color: #10b981; font-weight: bold; margin-left: 10px; font-size: 14px;">[ YES ]</span>
          </div>

          <div class="fc-node shape-system" style="border-color: #ff4f00; background: rgba(255,79,0,0.1); margin-left: 10px;"><div class="fc-node-text" style="color: #ff4f00;">4. Alert State (Red UI)</div></div>
          
          <div class="fc-arrow fc-arrow-right">→</div>
          <div class="fc-node shape-user"><div class="fc-node-text">5. Taps SOS Banner</div></div>
        </div>

        <!-- Connection down -->
        <div class="fc-row" style="justify-content: flex-end; padding-right: 50px; margin-top: -30px; margin-bottom: -30px;">
           <div class="fc-arrow fc-arrow-down" style="margin-right: 100px;">→</div>
        </div>

        <!-- Row 2 -->
        <div class="fc-row" style="justify-content: flex-end; padding-right: 50px;">
          <div class="fc-node shape-end"><div class="fc-node-text">8. Vectors drawn on map</div></div>
          <div class="fc-arrow fc-arrow-right" style="transform: rotate(180deg);">→</div>
          <div class="fc-node shape-user"><div class="fc-node-text">7. Taps "Acknowledge"</div></div>
          <div class="fc-arrow fc-arrow-right" style="transform: rotate(180deg);">→</div>
          <div class="fc-node shape-system"><div class="fc-node-text">6. Calc Stretcher ETA</div></div>
        </div>

      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>USER FLOW: SOS RESPONSE</span></div>
  </div>

  <!-- Slide 6: Horizontal User Flow 2 -->
  <div class="slide">
    <div class="grid-bg"></div>
    
    <div style="z-index: 1; width: 100%;">
      <div class="slide-num">05 / Deep Dive User Flow</div>
      <h2>Flow B: Hardware NFC Pairing</h2>
      
      <div class="fc-container">
        
        <!-- Row 1 -->
        <div class="fc-row" style="justify-content: flex-start; padding-left: 50px;">
          <div class="fc-node shape-user"><div class="fc-node-text">1. Selects 'Pair' tab</div></div>
          <div class="fc-arrow fc-arrow-right">→</div>
          <div class="fc-node shape-system"><div class="fc-node-text">2. Activates NFC Scanner</div></div>
          <div class="fc-arrow fc-arrow-right">→</div>
          <div class="fc-node shape-user"><div class="fc-node-text">3. Taps physical stretcher</div></div>
          <div class="fc-arrow fc-arrow-right">→</div>

          <div style="display: flex; flex-direction: column; align-items: center;">
            <div class="shape-decision"><div class="fc-node-text">4. Valid ID?</div></div>
            <div style="display: flex; flex-direction: column; align-items: center; margin-top: 10px;">
              <div class="fc-arrow fc-arrow-down" style="margin-bottom: 5px;">→</div>
              <span style="color: #ef4444; font-weight: bold; margin-bottom: 10px; font-size: 14px;">[ NO ]</span>
              <div class="fc-node shape-error" style="min-height: 40px; padding: 10px; font-size: 14px;"><div class="fc-node-text">Show Error Modal</div></div>
            </div>
          </div>

          <div style="display: flex; align-items: center;">
            <div class="fc-arrow fc-arrow-right">→</div>
            <span style="color: #10b981; font-weight: bold; margin-left: 10px; font-size: 14px;">[ YES ]</span>
          </div>

          <div class="fc-node shape-system" style="margin-left: 10px;"><div class="fc-node-text">5. Link Chipset ID</div></div>
          
          <div class="fc-arrow fc-arrow-right">→</div>
          <div class="fc-node shape-end"><div class="fc-node-text">6. Paired Successfully</div></div>

        </div>
      </div>
    </div>
    <div class="footer"><span>RESTEASE</span><span>USER FLOW: NFC PAIRING</span></div>
  </div>

  <!-- Slide 7: Conclusion -->
  <div class="slide slide-center">
    <div class="grid-bg"></div>
    <div class="content-left">
      <div class="slide-num" style="margin-bottom: 20px;">06 / Summary</div>
      <h2 style="font-size: 80px;">Empathy Through Efficiency.</h2>
      <p style="font-size: 32px; max-width: 1400px; margin-top: 20px; color: #cbd5e1;">By understanding the extreme cognitive demands placed on both field responders and command dispatchers, we've designed workflows that eliminate friction. Deeply mapping the Information Architecture guarantees that every data point—from battery life to GPS paths—has a deliberate, actionable purpose.</p>
    </div>
    <div class="footer"><span>UX PORTFOLIO</span><span>RESTEASE</span></div>
  </div>

</body>
</html>
  `;

  const htmlPath = path.join(portfolioDir, 'temp-ux-presentation.html');
  fs.writeFileSync(htmlPath, htmlContent);

  console.log('Printing PDF...');
  const pdfPage = await browser.newPage();
  await pdfPage.goto('file://' + htmlPath, { waitUntil: 'networkidle0' });
  
  const pdfPath = path.join(portfolioDir, 'Restease-UX-Portfolio.pdf');
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
