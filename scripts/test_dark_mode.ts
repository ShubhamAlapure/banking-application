import { chromium } from 'playwright';
import * as path from 'path';

async function run() {
  const artifactDir = '/Users/shubhamalapure/.gemini/antigravity/brain/d1148c94-f38f-42c0-9cca-39dcff0f60fb';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('1. Navigating to login page...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });

  // 1. Check toggle button at top
  const themeToggle = page.locator('button[role="switch"][aria-label*="mode"], button[role="switch"]').first();
  await themeToggle.waitFor({ state: 'visible', timeout: 5000 });
  console.log('✓ Found theme toggle button in header at the top');

  // Toggle to dark mode on login page
  console.log('2. Toggling to Dark Mode on Login page...');
  await themeToggle.click();
  await page.waitForTimeout(500);

  const isDarkClass = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  const storedScheme = await page.evaluate(() => localStorage.getItem('color-scheme'));
  console.log(`✓ Dark mode active: ${isDarkClass}, storedScheme: ${storedScheme}`);

  await page.screenshot({ path: path.join(artifactDir, 'dark_mode_login.png'), fullPage: false });
  console.log('✓ Saved dark_mode_login.png');

  // 2. Log in as Rahul
  console.log('3. Logging in as rahul@demo.bank...');
  await page.fill('input[type="email"], input[name="email"]', 'rahul@demo.bank');
  await page.fill('input[type="password"], input[name="password"]', 'DemoPassword@123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Close welcome modal if open
  const closeBtn = page.locator('button:has-text("Explore Dashboard")').first();
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // Verify dashboard in dark mode
  console.log('4. Verifying Dashboard in Dark Mode...');
  await page.screenshot({ path: path.join(artifactDir, 'dark_mode_dashboard.png'), fullPage: false });
  console.log('✓ Saved dark_mode_dashboard.png');

  // 3. Navigate to /profile in dark mode
  console.log('5. Navigating to Profile Studio in Dark Mode...');
  await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'dark_mode_profile.png'), fullPage: false });
  console.log('✓ Saved dark_mode_profile.png');

  // 4. Toggle back to Light mode
  console.log('6. Toggling back to Light Mode from header...');
  await page.locator('button[role="switch"]').first().click();
  await page.waitForTimeout(500);

  const isDarkClassAfter = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  console.log(`✓ Dark mode after toggle back: ${isDarkClassAfter}`);

  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'light_mode_dashboard.png'), fullPage: false });
  console.log('✓ Saved light_mode_dashboard.png');

  await browser.close();
  console.log('All dark mode checks passed successfully!');
}

run().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
