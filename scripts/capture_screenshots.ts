import { chromium } from '@playwright/test';
import * as path from 'path';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const artifactDir = '/Users/shubhamalapure/.gemini/antigravity/brain/d1148c94-f38f-42c0-9cca-39dcff0f60fb';

  // 1. Capture Homepage Hero
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_home.png') });
  console.log('Captured screenshot_home.png');

  // 2. Scroll into phone section entering (like Image 1)
  await page.evaluate(() => window.scrollTo(0, 350));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'landing_scroll_phone_initial.png') });
  console.log('Captured landing_scroll_phone_initial.png');

  // 3. Scroll down further where phone slides up into view (like Image 2 & 3)
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'landing_scroll_phone_revealed.png') });
  console.log('Captured landing_scroll_phone_revealed.png');

  // 4. Scroll into 'Times change.' section (like Image 4)
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'landing_times_change.png') });
  console.log('Captured landing_times_change.png');

  // 5. Scroll into 'at your fingertips' section (like Image 5)
  await page.evaluate(() => window.scrollTo(0, 2200));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(artifactDir, 'landing_at_fingertips.png') });
  console.log('Captured landing_at_fingertips.png');

  await browser.close();
}

capture().catch((e) => {
  console.error('Screenshot error:', e);
  process.exit(1);
});
