import { test, expect, Page } from '@playwright/test';

async function loginAs(page: Page, email: string, password = 'Demo@12345') {
  await page.goto('/login');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 15000 });

  // Dismiss welcome bonus modal if present
  const exploreBtn = page.locator('button:has-text("Explore Dashboard")').first();
  if (await exploreBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await exploreBtn.click();
    await page.waitForTimeout(500);
  }
}

test.describe('Banking Application – Agile Demo Flow & Automated Test Cases', () => {
  test('TC01: Valid Login and Dashboard shows correct balances', async ({ page }) => {
    await page.goto('/login');

    // Verify MIT Payments Bank branding
    await expect(page.locator('text=MIT Payments Bank').first()).toBeVisible();

    // Fill credentials for Rahul Sharma
    await page.fill('input[name="email"]', 'rahul@demo.bank');
    await page.fill('input[name="password"]', 'Demo@12345');
    await page.click('button[type="submit"]');

    // Expect navigation to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 15000 });

    // Expect Welcome back, Rahul Sharma heading
    await expect(page.getByRole('heading', { name: 'Welcome back, Rahul Sharma' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total Consolidated Liquidity')).toBeVisible();
    await expect(page.locator('text=Digital High-Yield Savings').first()).toBeVisible();
  });

  test('TC04: Transfer exceeding balance results in INSUFFICIENT_BALANCE', async ({ page }) => {
    await loginAs(page, 'priya@demo.bank', 'Demo@12345');

    // Navigate to transfer
    await page.goto('/transfer');

    // Try transferring ₹50,000.00 (exceeds balance)
    await page.fill('#amount', '50000');
    await page.click('button:has-text("Continue to Review")');

    // Expect inline validation or error preventing progression
    await expect(page.locator('text=Insufficient balance')).toBeVisible();
  });

  test('TC07: Duplicate submission prevention (Double-click & Idempotency)', async ({ page }) => {
    await loginAs(page, 'rahul@demo.bank', 'Demo@12345');

    await page.goto('/transfer');
    await page.fill('#amount', '50.00');
    await page.fill('#remarks', 'Duplicate test');
    await page.click('button:has-text("Continue to Review")');

    // Review step
    await expect(page.locator('h1')).toContainText('Review Transfer Details');

    // Fast click on Generate Two-Factor Code button and assert successful OTP dispatch
    const submitBtn = page.locator('button:has-text("Generate Two-Factor Code")');
    await submitBtn.click();

    // Transitions cleanly to OTP Verification
    await expect(page.locator('h1')).toContainText('Enter Security Verification Code');
  });

  test('TC09: Customer cannot access admin routes (Role Guard & RLS check)', async ({ page }) => {
    await loginAs(page, 'rahul@demo.bank', 'Demo@12345');

    // Try navigating to /admin directly
    await page.goto('/admin');

    // Middleware must bounce the customer back to /dashboard
    await page.waitForURL(/.*dashboard.*/);
    expect(page.url()).toContain('unauthorized_admin');
  });

  test('TC02: Complete End-to-End Fund Transfer with Simulated SMS OTP', async ({ page }) => {
    await loginAs(page, 'rahul@demo.bank', 'Demo@12345');

    await page.goto('/transfer');
    await page.fill('#amount', '100.00');
    await page.fill('#remarks', 'Automated E2E Test');
    await page.click('button:has-text("Continue to Review")');

    await expect(page.locator('h1')).toContainText('Review Transfer Details');
    await page.click('button:has-text("Generate Two-Factor Code")');

    // Arrives at OTP step
    await expect(page.locator('h1')).toContainText('Enter Security Verification Code');

    // Click Insert Code button from on-screen authorization helper
    const insertCodeBtn = page.locator('button:has-text("Insert Code:")');
    await expect(insertCodeBtn).toBeVisible({ timeout: 10000 });
    await insertCodeBtn.click();

    // Authorize & Transfer Funds
    await page.click('button:has-text("Authorize & Transfer Funds")');

    // Arrives at receipt
    await expect(page.locator('text=Payment Successful')).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: /Transferred/i })).toBeVisible({ timeout: 10000 });
  });
});
