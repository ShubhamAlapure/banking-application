# Sprint Planning & Execution (3 Sprints × 2 Weeks)

**Project**: Apex Trust Bank – Scaling Agile Teams  
**Team Composition (4 Cross-Functional Members)**:
- **Member A**: Full-Stack Lead / Database Specialist (Schema, RLS, Stored Procedures, Next.js architecture)
- **Member B**: Frontend / UI-UX Engineer (Tailwind CSS, Dashboard, Beneficiary modals, Modern Web Guidance compliance)
- **Member C**: Backend & Security Engineer (Auth flows, OTP simulation, Middleware guards, Idempotency)
- **Member D**: QA Lead & Automation Engineer (Vitest unit tests, Playwright E2E suites, Test matrices, CI/CD)

---

## Sprint 1: Foundations, Security Infrastructure & Authentication
- **Duration**: Week 1 – Week 2
- **Sprint Goal**: Deliver a secure, multi-tenant Postgres schema with Row Level Security (RLS), auto-provisioning triggers, and robust session authentication for Customers and Admins.
- **Sprint Backlog**:
  - US-01: User Registration & Auto-Provisioning (5 pts)
  - US-02: Authentication & Session Persistence (3 pts)
  - US-18: 3-Layer Role Guarding & Security Isolation (8 pts)
  - US-19: Reset Demo Data Script (3 pts)
  - US-03: Dashboard Initial View & Balance Cards (5 pts)
- **Team Allocation**:
  - *Member A*: Write SQL migrations `001_initial_schema.sql` and `002_rls_policies.sql`; set up `handle_new_user()` trigger for ₹50,000.00 auto-credit.
  - *Member B*: Design high-contrast layout, Header with mandatory "DEMO – SIMULATED BANK" banner, and accessible forms.
  - *Member C*: Implement Supabase SSR client, server action cookies, and Next.js role protection middleware (`src/middleware.ts`).
  - *Member D*: Author Vitest test harnesses for Zod validation schemas (`tests/unit/validations.test.ts`).
- **Sprint Review Note**:
  - The team demonstrated user registration, automatic creation of savings accounts, and secure login. RLS policies successfully prevented unauthorized queries. Admin vs. Customer middleware guards were demonstrated live.
- **Sprint Retrospective (What went well / What could improve / Action items)**:
  - *Went Well*: Supabase triggers ensured that registration and account creation happened in a single database transaction.
  - *To Improve*: Environment variable coordination between local dev and CI.
  - *Action Item*: Standardized `.env.example` and verified clean fallback error boundaries.

---

## Sprint 2: Core Banking Operations, Atomic Transfers & Simulated OTP
- **Duration**: Week 3 – Week 4
- **Sprint Goal**: Implement race-safe atomic fund transfers using Postgres `SELECT ... FOR UPDATE`, multi-step transfer wizard, and offline-compatible Simulated SMS OTP inbox.
- **Sprint Backlog**:
  - US-04: Adding Beneficiaries (5 pts)
  - US-05: Self-Beneficiary Rejection (3 pts)
  - US-06: Beneficiary Edit & Deletion (3 pts)
  - US-07: Multi-Step Transfer Wizard (8 pts)
  - US-08: Simulated SMS OTP Inbox Panel (8 pts)
  - US-09: OTP Countdown & 3-Attempt Lockout (5 pts)
  - US-10: Atomic Race-Safe Money Transfer (13 pts)
  - US-11: Double-Click Prevention & Idempotency Key (5 pts)
  - US-12: Printable Payment Receipt & Celebration (3 pts)
- **Team Allocation**:
  - *Member A*: Author `initiate_transfer`, `confirm_transfer`, and `cancel_transfer` stored procedures with `SELECT ... FOR UPDATE` row locks, boundary checks (₹1.00 to ₹1,00,000.00), and 60-second duplicate submission rejection.
  - *Member B*: Build responsive 4-step wizard UI (`/transfer`), accessible single-field OTP input conforming to Modern Web Guidance (`sms-otp-form`), and celebratory receipt with confetti.
  - *Member C*: Build floating `SimulatedSmsInbox.tsx` drawer with real-time state, 5-minute countdown timer, and SHA-256 OTP hashing logic.
  - *Member D*: Write Playwright E2E automation for TC02 (valid transfer), TC04 (insufficient balance), and TC07 (duplicate submit prevention).
- **Sprint Review Note**:
  - Completed end-to-end payment demo: transfer initiated -> simulated SMS appeared in on-screen drawer -> OTP entered -> atomic debit and credit reflected immediately without page reload. Double-click prevention and idempotency verified.
- **Sprint Retrospective**:
  - *Went Well*: Postgres stored procedure (`SECURITY DEFINER`) eliminated all client-side race conditions.
  - *To Improve*: Splitting OTP into 6 individual input fields caused focus jumping issues on mobile.
  - *Action Item*: Refactored to a single `<input type="text" inputmode="numeric" autocomplete="one-time-code">` styled with monospace letter spacing as advised by Modern Web Guidance.

---

## Sprint 3: Audit Ledger, Admin Controls, Quality Assurance & Presentation
- **Duration**: Week 5 – Week 6
- **Sprint Goal**: Finalize the Transaction History ledger with CSV export, implement Admin freezing and failure reports, complete full test coverage, and produce all Agile jury documentation.
- **Sprint Backlog**:
  - US-13: Transaction History Ledger & Filters (5 pts)
  - US-14: CSV Statement Export (3 pts)
  - US-15: Admin Operational Directory (5 pts)
  - US-16: Admin Account Freeze & Unfreeze (5 pts)
  - US-17: Failed-Transactions Analytics Report (5 pts)
  - US-20: Pre-Seeded Jury Quick-Switcher (2 pts)
  - Test Automation: TC01 to TC13 automated test harness (6 pts)
- **Team Allocation**:
  - *Member A*: Create `admin_freeze_account` and `admin_unfreeze_account` RPCs; seed varied accounts (low-balance ₹500 for Priya, frozen account, admin account).
  - *Member B*: Build `/history` ledger with status filters, date range pickers, and CSV export. Build `/admin` supervisory dashboard.
  - *Member C*: Integrate jury quick-switcher on `/login`, implement friendly global error boundary (`error.tsx`), and 404 handler (`not-found.tsx`).
  - *Member D*: Execute comprehensive test matrix (TC01 through TC13), finalize `TEST_CASES.md`, write `JURY_DEMO_SCRIPT.md`, and capture demo artifacts.
- **Sprint Review Note**:
  - Full acceptance criteria verified. Admin account freezing successfully prevented customer outward transfers in live test. CSV export generated valid Excel-compatible statements. All automated test cases passed.
- **Sprint Retrospective**:
  - *Went Well*: All 13 mandatory test cases automated or verified cleanly. The simulated SMS inbox allowed testing in zero-connectivity environments.
  - *To Improve*: Visual polish for receipt printing styles.
  - *Action Item*: Applied CSS `@media print` rules for clean single-page receipt printouts.
