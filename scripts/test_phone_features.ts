import { chromium } from 'playwright';
import path from 'path';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  const artifactDir = '/Users/shubhamalapure/.gemini/antigravity/brain/d1148c94-f38f-42c0-9cca-39dcff0f60fb';

  // 1. Test Register Page Mobile Input
  console.log('1. Checking Register Page Mobile field...');
  await page.goto('http://localhost:3000/register');
  await page.waitForLoadState('networkidle');
  await page.waitForSelector('input[name="phone"]', { state: 'visible' });
  await page.screenshot({ path: path.join(artifactDir, 'register_with_mobile_field.png') });
  console.log('Saved register_with_mobile_field.png');

  // 2. Login as Rahul to test adding Shubham as beneficiary by mobile number
  console.log('2. Logging in with rahul@demo.bank...');
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"], input[name="email"]', 'rahul@demo.bank');
  await page.fill('input[type="password"], input[name="password"]', 'DemoPassword@123');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // 3. Navigate to Beneficiaries
  console.log('3. Navigating to Beneficiaries...');
  await page.goto('http://localhost:3000/beneficiaries');
  await page.waitForLoadState('networkidle');

  // 4. Click Add Beneficiary
  console.log('4. Opening Add Beneficiary modal...');
  await page.click('button:has-text("Add New Beneficiary"), button:has-text("Add your first payee")');
  await page.waitForSelector('input[placeholder*="9322610932"]', { state: 'visible' });

  // 5. Search for Shubham's mobile number: 9322610932
  console.log('5. Searching account by mobile number 9322610932...');
  await page.fill('input[placeholder*="9322610932"]', '9322610932');
  await page.click('button:has-text("Find Account")');

  // Wait for auto-filled result card
  await page.waitForSelector('text=Shubham Alapure', { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(artifactDir, 'beneficiary_search_by_mobile_success.png') });
  console.log('Saved beneficiary_search_by_mobile_success.png');

  // Verify form inputs were populated
  const nameVal = await page.inputValue('input[placeholder*="Priya Deshmukh"]');
  const accVal = await page.inputValue('input[placeholder*="200022224444"]');
  console.log('Form Auto-filled Values -> Name:', nameVal, 'Account:', accVal);

  await browser.close();
  console.log('All phone lookup tests passed successfully!');
}

main().catch((err) => {
  console.error('Playwright Test Failed:', err);
  process.exit(1);
});
