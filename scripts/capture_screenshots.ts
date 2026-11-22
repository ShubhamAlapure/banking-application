import { chromium } from '@playwright/test';
import * as path from 'path';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  const artifactDir = '/Users/shubhamalapure/.gemini/antigravity/brain/d1148c94-f38f-42c0-9cca-39dcff0f60fb';

  // 1. Capture Homepage
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_home.png') });
  console.log('Captured screenshot_home.png');

  // 2. Capture Login
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_login.png') });
  console.log('Captured screenshot_login.png');

  // 3. Log in as Rahul
  await page.fill('#email', 'rahul@demo.bank');
  await page.fill('#password', 'Demo@12345');
  await page.click('button[type="submit"]:has-text("Sign In")');
  await page.waitForURL('**/dashboard');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_dashboard.png') });
  console.log('Captured screenshot_dashboard.png');

  // 4. Capture Transfer Page
  await page.goto('http://localhost:3000/transfer');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_transfer.png') });
  console.log('Captured screenshot_transfer.png');

  // 5. Capture Beneficiaries Page
  await page.goto('http://localhost:3000/beneficiaries');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_beneficiaries.png') });
  console.log('Captured screenshot_beneficiaries.png');

  // 6. Log out & Log in as Admin
  await page.click('button[title="Sign out"]');
  await page.waitForURL('**/login');
  await page.fill('#email', 'admin@demo.bank');
  await page.fill('#password', 'Admin@12345');
  await page.click('button[type="submit"]:has-text("Sign In")');
  await page.waitForURL('**/admin');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: path.join(artifactDir, 'screenshot_admin.png') });
  console.log('Captured screenshot_admin.png');

  await browser.close();
}

capture().catch((e) => {
  console.error('Screenshot error:', e);
  process.exit(1);
});
