const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const { execSync } = require('child_process');

const PORT = 8085;
const BASE_URL = `http://localhost:${PORT}`;
const OUTPUT_VIDEO_PATH = path.resolve(__dirname, '..', 'smoke_log.mp4');

const defaultState = {
  schemaVersion: 1,
  profile: {
    currency: "₹",
    locale: "en-IN",
    narrationTone: "playful",
  },
  cigarettes: [
    { id: '1', ts: Date.now() - 3600000 * 4, trigger: 'coffee' },
    { id: '2', ts: Date.now() - 3600000 * 2, trigger: 'habit' }
  ],
  cravings: [],
  companion: {
    name: "Ember",
    stage: "sprout",
    vitality: 70,
  },
  badges: [],
  xp: 15,
  seenNarrationIds: [],
  onboardedAt: Date.now() - 86400000 * 2,
  assessment: {
    ageRange: "25-34",
    cigsPerDay: 10,
    yearsSmoking: 5,
    pricePerPack: 300,
    cigsPerPack: 20,
    fagerstrom: [2, 0, 1, 0, 0, 0],
    triggers: ["stress", "coffee", "social"],
    hardestTime: "morning",
    pastAttempts: 1,
    motivations: ["health", "money"],
    whySentence: "For my family and to run again.",
    goalMode: "let_app_decide",
  },
  plan: {
    startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    dependenceLevel: "medium",
    fagerstromScore: 3,
    weeks: 10,
    schedule: [10, 10, 9, 9, 8, 8, 7, 7, 6, 6, 5, 5, 4, 4, 3, 3, 2, 2, 1, 1, 0],
    baselineCigsPerDay: 10,
  }
};

function waitForServer(url, timeoutMs = 45000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const interval = setInterval(() => {
      if (Date.now() - start > timeoutMs) {
        clearInterval(interval);
        reject(new Error('Timeout waiting for server to start'));
        return;
      }
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          clearInterval(interval);
          resolve();
        }
      }).on('error', () => {
        // ignore and retry
      });
    }, 500);
  });
}

