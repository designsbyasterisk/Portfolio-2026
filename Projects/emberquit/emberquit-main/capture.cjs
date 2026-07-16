const { chromium } = require('playwright');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const { execSync } = require('child_process');

const PORT = 8085;
const BASE_URL = `http://localhost:${PORT}`;

// Screenshots output directory
const SCREENSHOTS_DIR = path.resolve(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

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

  // Ensure Vite is terminated on exit
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
    console.log('Server is ready! Launching Playwright browser...');

    const browser = await chromium.launch();
    
    // Create context with video recording configuration
    // We set viewport size to larger than the phone frame so we see it centered
    const context = await browser.newContext({
      viewport: { width: 450, height: 920 },
      deviceScaleFactor: 2, // High resolution screenshots!
      recordVideo: {
        dir: path.resolve(__dirname, 'temp_videos'),
        size: { width: 450, height: 920 }
      }
    });

    const page = await context.newPage();

    // Helper to capture a screenshot of the phone frame container
    const captureFrame = async (filename) => {
      // Wait for any animations to settle
      await page.waitForTimeout(600);
      const container = page.locator('.relative.w-\\[393px\\]');
      const outputPath = path.join(SCREENSHOTS_DIR, filename);
      // Take element screenshot
      await container.screenshot({ path: outputPath });
      console.log(`Screenshot saved: ${filename}`);
    };

    console.log('Navigating to welcome page...');
    await page.goto(`${BASE_URL}/welcome`);
    await page.waitForLoadState('networkidle');

    // 1. Welcome Screen
    await captureFrame('01_welcome.png');

    // Click Let's begin
    console.log('Entering onboarding...');
    await page.click('button:has-text("Let\'s begin")');

    // 2. Basics Step
    await captureFrame('02_basics.png');

    // Fill basics
    await page.fill('input[placeholder="e.g. 15"]', '15');
    await page.fill('input[placeholder="e.g. 8"]', '5');
    await page.fill('input[placeholder="e.g. 350"]', '300');
    await page.click('button:has-text("Continue")');

    // 3. Fagerstrom Q1
    await captureFrame('03_fagerstrom_q1.png');

    // Click answers for the 6 Fagerstrom questions
    // Q1
    await page.click('button:has-text("Within 5 minutes")');
    await page.waitForTimeout(350);
    // Q2
    await page.click('button:has-text("Yes")');
    await page.waitForTimeout(350);
    // Q3
    await page.click('button:has-text("The first one in the morning")');
    await page.waitForTimeout(350);
    // Q4
    await page.click('button:has-text("10 or fewer")');
    await page.waitForTimeout(350);
    // Q5
    await page.click('button:has-text("Yes")');
    await page.waitForTimeout(350);
    // Q6
    await page.click('button:has-text("Yes")');
    await page.waitForTimeout(350);

    // Click continue on Fagerstrom step
    await page.click('button:has-text("Continue")');

    // 4. Triggers Step
    await captureFrame('04_triggers.png');
    await page.click('button:has-text("Stress")');
    await page.click('button:has-text("Coffee")');
    await page.click('button:has-text("Social")');
    await page.click('button:has-text("Continue")');

    // 5. Routine Step
    await captureFrame('05_routine.png');
    await page.click('button:has-text("morning")');
    await page.click('button:has-text("Continue")');

    // 6. History Step
    await captureFrame('06_history.png');
    await page.fill('input[type="number"]', '2');
    await page.fill('textarea[placeholder*="e.g. patches"]', 'Tried patches before, they worked for a bit.');
    await page.click('button:has-text("Continue")');

    // 7. Motivation Step
    await captureFrame('07_motivation.png');
    await page.click('button:has-text("Health")');
    await page.click('button:has-text("Money")');
    await page.fill('textarea[placeholder*="So I can play with my kids"]', 'I want to live a long, healthy life for my family and save money.');
    await page.click('button:has-text("Continue")');

    // 8. Summary Step
    await captureFrame('08_summary.png');
    await page.click('button:has-text("Start my journey")');
    await page.waitForTimeout(1000); // Wait for redirect to home

    // 9. Dashboard (Unseeded)
    await captureFrame('09_dashboard_unseeded.png');

    // Go to You (Profile) page to seed data
    console.log('Navigating to You tab...');
    await page.click('a:has-text("You")');
    await captureFrame('10_profile_page_unseeded.png');

    // Click seed data
    console.log('Seeding demo data...');
    await page.click('button:has-text("Seed a week of test data")');
    await page.waitForTimeout(500);

    // Capture seeded profile page
    await captureFrame('11_profile_page_seeded.png');

    // Go back to Home
    console.log('Navigating back to Home tab...');
    await page.click('a:has-text("Home")');
    // Scroll container to top so the cigs meter is fully visible
    await page.locator('.overflow-y-auto').evaluate(el => el.scrollTop = 0);
    await captureFrame('12_dashboard_seeded.png');

    // Open Craving SOS
    console.log('Opening Craving SOS...');
    await page.click('button:has-text("Craving SOS")');
    await captureFrame('13_craving_sos.png');

    // Interact with Craving SOS (click "I beat it" and close)
    await page.click('button:has-text("I beat it")');
    await page.waitForTimeout(400);
    await captureFrame('14_craving_sos_beaten.png');
    await page.click('button:has-text("Close")');
    await page.waitForTimeout(300);

    // Click "I smoked one"
    console.log('Opening Smoked Trigger dialog...');
    await page.click('button:has-text("I smoked one")');
    await captureFrame('15_smoked_trigger.png');
    // Select trigger "Stress"
    await page.click('button:has-text("Stress")');
    await page.waitForTimeout(400);

    // Go to Log tab
    console.log('Navigating to Log tab...');
    await page.click('a:has-text("Log")');
    await captureFrame('16_log_page.png');

    // Go to Insights tab
    console.log('Navigating to Insights tab...');
    await page.click('a:has-text("Insights")');
    await captureFrame('17_insights_daily.png');

    // Switch to Weekly view
    await page.click('button[role="tab"]:has-text("Weekly")');
    await captureFrame('18_insights_weekly.png');

    // Go to Toolkit tab
    console.log('Navigating to Toolkit tab...');
    await page.click('a:has-text("Toolkit")');
    await captureFrame('19_toolkit_page.png');

    // Start breathing exercise
    await page.click('button:has-text("Start")');
    await captureFrame('20_toolkit_breathing.png');
    await page.click('button:has-text("Stop")');
    await page.waitForTimeout(300);

    console.log('Finished capturing screenshots! Closing browser context to finalize video...');
    const video = page.video();
    await context.close();
    await browser.close();

    cleanup();

    if (video) {
      const videoPath = await video.path();
      console.log(`Video recorded to temporary file: ${videoPath}`);
      const outputVideoPath = path.resolve(__dirname, '..', 'usage_recording.mp4');
      console.log(`Converting video to MP4 format using FFmpeg: ${outputVideoPath}...`);
      
      try {
        // Run FFmpeg to transcode to MP4 (h264)
        execSync(`"${ffmpegPath}" -y -i "${videoPath}" -c:v libx264 -pix_fmt yuv420p "${outputVideoPath}"`);
        console.log(`Video successfully saved to: ${outputVideoPath}`);
      } catch (err) {
        console.error('Error during FFmpeg conversion:', err);
      }

      // Cleanup temp video dir
      try {
        fs.rmSync(path.resolve(__dirname, 'temp_videos'), { recursive: true, force: true });
      } catch (e) {}
    }

    console.log('All tasks completed successfully!');
  } catch (err) {
    console.error('Error during script execution:', err);
    cleanup();
    process.exit(1);
  }
}

run();
