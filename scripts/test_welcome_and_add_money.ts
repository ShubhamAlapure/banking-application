import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log('1. Navigating to login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');

  console.log('2. Logging in with rahul@demo.bank...');
  await page.fill('input[type="email"], input[name="email"]', 'rahul@demo.bank');
  await page.fill('input[type="password"], input[name="password"]', 'DemoPassword@123');
  await page.click('button[type="submit"]');

  await page.waitForURL('**/dashboard', { timeout: 15000 });
  console.log('3. Logged in and reached dashboard!');

  // Clear welcome dismissed key to trigger modal
  await page.evaluate(() => {
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('mit_welcome_dismissed_')) localStorage.removeItem(k);
    });
  });
  await page.reload();
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const artifactDir = '/Users/shubhamalapure/.gemini/antigravity/brain/d1148c94-f38f-42c0-9cca-39dcff0f60fb';

  // 1. Check Welcome Modal
  console.log('4. Checking Welcome Modal...');
  const welcomeHeading = page.locator('text=Congratulations');
  await welcomeHeading.waitFor({ state: 'visible', timeout: 5000 });
  await page.screenshot({ path: path.join(artifactDir, 'welcome_modal_congrats.png') });
  console.log('Saved welcome_modal_congrats.png');

  // 2. Click "Add Money to Account" from Welcome Modal
  console.log('5. Clicking Add Money from Welcome Modal...');
  await page.click('button:has-text("Add Money to Account")');
  await page.waitForTimeout(500);

  // 3. Check Add Money Step 1
  console.log('6. Checking Add Money Step 1...');
  await page.waitForSelector('text=Add Money to Primary Account', { state: 'visible' });
  await page.screenshot({ path: path.join(artifactDir, 'add_money_step1.png') });
  console.log('Saved add_money_step1.png');

  // 4. Select +₹2,000 chip and proceed to QR
  console.log('7. Selecting +₹2,000 and proceeding to QR...');
  await page.click('button:has-text("+₹2,000")');
  await page.waitForTimeout(300);
  await page.click('button:has-text("Proceed to UPI QR")');
  await page.waitForTimeout(500);

  // 5. Check QR Popup
  console.log('8. Checking Cropped QR Popup...');
  await page.waitForSelector('text=Scan & Pay via UPI QR', { state: 'visible' });
  await page.screenshot({ path: path.join(artifactDir, 'add_money_qr_popup.png') });
  console.log('Saved add_money_qr_popup.png');

  // 6. Test Cancel button
  console.log('9. Testing Cancel button...');
  await page.click('button:has-text("Cancel")');
  await page.waitForTimeout(300);
  console.log('Returned to amount selection screen.');

  // Proceed back to QR
  await page.click('button:has-text("Proceed to UPI QR")');
  await page.waitForTimeout(500);

  // 7. Click Done (Payment Completed)
  console.log('10. Clicking Done button...');
  await page.click('button:has-text("Done")');
  
  // Wait for success receipt
  await page.waitForSelector('text=Funds Deposited Successfully!', { state: 'visible', timeout: 10000 });
  await page.screenshot({ path: path.join(artifactDir, 'add_money_success.png') });
  console.log('Saved add_money_success.png');

  // 8. Close modal and check dashboard
  console.log('11. Returning to Dashboard...');
  await page.click('button:has-text("Back to Dashboard")');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(artifactDir, 'dashboard_after_add_money.png') });
  console.log('Saved dashboard_after_add_money.png');

  await browser.close();
  console.log('All tests completed successfully!');
}

main().catch((err) => {
  console.error('Playwright Test Failed:', err);
  process.exit(1);
});
