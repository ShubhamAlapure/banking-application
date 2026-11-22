# Product Backlog: Banking Application – Scaling Agile Teams

**Project**: Apex Trust Bank – Scaling Agile Prototype  
**Methodology**: Scrum (3 Sprints × 2 Weeks)  
**Estimation**: Modified Fibonacci Story Points (1, 2, 3, 5, 8, 13)  
**Prioritization**: MoSCoW Framework (Must have, Should have, Could have, Won't have for this demo)

---

## Backlog Item Registry

| ID | User Story (Role / Feature / Benefit) | Priority (MoSCoW) | Story Points | Sprint | Status |
|:---|:---|:---:|:---:|:---:|:---:|
| **US-01** | **As a new customer**, I want to register with my email and a strong password so that I receive an auto-provisioned savings account with demo funds. | **Must Have** | 5 | Sprint 1 | Done |
| **US-02** | **As a customer**, I want to sign in securely with session persistence so that my financial account data is protected. | **Must Have** | 3 | Sprint 1 | Done |
| **US-03** | **As a customer**, I want to view my account cards with masked numbers and current balances so that I have a clear real-time financial snapshot. | **Must Have** | 5 | Sprint 1 | Done |
| **US-04** | **As a customer**, I want to add a new beneficiary with a 12-digit account number so that I can send funds to verified internal accounts. | **Must Have** | 5 | Sprint 2 | Done |
| **US-05** | **As a customer**, I want the system to reject adding my own account as a payee so that I don't create circular self-transfers. | **Must Have** | 3 | Sprint 2 | Done |
| **US-06** | **As a customer**, I want to edit a beneficiary's nickname or delete a payee with confirmation so that my contact list stays up to date. | **Should Have** | 3 | Sprint 2 | Done |
| **US-07** | **As a customer**, I want a multi-step transfer wizard with review and balance checks so that I can prevent erroneous payments before execution. | **Must Have** | 8 | Sprint 2 | Done |
| **US-08** | **As a customer**, I want a simulated SMS OTP verification step so that the demo functions seamlessly offline without third-party telecom costs. | **Must Have** | 8 | Sprint 2 | Done |
| **US-09** | **As a customer**, I want a 5-minute countdown and maximum 3 attempts on OTP entry so that my transaction session is protected against brute force. | **Must Have** | 5 | Sprint 2 | Done |
| **US-10** | **As a customer**, I want instant payment execution with transactional row-locking (`SELECT FOR UPDATE`) so that race conditions and double-spending are impossible. | **Must Have** | 13 | Sprint 2 | Done |
| **US-11** | **As a customer**, I want double-click prevention and idempotency key enforcement so that network retries never trigger duplicate debits. | **Must Have** | 5 | Sprint 2 | Done |
| **US-12** | **As a customer**, I want a printable and celebratory payment receipt with a unique transaction reference so that I have proof of settlement. | **Should Have** | 3 | Sprint 2 | Done |
| **US-13** | **As a customer**, I want to view my transaction history with status filters and detailed failure reasons so that I understand failed payment triggers. | **Must Have** | 5 | Sprint 3 | Done |
| **US-14** | **As a customer**, I want to export my filtered transactions to a CSV statement so that I can maintain external financial records. | **Should Have** | 3 | Sprint 3 | Done |
| **US-15** | **As an administrator**, I want to see an audit directory of all customers and accounts so that I can maintain operational oversight. | **Must Have** | 5 | Sprint 3 | Done |
| **US-16** | **As an administrator**, I want to freeze or unfreeze any account instantly so that suspicious accounts cannot execute outward transfers. | **Must Have** | 5 | Sprint 3 | Done |
| **US-17** | **As an administrator**, I want a failed-transactions analysis report so that I can diagnose system and user boundary rejections. | **Must Have** | 5 | Sprint 3 | Done |
| **US-18** | **As a system user**, I want strict 3-tier role enforcement (RLS, server checks, route middleware) so that unauthorized access is blocked at the database level. | **Must Have** | 8 | Sprint 1 | Done |
| **US-19** | **As a developer/jury member**, I want a reset demo data script (`npm run seed:reset`) so that the bank state can be reset before evaluations. | **Should Have** | 3 | Sprint 1 | Done |
| **US-20** | **As a jury member**, I want pre-seeded quick-switcher login buttons so that I can test different balances and roles in seconds. | **Could Have** | 2 | Sprint 3 | Done |

---

## Velocity & Release Metrics
- **Total Backlog Story Points**: 97 points
- **Average Velocity**: ~32 story points per 2-week sprint
- **Sprint 1 (Foundations & Auth)**: 24 points
- **Sprint 2 (Core Banking & Atomic Transfers)**: 42 points
- **Sprint 3 (Admin, History, Polish & QA)**: 31 points
