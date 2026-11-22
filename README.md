# Apex Trust Bank – Scaling Agile Teams Prototype

[![Demo Status](https://img.shields.io/badge/Demo-Simulated%20Bank-orange?style=flat-square)](#)
[![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-black?style=flat-square&logo=next.js)](#)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3ECF8E?style=flat-square&logo=supabase)](#)
[![Vitest](https://img.shields.io/badge/Tests-Vitest%20%2B%20Playwright-yellow?style=flat-square)](#)
[![License](https://img.shields.io/badge/Academic-Agile%20Software%20Development-blue?style=flat-square)](#)

A working full-stack prototype of a fictitious online banking application built for the **Agile Software Development Final Jury**. Features multi-tier role management, atomic money transfers with row locks (`SELECT ... FOR UPDATE`), duplicate submission prevention, and an offline on-screen simulated SMS OTP verification inbox.

> [!IMPORTANT]
> **DEMO & SIMULATION NOTICE**:
> - All bank names, accounts, IFSC codes, phone numbers, and customer profiles in this application are **strictly fictitious simulations**. No real money is transferred and no real SMS is dispatched.
> - An on-screen **"Simulated SMS Inbox"** panel receives and displays all verification OTPs so the demo runs 100% offline without third-party telecom costs or latency.

---

## Quick Setup (Under 10 Steps)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd "banking Application"
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key # Server-side only (for seeding)
```

### 3. Run Database Migrations
In your Supabase dashboard **SQL Editor** (or via Supabase CLI), run the migration files in order:
1. `supabase/migrations/20261122000001_initial_schema.sql` (Tables & signup trigger)
2. `supabase/migrations/20261122000002_rls_policies.sql` (Row Level Security policies)
3. `supabase/migrations/20261122000003_transfer_functions.sql` (Atomic stored procedures)

### 4. Seed Demo Accounts & Test Data
Run the automated seed script to provision demo customers, accounts, beneficiaries, and historical transactions:
```bash
npm run seed
```
*(To wipe and restore a clean state before the jury evaluation at any time, run `npm run seed:reset`)*.

Alternatively, paste `supabase/seed.sql` into the Supabase SQL Editor.

### 5. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Pre-Seeded Demo Credentials

| Role | Name | Email | Password | Pre-loaded Balance | Intended Demo Purpose |
|:---|:---|:---|:---|:---|:---|
| **Customer** | Rahul Sharma | `rahul@demo.bank` | `Demo@12345` | ₹75,000.00 (Savings) + ₹25,000.00 (Current) | Positive transfer, OTP verification, receipt generation |
| **Customer** | Priya Deshmukh | `priya@demo.bank` | `Demo@12345` | ₹500.00 (Savings) + Frozen Current A/C | **Negative test (TC04)**: Insufficient balance rejection |
| **Customer** | Amit Patel | `amit@demo.bank` | `Demo@12345` | ₹1,20,000.00 (Savings) + ₹60,000.00 (Current) | High balance transactions |
| **Admin** | System Administrator | `admin@demo.bank` | `Admin@12345` | N/A (Supervisory view) | Account freezing/unfreezing, audit logs, failed reports |

*(Tip: On the `/login` screen, use the **Jury Quick-Switcher** buttons to log in as any test user with one click).*

---

## Running the Automated Test Suite

### Unit Tests (Vitest)
Executes Zod schema validation tests and amount boundary rules (TC05, TC06, TC10, TC11):
```bash
npm test
```

### End-to-End Tests (Playwright)
Executes automated browser journeys covering login, transfer with simulated OTP, insufficient balance, duplicate submit, and admin role isolation:
```bash
npm run test:e2e
```

---

## Agile Documentation Suite

All Agile artifacts are documented in `/docs`:
- **[Product Backlog](file:///Users/shubhamalapure/Desktop/PROJECTS/banking%20Application/docs/PRODUCT_BACKLOG.md)**: 20 prioritized user stories with MoSCoW rankings and story point estimates.
- **[User Stories & Acceptance Criteria](file:///Users/shubhamalapure/Desktop/PROJECTS/banking%20Application/docs/USER_STORIES.md)**: Detailed Given/When/Then acceptance criteria for all 20 stories.
- **[Sprint Plans](file:///Users/shubhamalapure/Desktop/PROJECTS/banking%20Application/docs/SPRINT_PLAN.md)**: 3 sprints (2 weeks each) with team member task allocations and retrospectives.
- **[Definition of Done](file:///Users/shubhamalapure/Desktop/PROJECTS/banking%20Application/docs/DEFINITION_OF_DONE.md)**: Release checklist for code quality, security, and verification.
- **[Architecture & ERD](file:///Users/shubhamalapure/Desktop/PROJECTS/banking%20Application/docs/ARCHITECTURE.md)**: Mermaid system diagrams, tech justification, ERD, and transfer sequence.
- **[Technical Challenges](file:///Users/shubhamalapure/Desktop/PROJECTS/banking%20Application/docs/CHALLENGES.md)**: Deep dive into solving concurrency, race conditions, idempotency, and RLS.
- **[Test Cases Matrix](file:///Users/shubhamalapure/Desktop/PROJECTS/banking%20Application/docs/TEST_CASES.md)**: Comprehensive matrix for TC01 to TC13.
- **[10-Minute Jury Demo Script](file:///Users/shubhamalapure/Desktop/PROJECTS/banking%20Application/docs/JURY_DEMO_SCRIPT.md)**: Step-by-step presentation guide with exact clicks and accounts.

---

## Core Technical Highlights

1. **Race-Safe Concurrency**: All money movements are executed inside `confirm_transfer` using Postgres `SELECT ... FOR UPDATE` row locks, guaranteeing ACID transactional consistency.
2. **Two-Tier Idempotency**: Forms disable the submission button on first click, and Postgres checks for duplicate client keys or identical submissions within 60 seconds (`DUPLICATE_SUBMISSION`).
3. **3-Layer Defense-in-Depth**: Role restrictions enforced across Postgres RLS policies, Server Actions, and Next.js Edge Middleware.
4. **Simulated OTP Security**: 6-digit OTPs are stored strictly as SHA-256 hashes in `otp_challenges`, have a 5-minute expiry, and lock out after 3 failed attempts.
