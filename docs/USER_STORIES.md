# User Stories & Acceptance Criteria (Given / When / Then)

**Application**: Apex Trust Bank – Scaling Agile Prototype  
**Format**: Gherkin Standard (Given [context], When [action], Then [observable outcome])

---

### US-01: User Registration & Auto-Provisioning
- **Story**: As a new customer, I want to register with my email and strong password so that I receive an auto-provisioned savings account with demo funds.
- **Acceptance Criteria**:
  - **AC-01.1 (Valid Registration)**:
    - *Given* a visitor is on the `/register` page
    - *When* they enter a valid full name, unique email, and a password matching complexity rules (>=8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol)
    - *Then* an auth user is created, a `customer` profile is inserted, and a trigger auto-creates 1 `SAVINGS` account with ₹50,000.00 and redirects to `/dashboard`.
  - **AC-01.2 (Weak Password Rejection)**:
    - *Given* a visitor enters a password without numbers or special symbols
    - *When* they submit the form
    - *Then* client and server Zod validations highlight the requirement checklist and block submission.

---

### US-02: Authentication & Session Persistence
- **Story**: As a customer, I want to sign in securely with session persistence so that my financial account data is protected.
- **Acceptance Criteria**:
  - **AC-02.1**:
    - *Given* a registered user with valid credentials
    - *When* they sign in on `/login`
    - *Then* an authenticated JWT session cookie is established and they are redirected to their designated home (`/dashboard` for customers, `/admin` for admins).
  - **AC-02.2**:
    - *Given* an authenticated user navigates across pages or refreshes the browser
    - *When* pages load
    - *Then* session state persists via `@supabase/ssr` cookies without re-prompting for credentials.

---

### US-03: Dashboard & Account Balances
- **Story**: As a customer, I want to view my account cards with masked numbers and current balances so that I have a clear real-time financial snapshot.
- **Acceptance Criteria**:
  - **AC-03.1**:
    - *Given* an authenticated customer with accounts
    - *When* they navigate to `/dashboard`
    - *Then* they see individual cards for each account with masked number (`•••• •••• 1234`), account type badge (`SAVINGS` or `CURRENT`), status (`ACTIVE` or `FROZEN`), and balance formatted as Indian Rupees (`₹XX,XXX.XX`).
  - **AC-03.2**:
    - *Given* the dashboard loads
    - *When* rendered
    - *Then* a Net Total Balance summary and the 5 most recent transactions are displayed.

---

### US-04: Adding Beneficiaries
- **Story**: As a customer, I want to add a new beneficiary with a 12-digit account number so that I can send funds to verified internal accounts.
- **Acceptance Criteria**:
  - **AC-04.1**:
    - *Given* a customer on `/beneficiaries`
    - *When* they enter a valid nickname, name, 12-digit account number, and bank name
    - *Then* the record is saved to `beneficiaries` and appears in their active payee list.
  - **AC-04.2**:
    - *Given* a customer attempts to add an account number that already exists in their list
    - *When* they click save
    - *Then* the unique constraint `(owner_id, account_number)` prevents insertion and a descriptive toast appears.

---

### US-05: Self-Beneficiary Rejection
- **Story**: As a customer, I want the system to reject adding my own account as a payee so that I don't create circular self-transfers.
- **Acceptance Criteria**:
  - **AC-05.1**:
    - *Given* a customer enters their own savings account number into the beneficiary modal
    - *When* they submit
    - *Then* the form intercepts the input, blocks submission, and displays `"You cannot add your own bank account as a beneficiary."`

---

### US-06: Beneficiary Edit & Deletion
- **Story**: As a customer, I want to edit a beneficiary's nickname or delete a payee with confirmation so that my contact list stays up to date.
- **Acceptance Criteria**:
  - **AC-06.1**:
    - *Given* an existing beneficiary
    - *When* the user edits the nickname
    - *Then* the updated nickname immediately reflects in the UI and transfer dropdowns.
  - **AC-06.2**:
    - *Given* the user clicks delete on a beneficiary
    - *When* a confirmation modal appears and the user confirms
    - *Then* the record is removed from the database and no longer selectable in transfers.

---

### US-07: Multi-Step Fund Transfer Flow
- **Story**: As a customer, I want a multi-step transfer wizard with review and balance checks so that I can prevent erroneous payments before execution.
- **Acceptance Criteria**:
  - **AC-07.1**:
    - *Given* a customer on `/transfer`
    - *When* they fill source account, beneficiary, amount, and remarks
    - *Then* step 1 validates all boundaries (amount >= ₹1.00, <= ₹1,00,000.00, balance >= amount) before transitioning to the Review screen.
  - **AC-07.2**:
    - *Given* a customer on the Review screen
    - *When* they confirm details
    - *Then* `initiate_transfer` stored procedure generates a transaction in `PENDING_OTP` status and transitions to the OTP step.

---

### US-08: Simulated SMS OTP Inbox Panel
- **Story**: As a customer, I want a simulated SMS OTP verification step so that the demo functions seamlessly offline without third-party telecom costs.
- **Acceptance Criteria**:
  - **AC-08.1**:
    - *Given* a transfer is initiated
    - *When* the backend creates an OTP challenge (storing SHA-256 hash in DB)
    - *Then* the plaintext OTP is returned to the client and immediately appears in the on-screen "Simulated SMS Inbox" panel clearly labeled `"Simulated OTP – no SMS is sent"`.
  - **AC-08.2**:
    - *Given* the simulated SMS appears in the panel
    - *When* the user clicks "Copy OTP" or "Auto-Fill"
    - *Then* the code is copied or auto-populated into the 6-digit OTP input box.

