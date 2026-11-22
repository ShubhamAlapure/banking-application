# Technical Challenges & Engineering Solutions

**Project**: Apex Trust Bank – Scaling Agile Prototype  
**Focus Areas**: Concurrency, Data Integrity, Idempotency, Row Level Security, Offline Reliability

---

### Challenge 1: Concurrency, Double-Spending & Race Conditions
- **Problem**: In concurrent scenarios (e.g. rapid double-clicking, multiple tabs, or distributed requests), two transfer requests might read the account balance simultaneously, both conclude that sufficient funds exist, and debit the account twice, resulting in a negative balance or double spending.
- **Root Cause**: Traditional multi-step application logic (`SELECT balance -> compute new balance in Node.js -> UPDATE balance`) creates a critical race condition between read and write operations.
- **Engineering Solution**:
  - We transitioned all debit and credit logic into an atomic Postgres stored procedure (`confirm_transfer`) executed with `SECURITY DEFINER`.
  - Inside the transaction, we issue `SELECT ... FROM accounts WHERE id = ... FOR UPDATE`. This acquires an exclusive row lock on both the source and destination account rows until the transaction commits or aborts.
  - Balance verification occurs *after* acquiring the row lock. If concurrent requests queue up, the second request reads the freshly updated post-debit balance and is rejected with `INSUFFICIENT_BALANCE`.
  - Database-level check constraint `CHECK (balance >= 0)` guarantees that a balance can never become negative under any circumstance.

---

### Challenge 2: Duplicate Submissions & Network Flakiness
- **Problem**: When a user experiences network latency, they often click "Submit" repeatedly. Alternatively, mobile browsers may retry POST requests automatically on connection drops, risking duplicate transfers.
- **Root Cause**: Lack of client idempotency tokens and time-window deduplication.
- **Engineering Solution**:
  - **Two-Tier Idempotency**:
    1. **Client Tier**: The UI generates a UUID v4 idempotency key upon form load. The submission button is disabled immediately upon the first click (`disabled={submitting}`) to stop repeated user clicks.
    2. **Database Tier**: The `initiate_transfer` function checks the `transactions` table for the provided `idempotency_key`. If the key already exists, it replays the previous transaction result without creating a duplicate.
    3. **60-Second Sliding Window**: If an identical transfer request (same source account, destination account, and amount) is received within 60 seconds with status `PENDING_OTP` or `SUCCESS`, it is flagged as `DUPLICATE_SUBMISSION` and rejected.

---

### Challenge 3: Multi-Tier Role-Based Access Control (RLS & Middleware)
- **Problem**: Relying solely on client-side route guards (e.g. Next.js router checks) allows attackers to bypass UI restrictions using direct API calls or curl to inspect other customers' accounts or perform admin operations.
- **Root Cause**: Decoupled authorization where the UI knows roles, but the database treats all queries with equal permissions.
- **Engineering Solution**:
  - Enforced a **3-Layer Defense-in-Depth Architecture**:
    1. **Database Layer (Supabase RLS)**: RLS is enabled on all tables (`profiles`, `accounts`, `beneficiaries`, `transactions`, `otp_challenges`, `audit_log`). Policies evaluate `auth.uid() = owner_id` or call `public.is_admin()`. Customers attempting to query `SELECT * FROM accounts` receive *only* their own rows, even via direct Supabase API clients.
    2. **Server / RPC Layer**: Transfer stored procedures verify `auth.uid()` directly against the source account owner, rejecting unauthorized execution.
    3. **Edge / Middleware Layer (`src/middleware.ts`)**: Evaluates validated Supabase session cookies and redirects non-admins attempting to access `/admin` back to `/dashboard` with an explicit alert.

---

### Challenge 4: Offline-Capable, Zero-Cost OTP Simulation
- **Problem**: Real-world bank transfers require SMS OTP step-up verification. However, third-party SMS providers (Twilio, AWS SNS) require paid accounts, live internet connectivity, and can suffer SMS delivery delays during a live classroom or jury evaluation.
- **Root Cause**: External telecom infrastructure dependency for what is conceptually a state-machine verification challenge.
- **Engineering Solution**:
  - Created a realistic on-screen **"Simulated SMS Inbox"** drawer component (`SimulatedSmsInbox.tsx`) with clear UI labeling (`"Simulated OTP – no SMS is sent"`).
  - When `initiate_transfer` creates a challenge, it generates a 6-digit random code, stores its **SHA-256 hash** in `otp_challenges`, and returns the plaintext OTP strictly to the calling client session.
  - The client pushes this into a React Context (`DemoContext`), which immediately opens the Simulated SMS Drawer and shows the incoming text message with an "Auto-Fill" and "Copy" button.
  - The database only ever stores the cryptographic hash (`otp_hash`), matching production security practices.
  - The system works 100% offline with zero telecom latency.

---

### Challenge 5: Floating-Point Rounding Errors in Financial Computing
- **Problem**: Using IEEE 754 floating-point numbers in JavaScript (`0.1 + 0.2 = 0.30000000000000004`) leads to fractional cent discrepancies and rounding accumulation errors in banking calculations.
- **Root Cause**: Native JavaScript numbers are 64-bit binary floating-point.
- **Engineering Solution**:
  - Database schema specifies `NUMERIC(14,2)` for all monetary columns (`balance`, `amount`). Postgres handles numeric types using arbitrary-precision decimal representations.
  - Zod schemas validate that amounts have at most 2 decimal places (`val === Number(val.toFixed(2))`).
  - All client display formatting passes through `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