async function run() {
  console.log('Starting Vite server...');
  const viteProcess = spawn('npx', ['vite', '--port', String(PORT), '--strictPort'], {
    cwd: __dirname,
    shell: true,
    stdio: 'inherit'
  });

  const cleanup = () => {
    try {
      viteProcess.kill();
      console.log('Vite server stopped.');
    } catch (e) {}
  };
  process.on('exit', cleanup);
  process.on('SIGINT', () => { cleanup(); process.exit(1); });
  process.on('SIGTERM', () => { cleanup(); process.exit(1); });

  try {
    console.log(`Waiting for server to be ready at ${BASE_URL}...`);
    await waitForServer(BASE_URL);
    
    // --- 1. WARM UP VITE CACHE ---
    console.log('Warming up Vite compile cache...');
    const warmupBrowser = await chromium.launch();
    const warmupPage = await warmupBrowser.newPage();
    await warmupPage.goto(`${BASE_URL}/welcome`);
    await warmupPage.waitForTimeout(3000);
    await warmupBrowser.close();
    console.log('Cache warmed up.');

    // --- 2. START RECORDING ---
    console.log('Launching browser for recording (393 x 852 viewport)...');
    const browser = await chromium.launch();
    
    const context = await browser.newContext({
      viewport: { width: 393, height: 852 },
      deviceScaleFactor: 2, // retina quality
      recordVideo: {
        dir: path.resolve(__dirname, 'temp_smoke_video'),
        size: { width: 393, height: 852 }
      }
    });

    const page = await context.newPage();

    // Enable console and error logging for debugging
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER ERROR:', err.message));

    // Inject CSS and visual mouse pointer safely after parser is ready
    await page.addInitScript(() => {
      const initPointer = () => {
        if (document.getElementById('playwright-mouse-pointer')) return;

        // 1. Fullscreen styles
        const styleFullscreen = document.createElement('style');
        styleFullscreen.innerHTML = `
          .flex.items-center.justify-center.min-h-screen.bg-slate-950 {
            background-color: transparent !important;
            min-height: 100vh !important;
          }
          .relative.w-\\[393px\\].h-\\[852px\\] {
            width: 100vw !important;
            height: 100vh !important;
            border: none !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            transform: none !important;
          }
        `;
        document.head.appendChild(styleFullscreen);
        
        // 2. Custom mouse pointer element
        const pointer = document.createElement('div');
        pointer.id = 'playwright-mouse-pointer';
        
        const stylePointer = document.createElement('style');
        stylePointer.innerHTML = `
          #playwright-mouse-pointer {
            pointer-events: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 24px;
            height: 24px;
            background: rgba(251, 146, 60, 0.7) !important; /* Ember Orange */
            border: 2px solid rgb(239, 68, 68) !important; /* Red border */
            border-radius: 50% !important;
            margin: -12px 0 0 -12px !important;
            z-index: 999999 !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
            transition: background 0.1s, border-color 0.1s, transform 0.1s;
          }
          #playwright-mouse-pointer.mousedown {
            background: rgba(220, 38, 38, 0.9) !important; /* Deep red on click */
            border-color: rgb(255, 255, 255) !important; /* White border on click */
            transform: scale(0.75) !important;
            box-shadow: 0 0 12px rgba(220, 38, 38, 0.6) !important;
          }
        `;
        document.head.appendChild(stylePointer);
        document.body.appendChild(pointer);

        document.addEventListener('mousemove', event => {
          pointer.style.left = event.clientX + 'px';
          pointer.style.top = event.clientY + 'px';
        }, true);
        document.addEventListener('mousedown', event => {
          pointer.style.left = event.clientX + 'px';
          pointer.style.top = event.clientY + 'px';
          pointer.classList.add('mousedown');
        }, true);
        document.addEventListener('mouseup', event => {
          pointer.style.left = event.clientX + 'px';
          pointer.style.top = event.clientY + 'px';
          pointer.classList.remove('mousedown');
        }, true);
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPointer);
      } else {
        initPointer();
      }
    });

    // Navigate to establish origin, set localStorage
    await page.goto(`${BASE_URL}/`);
    await page.evaluate((state) => {
      localStorage.setItem('ember.state.v1', JSON.stringify(state));
    }, defaultState);

    // Go directly to dashboard
    await page.goto(`${BASE_URL}/home`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Helper to move smoothly to an element and click visually
    const clickElementVisually = async (selector) => {
      const element = page.locator(selector);
      await element.waitFor({ state: 'visible' });
      const box = await element.boundingBox();
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      
      // Move mouse pointer smoothly over 20 steps
      await page.mouse.move(x, y, { steps: 20 });
      await page.waitForTimeout(150);
      
      // Hold click for visual feedback
      await page.mouse.down();
      await page.waitForTimeout(200);
      await page.mouse.up();
      await page.waitForTimeout(200);
    };

    // --- 4-SECOND TIMED SEQUENCE WITH VISUAL CURSOR ---
    console.log('Action: Position cursor at bottom and show dashboard (0.6s)');
    await page.mouse.move(200, 650); // Start cursor near the tab bar area
    await page.waitForTimeout(600);

    console.log('Action: Move and click "I smoked one"');
    await clickElementVisually('button:has-text("I smoked one")');

    console.log('Action: Show Trigger Dialog (0.4s)');
    await page.waitForTimeout(400);

    console.log('Action: Move and click "Stress" trigger');
    await clickElementVisually('button:has-text("Stress")');

    console.log('Action: Show Updated Dashboard and move cursor back (1.2s)');
    await page.waitForTimeout(400);
    await page.mouse.move(200, 650, { steps: 20 }); // Move cursor back down
    await page.waitForTimeout(800);

    console.log('Sequence finished! Closing context to save video...');
    const video = page.video();
    await context.close();
    await browser.close();

    cleanup();

    if (video) {
      const videoPath = await video.path();
      console.log(`Video recorded to: ${videoPath}`);
      console.log(`Transcoding video to MP4 using FFmpeg...`);
      try {
        execSync(`"${ffmpegPath}" -y -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p "${OUTPUT_VIDEO_PATH}"`);
        console.log(`Video successfully saved to: ${OUTPUT_VIDEO_PATH}`);
      } catch (err) {
        console.error('Error during FFmpeg conversion:', err);
      }

      // Cleanup temporary directory
      try {
        fs.rmSync(path.resolve(__dirname, 'temp_smoke_video'), { recursive: true, force: true });
      } catch (e) {}
    }

    console.log('Task completed successfully!');
  } catch (err) {
    console.error('Error during script execution:', err);
    cleanup();
    process.exit(1);
  }
}

run();