---

### US-09: OTP Countdown & 3-Attempt Lockout
- **Story**: As a customer, I want a 5-minute countdown and maximum 3 attempts on OTP entry so that my transaction session is protected against brute force.
- **Acceptance Criteria**:
  - **AC-09.1**:
    - *Given* a pending transfer OTP screen
    - *When* 5 minutes expire without entry
    - *Then* the transaction status is marked `FAILED` with failure reason `OTP_EXPIRED`.
  - **AC-09.2**:
    - *Given* a user enters an incorrect OTP
    - *When* submitted 3 times consecutively
    - *Then* on the 3rd attempt, the transaction is marked `FAILED` with `OTP_ATTEMPTS_EXCEEDED` and verification is locked.

---

### US-10: Atomic Race-Safe Money Transfer
- **Story**: As a customer, I want instant payment execution with transactional row-locking (`SELECT FOR UPDATE`) so that race conditions and double-spending are impossible.
- **Acceptance Criteria**:
  - **AC-10.1**:
    - *Given* a valid OTP is entered for a pending transfer
    - *When* `confirm_transfer` executes
    - *Then* the source account is locked with `FOR UPDATE`, debited, the destination account is credited, transaction status becomes `SUCCESS`, and an audit log is committed atomically in a single Postgres transaction.

---

### US-11: Double-Click Prevention & Idempotency
- **Story**: As a customer, I want double-click prevention and idempotency key enforcement so that network retries never trigger duplicate debits.
- **Acceptance Criteria**:
  - **AC-11.1**:
    - *Given* a user clicks the transfer submit button
    - *When* the first click occurs
    - *Then* the button is immediately disabled and a client UUID idempotency key is submitted.
  - **AC-11.2**:
    - *Given* an identical request is submitted within 60 seconds
    - *When* intercepted by `initiate_transfer`
    - *Then* the stored procedure returns the original transaction or rejects the duplicate with `DUPLICATE_SUBMISSION`.

---

### US-12: Transaction Receipt & Celebration
- **Story**: As a customer, I want a printable and celebratory payment receipt with a unique transaction reference so that I have proof of settlement.
- **Acceptance Criteria**:
  - **AC-12.1**:
    - *Given* a successful transfer
    - *When* the confirmation screen renders
    - *Then* confetti triggers, the unique reference number (e.g. `TXN202611...`) is displayed with exact debit/credit accounts, and a "Print Receipt" button is provided.

---

### US-13: Transaction History Ledger & Filter
- **Story**: As a customer, I want to view my transaction history with status filters and detailed failure reasons so that I understand failed payment triggers.
- **Acceptance Criteria**:
  - **AC-13.1**:
    - *Given* a customer on `/history`
    - *When* filtering by `SUCCESS`, `FAILED`, `PENDING_OTP`, or `CANCELLED`
    - *Then* the table filters rows in real time and displays failure reasons for failed payments (e.g. `INSUFFICIENT_BALANCE: Available balance is ₹500.00`).

---

### US-14: CSV Statement Export
- **Story**: As a customer, I want to export my filtered transactions to a CSV statement so that I can maintain external financial records.
- **Acceptance Criteria**:
  - **AC-14.1**:
    - *Given* a customer with transactions
    - *When* they click "Export CSV Statement"
    - *Then* a formatted `.csv` file downloads containing reference number, ISO date, accounts, amounts, remarks, status, and failure reason.

---

### US-15: Admin Operational Directory
- **Story**: As an administrator, I want to see an audit directory of all customers and accounts so that I can maintain operational oversight.
- **Acceptance Criteria**:
  - **AC-15.1**:
    - *Given* a signed-in user with role `admin`
    - *When* navigating to `/admin`
    - *Then* they can view all customer accounts across the bank, their current balances, and status.

---

### US-16: Admin Account Freeze & Unfreeze
- **Story**: As an administrator, I want to freeze or unfreeze any account instantly so that suspicious accounts cannot execute outward transfers.
- **Acceptance Criteria**:
  - **AC-16.1**:
    - *Given* an admin selects an active account on `/admin`
    - *When* they provide an audit reason and click "Confirm Freeze"
    - *Then* `admin_freeze_account` sets status to `FROZEN`, logs the action in `audit_log`, and any outward transfer from that account is instantly rejected with `ACCOUNT_FROZEN`.
  - **AC-16.2**:
    - *Given* an admin clicks "Unfreeze" on a frozen account
    - *When* confirmed
    - *Then* status returns to `ACTIVE` and outward transfers resume.

---

### US-17: Failed-Transactions Analytics Report
- **Story**: As an administrator, I want a failed-transactions analysis report so that I can diagnose system and user boundary rejections.
- **Acceptance Criteria**:
  - **AC-17.1**:
    - *Given* an admin views the "Failed Transactions Report" tab
    - *When* opened
    - *Then* they see aggregated count metrics, top failure reasons (`INSUFFICIENT_BALANCE`, `OTP_ATTEMPTS_EXCEEDED`, `OTP_EXPIRED`), and an itemized failure audit table.

---

### US-18: 3-Layer Role Guarding & Security Isolation
- **Story**: As a system user, I want strict 3-tier role enforcement (RLS, server checks, route middleware) so that unauthorized access is blocked at the database level.
- **Acceptance Criteria**:
  - **AC-18.1**:
    - *Given* a customer logged in with role `customer`
    - *When* they attempt to query another user's accounts or visit `/admin`
    - *Then* Next.js middleware redirects them back to `/dashboard` with an error message, and Supabase RLS policies return empty sets for non-owned rows.
