import { chromium } from 'playwright';
import * as path from 'path';

async function run() {
  const artifactDir = '/Users/shubhamalapure/.gemini/antigravity/brain/d1148c94-f38f-42c0-9cca-39dcff0f60fb';
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();

  console.log('1. Logging in with shubhamalapure55@gmail.com...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"], input[name="email"]', 'shubhamalapure55@gmail.com');
  await page.fill('input[type="password"], input[name="password"]', 'Password@123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.waitForLoadState('networkidle');

  // Dismiss welcome bonus modal explicitly if visible
  console.log('2. Dismissing welcome modal if present...');
  const exploreBtn = page.locator('button:has-text("Explore Dashboard")').first();
  try {
    await exploreBtn.waitFor({ state: 'visible', timeout: 3000 });
    await exploreBtn.click();
    await page.waitForTimeout(600);
  } catch {
    console.log('Welcome modal not open or dismissed.');
  }

  // 1. Check Dashboard Recent Activity
  console.log('3. Checking Dashboard Recent Activity...');
  await page.waitForSelector('text=Recent Activity', { state: 'visible', timeout: 5000 });
  // Scroll down to recent activity
  await page.locator('text=Recent Activity').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_recent_activity_colors.png') });
  console.log('✓ Captured dashboard_recent_activity_colors.png');

  // 2. Navigate to /history
  console.log('4. Navigating to /history...');
  await page.goto('http://localhost:3000/history', { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Transaction History & Status', { state: 'visible', timeout: 8000 });
  await page.waitForTimeout(1000);

  // Take screenshot of History page
  await page.screenshot({ path: path.join(artifactDir, 'transaction_history_names_and_colors.png'), fullPage: false });
  console.log('✓ Captured transaction_history_names_and_colors.png');

  // 3. Test Type Filter: Click CREDIT filter
  console.log('5. Testing CREDIT filter...');
  const creditBtn = page.locator('button:has-text("CREDIT")').first();
  if (await creditBtn.isVisible()) {
    await creditBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'transaction_history_credit_filter.png') });
    console.log('✓ Captured transaction_history_credit_filter.png');
  }

  // 4. Test Type Filter: Click DEBIT filter
  console.log('6. Testing DEBIT filter...');
  const debitBtn = page.locator('button:has-text("DEBIT")').first();
  if (await debitBtn.isVisible()) {
    await debitBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(artifactDir, 'transaction_history_debit_filter.png') });
    console.log('✓ Captured transaction_history_debit_filter.png');
  }

  await browser.close();
  console.log('All verification tasks completed successfully!');
}

run().catch((err) => {
  console.error('Error during verification:', err);
  process.exit(1);
});
