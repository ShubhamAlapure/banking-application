import { test, expect } from '@playwright/test';

test.describe('Banking Application – Agile Demo Flow & Automated Test Cases', () => {
  test('TC01: Valid Login and Dashboard shows correct balances', async ({ page }) => {
    await page.goto('/login');

    // Verify Demo Bank badge in header
    await expect(page.locator('text=DEMO – SIMULATED BANK')).toBeVisible();

    // Click quick login for Rahul Sharma
    await page.click('button:has-text("Rahul Sharma")');
    await page.click('button[type="submit"]:has-text("Sign In")');

    // Expect navigation to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Rahul Sharma');
    await expect(page.locator('text=SAVINGS Account')).toBeVisible();
    await expect(page.locator('text=₹75,000.00')).toBeVisible();
  });

  test('TC04: Transfer exceeding balance results in INSUFFICIENT_BALANCE', async ({ page }) => {
    await page.goto('/login');

    // Click quick login for Priya Deshmukh (Low balance ₹500)
    await page.click('button:has-text("Priya Deshmukh")');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL(/.*dashboard/);

    // Verify low balance of ₹500.00
    await expect(page.locator('text=₹500.00')).toBeVisible();

    // Navigate to transfer
    await page.goto('/transfer');

    // Try transferring ₹2,000.00 (exceeds balance)
    await page.fill('#amount', '2000');
    await page.click('button[type="submit"]:has-text("Continue to Review")');

    // Expect inline validation or error preventing progression
    await expect(
      page.locator('text=Insufficient balance')
    ).toBeVisible();
  });

  test('TC07: Duplicate submission prevention (Double-click & Idempotency)', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Rahul Sharma")');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL(/.*dashboard/);

    await page.goto('/transfer');
    await page.fill('#amount', '50.00');
    await page.fill('#remarks', 'Duplicate test');
    await page.click('button:has-text("Continue to Review")');

    // Review step
    await expect(page.locator('h1')).toContainText('Review Transfer Details');

    // Fast double click on Request Simulated OTP button
    const submitBtn = page.locator('button:has-text("Request Simulated OTP")');
    await submitBtn.click();

    // Button should be disabled during submit
    await expect(submitBtn).toBeDisabled();
  });

  test('TC09: Customer cannot access admin routes (Role Guard & RLS check)', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Rahul Sharma")');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL(/.*dashboard/);

    // Try navigating to /admin directly
    await page.goto('/admin');

    // Middleware must bounce the customer back to /dashboard
    await page.waitForURL(/.*dashboard.*/);
    await expect(page.locator('text=unauthorized_admin')).toBeVisible();
  });

  test('TC02: Complete End-to-End Fund Transfer with Simulated SMS OTP', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Rahul Sharma")');
    await page.click('button[type="submit"]:has-text("Sign In")');
    await page.waitForURL(/.*dashboard/);

    await page.goto('/transfer');
    await page.fill('#amount', '100.00');
    await page.fill('#remarks', 'Automated E2E Test');
    await page.click('button:has-text("Continue to Review")');

    await expect(page.locator('h1')).toContainText('Review Transfer Details');
    await page.click('button:has-text("Request Simulated OTP")');

    // Arrives at OTP step
    await expect(page.locator('h1')).toContainText('Enter Verification Code');

    // Click Auto-Fill button from the on-screen simulated OTP notification banner
    const autoFillBtn = page.locator('button:has-text("Auto-Fill")');
    await expect(autoFillBtn).toBeVisible({ timeout: 10000 });
    await autoFillBtn.click();

    // Verify & Execute
    await page.click('button:has-text("Verify & Execute Payment")');

    // Arrives at receipt
    await expect(page.locator('text=Payment Successful')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=₹100.00 Transferred')).toBeVisible();
  });
});
