# Definition of Done (DoD)

**Project**: Apex Trust Bank – Scaling Agile Prototype  
**Audience**: Cross-Functional Agile Development Team & University Jury

A User Story, Bug Fix, or Architectural Task is considered **"DONE"** and eligible for release/demonstration only when all of the following criteria are met:

---

## 1. Code Quality & Standards
- [x] Written in strict **TypeScript** (`noImplicitAny`, zero unchecked type coercions).
- [x] Code strictly formatted and verified through **ESLint** without unsuppressed errors.
- [x] All money calculations represent currency as `NUMERIC(14,2)` in Postgres and formatted using `Intl.NumberFormat('en-IN')` in UI. Floats are **never** used for money logic.
- [x] Conventional Commit format strictly followed (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).

---

## 2. Security & Compliance
- [x] **Zero Secrets in Code**: No API keys, database credentials, or service keys committed to Git. All secrets managed via `.env.local` and mirrored in `.env.example`.
- [x] **Row Level Security (RLS)** enabled on all Supabase Postgres tables with explicit policies for `customer` and `admin`.
- [x] **Multi-Tier Role Guarding**: Role checks enforced at DB RLS, Next.js Middleware (`src/middleware.ts`), and Server Actions.
- [x] **Audit Trail**: All critical operations (transfers, failures, account freezing, OTP challenges) emit an immutable row to `audit_log`.
- [x] **Offline OTP Simulation**: OTPs are never transmitted via actual SMS gateways; simulated on-screen with explicit simulation labels. OTP hashes are stored as SHA-256 in DB, never plaintext.

---

## 3. Architecture & Data Integrity
- [x] Money movement transactions are executed inside atomic Postgres functions (`SECURITY DEFINER`) with `SELECT ... FOR UPDATE` row locks to prevent double-spending and race conditions.
- [x] Idempotency keys enforced on transfer endpoints, with duplicate submission rejection window (60 seconds).
- [x] Clean error handling without leaking SQL queries or internal stack traces to end users.

---

## 4. User Experience & Accessibility
- [x] UI complies with modern web best practices: visible labels, 48px touch targets, `:focus-visible` outlines, single-field monospace OTP input (`inputmode="numeric"`, `autocomplete="one-time-code"`).
- [x] Prominent "DEMO – SIMULATED BANK" banner displayed in header across all screens.
- [x] Real-time toast feedback for all asynchronous operations and errors.
- [x] 404 page and custom React Error Boundary configured.

---

## 5. Testing & Verification
- [x] 100% of Zod validation schemas covered by unit tests (**Vitest**).
- [x] Core user journeys, negative flows (insufficient balance, duplicate submissions), and role-based access control tested via automated end-to-end browser tests (**Playwright**).
- [x] All 13 mandatory test cases (TC01 to TC13) passing and cataloged in `TEST_CASES.md`.
- [x] Demo data seed script verified with clean reset capability (`npm run seed:reset`).

---

## 6. Agile Documentation & Release
- [x] Product Backlog maintained with MoSCoW priorities and Story Points.
- [x] Acceptance criteria written in Gherkin (Given/When/Then) format.
- [x] Sprint plan documented with team task allocations, sprint reviews, and retrospectives.
- [x] Architecture diagrams rendered in valid Mermaid syntax (System Architecture, ER Diagram, Transfer Sequence).
- [x] Step-by-step 10-minute demo script provided for the university jury.
