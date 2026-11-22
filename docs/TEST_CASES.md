# Automated Test Cases Matrix (TC01 to TC13)

**Project**: Apex Trust Bank – Scaling Agile Prototype  
**Harness**: Vitest (Unit & Boundary Validation) + Playwright (End-to-End Browser Journeys)

---

| ID | Test Type | Target Scope | Test Steps | Expected Result | Actual Result | Status |
|:---|:---:|:---|:---|:---|:---|:---:|
| **TC01** | Positive | Auth & Dashboard | 1. Navigate to `/login`<br>2. Sign in as `rahul@demo.bank` (`Demo@12345`)<br>3. Verify redirection to `/dashboard`<br>4. Inspect balance card | Dashboard displays user full name "Rahul Sharma", active SAVINGS account, and balance ₹75,000.00. | Redirected to dashboard; displays Rahul Sharma and ₹75,000.00 balance correctly. | **PASSED** |
| **TC02** | Positive | E2E Fund Transfer | 1. Navigate to `/transfer`<br>2. Select source account & beneficiary<br>3. Enter ₹100.00 and continue to review<br>4. Click "Request Simulated OTP"<br>5. Copy/auto-fill OTP from on-screen inbox<br>6. Click "Verify & Execute" | Transfer succeeds; receipt displays reference number; source account debited by ₹100; ledger records SUCCESS. | Payment completed; confetti animation shown; receipt rendered with reference number. | **PASSED** |
| **TC03** | Positive | Beneficiary Management | 1. Navigate to `/beneficiaries`<br>2. Click "Add New Beneficiary"<br>3. Enter valid name, nickname, 12-digit account number, and bank<br>4. Click save | Payee is saved to `beneficiaries` table and immediately appears in the active payee cards. | Payee card rendered with nickname and masked account; toast confirms creation. | **PASSED** |
| **TC04** | Negative | Overdraft Prevention | 1. Sign in as Priya (`priya@demo.bank`, balance ₹500.00)<br>2. Navigate to `/transfer`<br>3. Attempt transfer of ₹2,000.00<br>4. Submit form | System blocks submission with error `INSUFFICIENT_BALANCE`; account balance remains unchanged at ₹500.00. | Submission blocked with message `"Insufficient balance. Available: ₹500.00, Requested: ₹2,000.00"`. Balances unchanged. | **PASSED** |
| **TC05** | Negative | Account Validation | 1. Enter non-numeric account number (`"1234abcd"`)<br>2. Enter short account number (`"12345"`)<br>3. Enter 13 digits (`"1234567890123"`) | Zod validator flags invalid format: `"Account number must be exactly 12 numeric digits"`. | Zod regex fails on non-numeric, 5-digit, and 13-digit accounts. | **PASSED** |
| **TC06** | Negative | Amount Validation | 1. Enter amount `0`<br>2. Enter negative amount `-50`<br>3. Enter text `"abc"`<br>4. Enter 3 decimals `100.555` | All invalid amounts rejected by Zod schema with specific error messages; form does not proceed. | 0 rejected (must be >0); negative rejected; text rejected; 3 decimals rejected. | **PASSED** |
| **TC07** | Negative | Duplicate Submit / Idempotency | 1. Click "Request Simulated OTP"<br>2. Rapidly double-click submit button<br>3. Attempt replay with same idempotency key | Button is disabled on first click; idempotency key ensures only 1 transaction record is created; duplicate blocked. | Button disabled immediately on click; second submission returns original transaction record. | **PASSED** |
| **TC08** | Negative | OTP Brute Force Protection | 1. Initiate transfer to reach OTP step<br>2. Enter wrong OTP 3 consecutive times<br>3. Observe transaction status | On 3rd failed attempt, transaction is marked `FAILED` with `OTP_ATTEMPTS_EXCEEDED` and verification locks. | Transaction status marked `FAILED`; failure reason set to `"OTP_ATTEMPTS_EXCEEDED: Incorrect OTP entered 3 times."`. | **PASSED** |
| **TC09** | Negative | Role Guard & RLS Isolation | 1. Log in as Customer (`rahul@demo.bank`)<br>2. Directly visit `/admin`<br>3. Query Supabase accounts table for other users | Middleware intercepts `/admin` and redirects to `/dashboard?error=unauthorized_admin`; RLS returns 0 other rows. | Redirected to dashboard with `"Access denied. Administrator privileges are required."`. Supabase RLS isolates data. | **PASSED** |
| **TC10** | Boundary | Exact Balance Transfer | 1. Balance = ₹75,000.00<br>2. Transfer amount = ₹75,000.00 (exact)<br>3. Transfer amount = ₹75,000.01 (balance + 0.01) | Exact balance transfer succeeds resulting in balance ₹0.00; ₹75,000.01 is rejected with `INSUFFICIENT_BALANCE`. | Transfer of exact balance succeeds; transfer of balance + 0.01 blocked by balance check. | **PASSED** |
| **TC11** | Boundary | Min / Max Transfer Limits | 1. Test amount ₹1.00 (min boundary) -> Accept<br>2. Test amount ₹1,00,000.00 (max boundary) -> Accept<br>3. Test amount ₹0.99 -> Reject<br>4. Test amount ₹1,00,000.01 -> Reject | Exactly ₹1.00 and ₹1,00,000.00 succeed; ₹0.99 fails with `INVALID_AMOUNT_MIN`; ₹1,00,000.01 fails with `INVALID_AMOUNT_MAX`. | Boundary tests in Vitest verify ₹1.00 & ₹1,00,000.00 pass; ₹0.99 & ₹1,00,000.01 fail with exact messages. | **PASSED** |
| **TC12** | Boundary | OTP Expiration | 1. Initiate transfer and wait 5 minutes (or simulate `expires_at < now()`)<br>2. Enter otherwise valid OTP | Stored procedure checks `now() > expires_at`, marks transaction `FAILED` with `OTP_EXPIRED`. | Transaction marked `FAILED` with failure reason `"OTP_EXPIRED: The OTP has expired after 5 minutes."`. | **PASSED** |
| **TC13** | Boundary | Frozen Account Lockout | 1. Admin freezes customer account on `/admin`<br>2. Customer attempts outward transfer from frozen account | `initiate_transfer` detects `status = 'FROZEN'`, rejects request with `ACCOUNT_FROZEN` and records failure in history. | UI displays `"Source account is frozen. Outgoing transfers are prohibited."`; RPC rejects with `ACCOUNT_FROZEN`. | **PASSED** |

---

## How to Execute the Automated Test Suite

```bash
# 1. Run Unit Tests (Zod Schemas & Boundary Cases)
npm test

# 2. Run End-to-End Browser Automation (Playwright)
npm run test:e2e
```
