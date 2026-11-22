-- Seed Data for Banking Application - Scaling Agile Teams
-- Fictitious demo accounts for university jury presentation

-- Fictitious User UUIDs
-- Admin: 00000000-0000-0000-0000-000000000001
-- Rahul: 00000000-0000-0000-0000-000000000002
-- Priya: 00000000-0000-0000-0000-000000000003
-- Amit:  00000000-0000-0000-0000-000000000004

-- 1. Insert Auth Users into auth.users (if not already existing)
-- Password for admin: Admin@12345
-- Password for customers: Demo@12345

INSERT INTO auth.users (
    id, instance_id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
) VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@demo.bank',
    crypt('Admin@12345', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"System Administrator","role":"admin"}'::jsonb,
    now(), now()
),
(
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rahul@demo.bank',
    crypt('Demo@12345', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Rahul Sharma","role":"customer"}'::jsonb,
    now(), now()
),
(
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'priya@demo.bank',
    crypt('Demo@12345', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Priya Deshmukh","role":"customer"}'::jsonb,
    now(), now()
),
(
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'amit@demo.bank',
    crypt('Demo@12345', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Amit Patel","role":"customer"}'::jsonb,
    now(), now()
)
ON CONFLICT (id) DO UPDATE
SET encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data;

-- 2. Insert Profiles
INSERT INTO public.profiles (id, full_name, role, phone_masked) VALUES
('00000000-0000-0000-0000-000000000001', 'System Administrator', 'admin', '+91 98*** **999'),
('00000000-0000-0000-0000-000000000002', 'Rahul Sharma', 'customer', '+91 98*** **101'),
('00000000-0000-0000-0000-000000000003', 'Priya Deshmukh', 'customer', '+91 98*** **202'),
('00000000-0000-0000-0000-000000000004', 'Amit Patel', 'customer', '+91 98*** **303')
ON CONFLICT (id) DO UPDATE
SET full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;

-- 3. Clean and Insert Accounts
DELETE FROM public.accounts WHERE owner_id IN (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004'
);

-- Account IDs:
-- Rahul Savings: a0000000-0000-0000-0000-000000000001 (balance 75,000.00)
-- Rahul Current: a0000000-0000-0000-0000-000000000002 (balance 25,000.00)
-- Priya Savings: a0000000-0000-0000-0000-000000000003 (balance 500.00 - Low Balance Demo)
-- Priya Current: a0000000-0000-0000-0000-000000000004 (balance 0.00 - Frozen Account Demo)
-- Amit Savings:  a0000000-0000-0000-0000-000000000005 (balance 120,000.00)
-- Amit Current:  a0000000-0000-0000-0000-000000000006 (balance 60,000.00)

INSERT INTO public.accounts (id, owner_id, account_number, account_type, balance, status) VALUES
('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '100011112222', 'SAVINGS', 75000.00, 'ACTIVE'),
('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '100011113333', 'CURRENT', 25000.00, 'ACTIVE'),
('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '200022224444', 'SAVINGS', 500.00, 'ACTIVE'),
('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', '200022225555', 'CURRENT', 0.00, 'FROZEN'),
('a0000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', '300033336666', 'SAVINGS', 120000.00, 'ACTIVE'),
('a0000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', '300033337777', 'CURRENT', 60000.00, 'ACTIVE');

-- 4. Pre-seed Beneficiaries
DELETE FROM public.beneficiaries WHERE owner_id IN (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004'
);

INSERT INTO public.beneficiaries (id, owner_id, nickname, beneficiary_name, account_number, bank_name, status) VALUES
('b0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Priya Savings', 'Priya Deshmukh', '200022224444', 'Demo Bank of Pune', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Amit Business', 'Amit Patel', '300033336666', 'Demo Bank of Mumbai', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Rahul Personal', 'Rahul Sharma', '100011112222', 'Demo Bank of Pune', 'ACTIVE'),
('b0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', 'Rahul College', 'Rahul Sharma', '100011112222', 'Demo Bank of Pune', 'ACTIVE');

-- 5. Pre-seed Historic Transactions (~10 sample records across statuses)
DELETE FROM public.transactions WHERE from_account_id IN (
    'a0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000005'
);

INSERT INTO public.transactions (
    id, from_account_id, to_account_number, to_beneficiary_id,
    amount, remarks, status, failure_reason,
    idempotency_key, reference_no, created_at, completed_at
) VALUES
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    '200022224444',
    'b0000000-0000-0000-0000-000000000001',
    5000.00,
    'Semester book allowance',
    'SUCCESS',
    NULL,
    'idemp-demo-001',
    'TXN20261120100001',
    now() - interval '2 days',
    now() - interval '2 days' + interval '20 seconds'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    '300033336666',
    'b0000000-0000-0000-0000-000000000002',
    12500.00,
    'Laptop shared payment',
    'SUCCESS',
    NULL,
    'idemp-demo-002',
    'TXN20261121110002',
    now() - interval '1 day',
    now() - interval '1 day' + interval '15 seconds'
),
(
    'c0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000003', -- Priya's low balance account
    '100011112222',
    'b0000000-0000-0000-0000-000000000003',
    2000.00,
    'Dinner split',
    'FAILED',
    'INSUFFICIENT_BALANCE: Available balance is ₹500.00 but transfer requires ₹2,000.00',
    'idemp-demo-003',
    'TXN20261121140003',
    now() - interval '18 hours',
    now() - interval '18 hours'
),
(
    'c0000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    '200022224444',
    'b0000000-0000-0000-0000-000000000001',
    1500.00,
    'Project stationery bill',
    'FAILED',
    'OTP_ATTEMPTS_EXCEEDED: Incorrect OTP entered 3 times.',
    'idemp-demo-004',
    'TXN20261121160004',
    now() - interval '12 hours',
    now() - interval '12 hours' + interval '2 minutes'
),
(
    'c0000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000005',
    '100011112222',
    'b0000000-0000-0000-0000-000000000004',
    25000.00,
    'Client retainer advance',
    'SUCCESS',
    NULL,
    'idemp-demo-005',
    'TXN20261122090005',
    now() - interval '5 hours',
    now() - interval '5 hours' + interval '18 seconds'
),
(
    'c0000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000001',
    '200022224444',
    'b0000000-0000-0000-0000-000000000001',
    350.00,
    'Coffee and snacks',
    'CANCELLED',
    'TRANSFER_CANCELLED_BY_USER',
    'idemp-demo-006',
    'TXN20261122100006',
    now() - interval '4 hours',
    now() - interval '4 hours' + interval '1 minute'
),
(
    'c0000000-0000-0000-0000-000000000007',
    'a0000000-0000-0000-0000-000000000002',
    '300033336666',
    NULL,
    10000.00,
    'Office rent portion',
    'SUCCESS',
    NULL,
    'idemp-demo-007',
    'TXN20261122110007',
    now() - interval '3 hours',
    now() - interval '3 hours' + interval '12 seconds'
),
(
    'c0000000-0000-0000-0000-000000000008',
    'a0000000-0000-0000-0000-000000000001',
    '200022224444',
    'b0000000-0000-0000-0000-000000000001',
    800.00,
    'Mobile recharge gift',
    'FAILED',
    'OTP_EXPIRED: The OTP has expired after 5 minutes.',
    'idemp-demo-008',
    'TXN20261122120008',
    now() - interval '2 hours',
    now() - interval '2 hours' + interval '5 minutes'
),
(
    'c0000000-0000-0000-0000-000000000009',
    'a0000000-0000-0000-0000-000000000005',
    '100011112222',
    'b0000000-0000-0000-0000-000000000004',
    15000.00,
    'Equipment reimbursement',
    'SUCCESS',
    NULL,
    'idemp-demo-009',
    'TXN20261122130009',
    now() - interval '1 hour',
    now() - interval '1 hour' + interval '10 seconds'
),
(
    'c0000000-0000-0000-0000-000000000010',
    'a0000000-0000-0000-0000-000000000001',
    '200022224444',
    'b0000000-0000-0000-0000-000000000001',
    2500.00,
    'Exam registration fee',
    'SUCCESS',
    NULL,
    'idemp-demo-010',
    'TXN20261122140010',
    now() - interval '30 minutes',
    now() - interval '30 minutes' + interval '25 seconds'
);

-- 6. Pre-seed Audit Log records
INSERT INTO public.audit_log (user_id, action, details, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'SYSTEM_INIT', '{"version":"1.0.0","environment":"demo"}'::jsonb, now() - interval '3 days'),
('00000000-0000-0000-0000-000000000002', 'TRANSFER_SUCCESS', '{"reference_no":"TXN20261120100001","amount":5000.00}'::jsonb, now() - interval '2 days'),
('00000000-0000-0000-0000-000000000002', 'TRANSFER_SUCCESS', '{"reference_no":"TXN20261121110002","amount":12500.00}'::jsonb, now() - interval '1 day'),
('00000000-0000-0000-0000-000000000003', 'TRANSFER_FAILED', '{"reason":"INSUFFICIENT_BALANCE","amount":2000.00}'::jsonb, now() - interval '18 hours'),
('00000000-0000-0000-0000-000000000001', 'ACCOUNT_FROZEN', '{"account_number":"200022225555","reason":"Demo account freeze testing"}'::jsonb, now() - interval '10 hours');
