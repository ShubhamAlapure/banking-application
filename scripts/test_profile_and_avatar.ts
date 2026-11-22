import { chromium } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const artifactDir = '/Users/shubhamalapure/.gemini/antigravity/brain/d1148c94-f38f-42c0-9cca-39dcff0f60fb';

  // 1. Log in with Rahul
  console.log('1. Logging in with rahul@demo.bank...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"], input[name="email"]', 'rahul@demo.bank');
  await page.fill('input[type="password"], input[name="password"]', 'DemoPassword@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Dismiss welcome modal if open
  const closeBtn = page.locator('button:has-text("Explore Dashboard")');
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 2. Capture Dashboard with Live Avatar & Header
  console.log('2. Verifying Dashboard with Live Avatar...');
  await page.waitForSelector('img[alt="Rahul Sharma"], img[alt*="Avatar"], img[alt="Profile"]', { state: 'visible' });
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_with_avatar.png') });
  console.log('Saved dashboard_with_avatar.png');

  // 3. Navigate to /profile via the avatar or button
  console.log('3. Navigating to /profile...');
  await page.goto('http://localhost:3000/profile');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text=Personal Details', { state: 'visible' });
  await page.screenshot({ path: path.join(artifactDir, 'profile_studio_page.png') });
  console.log('Saved profile_studio_page.png');

  // 4. Test updating profile name and daily limit
  console.log('4. Testing profile updates and saving...');
  await page.fill('input[placeholder="Shubham Alapure"]', 'Rahul Sharma Senior');
  await page.click('button:has-text("Save All Profile Changes")');
  await page.waitForSelector('text=Profile and account preferences updated successfully!', { state: 'visible', timeout: 10000 });
  await page.screenshot({ path: path.join(artifactDir, 'profile_save_success.png') });
  console.log('Saved profile_save_success.png');

  // 5. Navigate back to dashboard and verify updated name & avatar
  console.log('5. Verifying dashboard reflect updated profile live...');
  await page.goto('http://localhost:3000/dashboard');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('text=Rahul Sharma Senior', { state: 'visible', timeout: 5000 });
  console.log('Dashboard verified with updated name Rahul Sharma Senior!');

  // Reset back to original name for consistency
  await page.goto('http://localhost:3000/profile');
  await page.waitForLoadState('networkidle');
  await page.fill('input[placeholder="Shubham Alapure"]', 'Rahul Sharma');
  await page.click('button:has-text("Save All Profile Changes")');
  await page.waitForSelector('text=Profile and account preferences updated successfully!', { state: 'visible' });
  console.log('Reset back to Rahul Sharma.');

  await browser.close();
  console.log('All profile studio & avatar tests completed successfully!');
}

main().catch((err) => {
  console.error('Profile Playwright Test Failed:', err);
  process.exit(1);
});
