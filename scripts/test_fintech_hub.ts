import { chromium } from 'playwright';
import * as path from 'path';

async function run() {
  const artifactDir = '/Users/shubhamalapure/.gemini/antigravity/brain/d1148c94-f38f-42c0-9cca-39dcff0f60fb';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  console.log('1. Logging in with rahul@demo.bank...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', 'rahul@demo.bank');
  await page.fill('input[type="password"], input[name="password"]', 'DemoPassword@123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Dismiss welcome bonus modal if open
  const closeBtn = page.locator('button:has-text("Explore Dashboard")').first();
  if (await closeBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  console.log('2. Verifying full Fintech Hub on Dashboard...');
  await page.waitForSelector('text=Bills & recharges', { state: 'visible' });
  await page.waitForSelector('text=Credit cards & loans', { state: 'visible' });
  await page.waitForSelector('text=Offers & rewards', { state: 'visible' });

  // 1. Capture Full Dashboard in Light Mode
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_fintech_hub_full.png'), fullPage: false });
  console.log('✓ Saved dashboard_fintech_hub_full.png');

  // 2. Open Mobile Recharge Modal
  console.log('3. Testing Mobile Recharge Modal...');
  await page.click('button:has-text("Mobile")');
  await page.waitForSelector('text=Popular Unlimited Plans', { state: 'visible' });
  await page.screenshot({ path: path.join(artifactDir, 'service_modal_recharge.png') });
  console.log('✓ Saved service_modal_recharge.png');
  await page.click('button:has-text("Done"), button:has(svg.lucide-x)').catch(() => page.keyboard.press('Escape'));
  await page.waitForTimeout(400);

  // 3. Open CIBIL Score Modal
  console.log('4. Testing CIBIL Score Modal...');
  await page.click('button:has-text("CIBIL score")');
  await page.waitForSelector('text=EXCELLENT', { state: 'visible' });
  await page.screenshot({ path: path.join(artifactDir, 'service_modal_cibil.png') });
  console.log('✓ Saved service_modal_cibil.png');
  await page.click('button:has-text("Close Report")');
  await page.waitForTimeout(400);

  // 4. Open Rewards Modal
  console.log('5. Testing Rewards & Scratch Card Modal...');
  await page.click('button:has-text("Rewards")');
  await page.waitForSelector('text=Lucky Scratch Card', { state: 'visible' });
  // Tap scratch card
  await page.click('text=Tap to Scratch');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'service_modal_rewards.png') });
  console.log('✓ Saved service_modal_rewards.png');
  await page.click('button:has(svg.lucide-x)');
  await page.waitForTimeout(400);

  // 5. Switch to Dark Mode to verify styling
  console.log('6. Verifying Fintech Hub in Dark Mode...');
  const themeToggle = page.locator('button[role="switch"]').first();
  await themeToggle.click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_dark_mode_hub.png'), fullPage: false });
  console.log('✓ Saved dashboard_dark_mode_hub.png');

  await browser.close();
  console.log('All Fintech Hub verification checks passed successfully!');
}

run().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
