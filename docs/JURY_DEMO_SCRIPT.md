# 10-Minute University Jury Live Demo Script

**Project**: Apex Trust Bank – Scaling Agile Teams  
**Theme**: Scaling Agile Practices in High-Integrity Financial Systems  
**Estimated Run Time**: 10 Minutes (Includes Positive, Negative, Boundary & Admin Flows)

---

## Pre-Flight Checklist (1 Minute Before Jury Begins)
1. Ensure the dev server is running:
   ```bash
   npm run dev
   ```
2. Open your browser to `http://localhost:3000`.
3. Notice the visible **"DEMO – SIMULATED BANK"** mandatory header badge.
4. If you wish to restore fresh seed balances, run in a separate terminal:
   ```bash
   npm run seed:reset
   ```

---

## Live Demo Walkthrough

### Part 1: Architecture Introduction & Login Quick-Switcher (Minutes 00:00 – 02:00)
1. **Show Landing Page (`/`)**:
   - Point out the tech stack highlights: Next.js 15 App Router, Supabase Postgres RLS, and Atomic Stored Procedures with row locks (`SELECT ... FOR UPDATE`).
   - Click **"Launch Live Demo"** to navigate to `/login`.
2. **Demonstrate Quick Switcher on `/login`**:
   - Explain to the jury: *"We built a 1-click test credential switcher to inspect different balance conditions and roles in seconds."*
   - Click the button **"Rahul Sharma"** (`rahul@demo.bank`, Balance: ₹75,000.00).
   - Click **"Sign In"**.

---

### Part 2: Customer Dashboard & Beneficiary Management (Minutes 02:00 – 04:00)
1. **Dashboard Overview (`/dashboard`)**:
   - Show Rahul's 2 accounts: SAVINGS (Balance: ₹75,000.00) and CURRENT (Balance: ₹25,000.00).
   - Highlight the masked account numbers (`•••• •••• 2222`), type tags, and formatted INR currency (`₹75,000.00`).
   - Show the Net Total Balance summary: `₹1,00,000.00`.
   - Show the Recent 5 Transactions table with status badges (`SUCCESS`, `FAILED`).
2. **Payee Directory (`/beneficiaries`)**:
   - Click **"Beneficiaries"** in the navigation bar.
   - Show pre-seeded beneficiaries: Priya Deshmukh (`200022224444`) and Amit Patel (`300033336666`).
   - Click **"Add New Beneficiary"**:
     - *Demonstrate Self-Beneficiary Rejection*: Enter Rahul's own account number `100011112222`. Form blocks submission: *"You cannot add your own bank account as a beneficiary."*
     - Enter a fictitious payee: Name `"Dr. Ananya Joshi"`, Nickname `"Ananya Doctor"`, Account `"400044448888"`, Bank `"Demo Bank of Pune"`.
     - Click **"Save Beneficiary"**. Show immediate toast notification and payee card addition.

---

### Part 3: Fund Transfer & Simulated SMS OTP Inbox (Minutes 04:00 – 06:30)
1. **Initiate Transfer (`/transfer`)**:
   - Click **"Transfer Money"**.
   - Select source: `SAVINGS Account (•••• •••• 2222)`.
   - Select payee: `Priya Deshmukh (Priya Savings)`.
   - Enter Amount: `₹5,000.00`.
   - Enter Remarks: `"Project honorarium"`.
   - Click **"Continue to Review"**.
2. **Review Step & Idempotency**:
   - Point out fee transparency: `₹0.00`, remaining balance `₹70,000.00`, and active UUID idempotency key.
   - Click **"Request Simulated OTP"**. Notice button disables immediately to prevent double-clicks.
3. **Simulated SMS Inbox & Verification**:
   - Point out the floating **"Simulated SMS Inbox"** drawer sliding open at bottom-left.
   - Point out the clear simulation badge: *"Simulated OTP – no SMS is sent (Works offline)"*.
   - Point out the 5-minute countdown timer (`04:59...`) and 3-attempt tracker.
   - Click the **"Auto-Fill [OTP]"** button in the notification or copy from the inbox.
   - Click **"Verify & Execute Payment"**.
4. **Receipt & Celebration**:
   - Confetti triggers!
   - Highlight the unique reference number (e.g. `TXN202611...`), settlement timestamp, and debit/credit summaries.
   - Click **"View in History"**. Show that the transaction is committed with status `SUCCESS`.

---

### Part 4: Negative Test Scenarios & Edge Cases (Minutes 06:30 – 08:30)
1. **Insufficient Balance Rejection (TC04)**:
   - Log out of Rahul and sign in as **"Priya Deshmukh"** (`priya@demo.bank`, password `Demo@12345`).
   - Notice Priya's balance is deliberately low: **₹500.00**.
   - Navigate to `/transfer` and attempt to transfer **₹2,000.00** to Rahul.
   - Submit form -> The system blocks it immediately: *"Insufficient balance. Available: ₹500.00, Requested: ₹2,000.00"*.
   - Notice the balance remains safely at ₹500.00.
2. **Invalid Amounts & Boundary Checks (TC06, TC11)**:
   - Try entering `0`, `-10`, `abc`, or `100.555` (3 decimals). Form validation stops input.
   - Enter `0.99` -> rejected: *"Minimum transfer amount is ₹1.00"*.
3. **Wrong OTP 3 Times -> Transaction FAILED (TC08)**:
   - Transfer ₹100.00 from Priya.
   - On OTP screen, deliberately enter wrong code `000000`.
   - Submit 3 times consecutively.
   - On the 3rd attempt, status locks: *"Maximum 3 attempts exceeded. Transaction marked as FAILED"*.
   - Check `/history`: transaction appears in red badge as `FAILED` with failure reason `OTP_ATTEMPTS_EXCEEDED: Incorrect OTP entered 3 times`.
4. **Role Isolation Check (TC09)**:
   - While logged in as Priya (Customer), manually type `/admin` into the browser URL bar.
   - Next.js middleware intercepts the request, redirects to `/dashboard`, and displays: *"Access denied. Administrator privileges are required."*

---

### Part 5: Admin Audit, Account Freezing & Failure Analysis (Minutes 08:30 – 10:00)
1. **Sign in as Admin**:
   - Go to `/login`, click **"Admin Portal"** (`admin@demo.bank`, `Admin@12345`), and sign in.
   - Redirection leads to the dark-themed **Admin Audit & Control Console** (`/admin`).
2. **Account Freezing Controls (TC13)**:
   - Under the **"All Accounts"** tab, locate Priya's CURRENT account or Rahul's CURRENT account.
   - Click **"Freeze Account"**, enter audit note `"Suspicious activity / Jury trial"`, and confirm.
   - Show that the account status changes to `FROZEN` in real time, and an entry is logged in the immutable `audit_log`.
3. **Failed Transactions Analytics Report**:
   - Switch to the **"Failed Transactions Report"** tab.
   - Show the summary breakdown by error code: `INSUFFICIENT_BALANCE`, `OTP_ATTEMPTS_EXCEEDED`, `OTP_EXPIRED`.
   - Point out: *"Every failed attempt is captured with the exact human-friendly reason, giving compliance auditors complete visibility."*
4. **Conclusion**:
   - Summarize how the Agile user stories, test matrix, and strict Postgres concurrency model fulfilled every requirement for the final jury.
   - Invite questions from the jury.
