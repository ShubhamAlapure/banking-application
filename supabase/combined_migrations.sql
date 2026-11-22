-- Migration 001: Initial Schema
-- Banking Application - Scaling Agile Teams

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('customer', 'admin')) DEFAULT 'customer',
    phone_masked TEXT NOT NULL DEFAULT '+91 98*** **123',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Accounts table (fictitious 12-digit account number, numeric balance)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    account_number TEXT UNIQUE NOT NULL CHECK (length(account_number) = 12 AND account_number ~ '^[0-9]{12}$'),
    account_type TEXT NOT NULL CHECK (account_type IN ('SAVINGS', 'CURRENT')) DEFAULT 'SAVINGS',
    balance NUMERIC(14,2) NOT NULL DEFAULT 50000.00 CHECK (balance >= 0),
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'FROZEN')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Beneficiaries table
CREATE TABLE IF NOT EXISTS public.beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL,
    beneficiary_name TEXT NOT NULL,
    account_number TEXT NOT NULL CHECK (length(account_number) = 12 AND account_number ~ '^[0-9]{12}$'),
    bank_name TEXT NOT NULL DEFAULT 'Demo Bank of Pune',
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE')) DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_owner_beneficiary_account UNIQUE (owner_id, account_number)
);

-- 4. Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
    to_account_number TEXT NOT NULL,
    to_beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE SET NULL,
    amount NUMERIC(14,2) NOT NULL CHECK (amount > 0),
    remarks TEXT,
    status TEXT NOT NULL CHECK (status IN ('PENDING_OTP', 'SUCCESS', 'FAILED', 'CANCELLED')) DEFAULT 'PENDING_OTP',
    failure_reason TEXT,
    idempotency_key TEXT UNIQUE NOT NULL,
    reference_no TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- 5. OTP Challenges table
CREATE TABLE IF NOT EXISTS public.otp_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    otp_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '5 minutes'),
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    consumed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Audit Log table
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_owner ON public.accounts(owner_id);
CREATE INDEX IF NOT EXISTS idx_accounts_number ON public.accounts(account_number);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_owner ON public.beneficiaries(owner_id);
CREATE INDEX IF NOT EXISTS idx_transactions_from_acc ON public.transactions(from_account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_to_acc ON public.transactions(to_account_number);
CREATE INDEX IF NOT EXISTS idx_transactions_ref ON public.transactions(reference_no);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_challenges_txn ON public.otp_challenges(transaction_id);

-- Function and trigger to auto-create profile and savings account on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_acc_num TEXT;
    user_role TEXT;
    user_full_name TEXT;
BEGIN
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'customer');
    user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

    -- Create profile
    INSERT INTO public.profiles (id, full_name, role, phone_masked)
    VALUES (
        new.id,
        user_full_name,
        user_role,
        '+91 98*** **' || lpad(floor(random() * 900 + 100)::text, 3, '0')
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        role = EXCLUDED.role;

    -- If customer, auto-generate 1 SAVINGS account with 50,000.00 balance
    IF user_role = 'customer' THEN
        -- Generate random 12 digit number starting with 4000
        new_acc_num := '4000' || lpad(floor(random() * 100000000)::text, 8, '0');
        
        -- In case of unlikely collision, re-roll
        WHILE EXISTS (SELECT 1 FROM public.accounts WHERE account_number = new_acc_num) LOOP
            new_acc_num := '4000' || lpad(floor(random() * 100000000)::text, 8, '0');
        END LOOP;

        INSERT INTO public.accounts (owner_id, account_number, account_type, balance, status)
        VALUES (new.id, new_acc_num, 'SAVINGS', 50000.00, 'ACTIVE');

        INSERT INTO public.audit_log (user_id, action, details)
        VALUES (new.id, 'ACCOUNT_CREATED', jsonb_build_object(
            'account_number', new_acc_num,
            'account_type', 'SAVINGS',
            'initial_balance', 50000.00
        ));
    END IF;

    RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Migration 002: Row Level Security Policies
-- Banking Application - Scaling Agile Teams

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an admin without recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Helper function to check if the caller owns an account
CREATE OR REPLACE FUNCTION public.is_account_owner(acc_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.accounts
        WHERE id = acc_id AND owner_id = auth.uid()
    );
$$;

---------------------------------------------------------
-- PROFILES POLICIES
---------------------------------------------------------
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id OR public.is_admin())
    WITH CHECK (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
CREATE POLICY "profiles_insert_policy" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id OR public.is_admin() OR auth.role() = 'service_role');

---------------------------------------------------------
-- ACCOUNTS POLICIES
---------------------------------------------------------
DROP POLICY IF EXISTS "accounts_select_policy" ON public.accounts;
CREATE POLICY "accounts_select_policy" ON public.accounts
    FOR SELECT
    USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "accounts_admin_update_policy" ON public.accounts;
CREATE POLICY "accounts_admin_update_policy" ON public.accounts
    FOR UPDATE
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "accounts_service_role_all" ON public.accounts;
CREATE POLICY "accounts_service_role_all" ON public.accounts
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

---------------------------------------------------------
-- BENEFICIARIES POLICIES
---------------------------------------------------------
DROP POLICY IF EXISTS "beneficiaries_select_policy" ON public.beneficiaries;
CREATE POLICY "beneficiaries_select_policy" ON public.beneficiaries
    FOR SELECT
    USING (owner_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "beneficiaries_insert_policy" ON public.beneficiaries;
CREATE POLICY "beneficiaries_insert_policy" ON public.beneficiaries
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "beneficiaries_update_policy" ON public.beneficiaries;
CREATE POLICY "beneficiaries_update_policy" ON public.beneficiaries
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "beneficiaries_delete_policy" ON public.beneficiaries;
CREATE POLICY "beneficiaries_delete_policy" ON public.beneficiaries
    FOR DELETE
    USING (owner_id = auth.uid());

---------------------------------------------------------
-- TRANSACTIONS POLICIES
---------------------------------------------------------
DROP POLICY IF EXISTS "transactions_select_policy" ON public.transactions;
CREATE POLICY "transactions_select_policy" ON public.transactions
    FOR SELECT
    USING (
        public.is_admin() OR
        public.is_account_owner(from_account_id) OR
        to_account_number IN (SELECT account_number FROM public.accounts WHERE owner_id = auth.uid())
    );

DROP POLICY IF EXISTS "transactions_service_role_all" ON public.transactions;
CREATE POLICY "transactions_service_role_all" ON public.transactions
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

---------------------------------------------------------
-- OTP CHALLENGES POLICIES
---------------------------------------------------------
DROP POLICY IF EXISTS "otp_challenges_select_policy" ON public.otp_challenges;
CREATE POLICY "otp_challenges_select_policy" ON public.otp_challenges
    FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "otp_challenges_service_role_all" ON public.otp_challenges;
CREATE POLICY "otp_challenges_service_role_all" ON public.otp_challenges
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

---------------------------------------------------------
-- AUDIT LOG POLICIES
---------------------------------------------------------
DROP POLICY IF EXISTS "audit_log_select_policy" ON public.audit_log;
CREATE POLICY "audit_log_select_policy" ON public.audit_log
    FOR SELECT
    USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "audit_log_service_role_all" ON public.audit_log;
CREATE POLICY "audit_log_service_role_all" ON public.audit_log
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
-- Migration 003: Atomic Transfer Functions & Stored Procedures
-- Banking Application - Scaling Agile Teams

-- 1. Function to initiate a fund transfer
CREATE OR REPLACE FUNCTION public.initiate_transfer(
    p_from_account_id UUID,
    p_to_account_number TEXT,
    p_amount NUMERIC(14,2),
    p_remarks TEXT DEFAULT '',
    p_idempotency_key TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_from_account RECORD;
    v_to_account RECORD;
    v_beneficiary RECORD;
    v_existing_txn RECORD;
    v_recent_txn RECORD;
    v_daily_total NUMERIC(14,2);
    v_ref_no TEXT;
    v_txn_id UUID;
    v_otp_code TEXT;
    v_otp_hash TEXT;
    v_expires_at TIMESTAMPTZ;
    v_clean_key TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_REQUIRED: User must be authenticated to initiate transfers';
    END IF;

    -- Ensure idempotency key
    v_clean_key := NULLIF(TRIM(p_idempotency_key), '');
    IF v_clean_key IS NULL THEN
        v_clean_key := gen_random_uuid()::text;
    END IF;

    -- 1. Idempotency Check: if exact idempotency key exists, return original transaction
    SELECT * INTO v_existing_txn
    FROM public.transactions
    WHERE idempotency_key = v_clean_key;

    IF FOUND THEN
        -- If already exists, return the existing transaction data
        RETURN jsonb_build_object(
            'success', true,
            'is_duplicate_replay', true,
            'transaction_id', v_existing_txn.id,
            'reference_no', v_existing_txn.reference_no,
            'status', v_existing_txn.status,
            'amount', v_existing_txn.amount,
            'remarks', v_existing_txn.remarks,
            'created_at', v_existing_txn.created_at,
            'message', 'Retrieved existing transaction for this idempotency key.'
        );
    END IF;

    -- Generate reference number: TXN + YYYYMMDD + 6 random digits
    v_ref_no := 'TXN' || to_char(now(), 'YYYYMMDD') || lpad(floor(random() * 1000000)::text, 6, '0');

    -- 2. Boundary Check: Amount validations
    IF p_amount IS NULL OR p_amount <= 0 THEN
        -- Record failed transaction
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, COALESCE(p_amount, 0), p_remarks,
            'FAILED', 'INVALID_AMOUNT: Amount must be greater than zero.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_AMOUNT',
            'message', 'Transfer amount must be greater than 0.'
        );
    END IF;

    IF p_amount != round(p_amount, 2) THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, p_amount, p_remarks,
            'FAILED', 'INVALID_AMOUNT_PRECISION: Amount cannot have more than 2 decimal places.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_AMOUNT',
            'message', 'Transfer amount cannot have more than 2 decimal places.'
        );
    END IF;

    IF p_amount < 1.00 THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, p_amount, p_remarks,
            'FAILED', 'INVALID_AMOUNT_MIN: Minimum transfer amount is ₹1.00.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_AMOUNT',
            'message', 'Minimum transfer amount is ₹1.00.'
        );
    END IF;

    IF p_amount > 100000.00 THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, p_amount, p_remarks,
            'FAILED', 'INVALID_AMOUNT_MAX: Maximum transfer amount per transaction is ₹1,00,000.00.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_AMOUNT',
            'message', 'Maximum transfer amount per transaction is ₹1,00,000.00.'
        );
    END IF;

    -- 3. Source Account Validation: must belong to caller and be ACTIVE
    SELECT * INTO v_from_account
    FROM public.accounts
    WHERE id = p_from_account_id AND owner_id = v_user_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'SOURCE_ACCOUNT_INVALID',
            'message', 'Source account not found or does not belong to you.'
        );
    END IF;

    IF v_from_account.status = 'FROZEN' THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, p_amount, p_remarks,
            'FAILED', 'ACCOUNT_FROZEN: Source account is frozen. Transactions are disabled.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'ACCOUNT_FROZEN',
            'message', 'Your account is frozen. Outward transfers are disabled. Contact support.'
        );
    END IF;

    -- 4. Duplicate Submission Window Check: reject identical request (same from, to, amount) within 60s
    SELECT * INTO v_recent_txn
    FROM public.transactions
    WHERE from_account_id = p_from_account_id
      AND to_account_number = p_to_account_number
      AND amount = p_amount
      AND status IN ('PENDING_OTP', 'SUCCESS')
      AND created_at > (now() - interval '60 seconds');

    IF FOUND THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, p_amount, p_remarks,
            'FAILED', 'DUPLICATE_SUBMISSION: An identical transfer was initiated within the last 60 seconds.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'DUPLICATE_SUBMISSION',
            'message', 'Duplicate submission detected: an identical transfer was initiated within the last 60 seconds. Please wait before retrying.'
        );
    END IF;

    -- 5. Destination Account Validation: destination must exist in the system and not be same as source
    IF v_from_account.account_number = p_to_account_number THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, p_amount, p_remarks,
            'FAILED', 'SELF_TRANSFER_INVALID: Source and destination accounts cannot be identical.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'SELF_TRANSFER_INVALID',
            'message', 'Source and destination accounts cannot be identical.'
        );
    END IF;

    SELECT * INTO v_to_account
    FROM public.accounts
    WHERE account_number = p_to_account_number;

    IF NOT FOUND THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, p_amount, p_remarks,
            'FAILED', 'DESTINATION_ACCOUNT_NOT_FOUND: Destination account number does not exist.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'DESTINATION_ACCOUNT_NOT_FOUND',
            'message', 'Destination account does not exist in the system.'
        );
    END IF;

    -- 6. Beneficiary Check: Destination must be in caller's saved beneficiaries
    SELECT * INTO v_beneficiary
    FROM public.beneficiaries
    WHERE owner_id = v_user_id AND account_number = p_to_account_number AND status = 'ACTIVE';

    IF NOT FOUND THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, p_amount, p_remarks,
            'FAILED', 'BENEFICIARY_NOT_FOUND: Destination account is not in your registered beneficiaries.', v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'BENEFICIARY_NOT_FOUND',
            'message', 'Destination account must be added to your beneficiaries before initiating a transfer.'
        );
    END IF;

    -- 7. Balance Check: Sufficient funds
    IF v_from_account.balance < p_amount THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, to_beneficiary_id, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, v_beneficiary.id, p_amount, p_remarks,
            'FAILED', 'INSUFFICIENT_BALANCE: Available balance is ₹' || v_from_account.balance || ' but transfer requires ₹' || p_amount,
            v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INSUFFICIENT_BALANCE',
            'available_balance', v_from_account.balance,
            'message', 'Insufficient balance. Available: ₹' || to_char(v_from_account.balance, 'FM999,999,990.00') || ', Requested: ₹' || to_char(p_amount, 'FM999,999,990.00')
        );
    END IF;

    -- 8. Daily Transfer Limit Check: max 200,000.00 per customer in 24 hours
    SELECT COALESCE(SUM(t.amount), 0) INTO v_daily_total
    FROM public.transactions t
    JOIN public.accounts a ON t.from_account_id = a.id
    WHERE a.owner_id = v_user_id
      AND t.status IN ('SUCCESS', 'PENDING_OTP')
      AND t.created_at >= (now() - interval '24 hours');

    IF (v_daily_total + p_amount) > 200000.00 THEN
        INSERT INTO public.transactions (
            from_account_id, to_account_number, to_beneficiary_id, amount, remarks,
            status, failure_reason, idempotency_key, reference_no, completed_at
        ) VALUES (
            p_from_account_id, p_to_account_number, v_beneficiary.id, p_amount, p_remarks,
            'FAILED', 'DAILY_LIMIT_EXCEEDED: Exceeds 24-hour limit of ₹2,00,000.00 (Current 24h usage: ₹' || v_daily_total || ')',
            v_clean_key, v_ref_no, now()
        );
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'DAILY_LIMIT_EXCEEDED',
            'daily_used', v_daily_total,
            'message', 'Daily transfer limit exceeded. Maximum allowed per 24 hours is ₹2,00,000.00.'
        );
    END IF;

    -- 9. Create Transaction in PENDING_OTP status
    INSERT INTO public.transactions (
        from_account_id, to_account_number, to_beneficiary_id,
        amount, remarks, status, idempotency_key, reference_no
    ) VALUES (
        p_from_account_id, p_to_account_number, v_beneficiary.id,
        p_amount, p_remarks, 'PENDING_OTP', v_clean_key, v_ref_no
    ) RETURNING id INTO v_txn_id;

    -- 10. Generate 6-digit OTP and store SHA-256 hash
    v_otp_code := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
    v_otp_hash := encode(digest(v_otp_code, 'sha256'), 'hex');
    v_expires_at := now() + interval '5 minutes';

    INSERT INTO public.otp_challenges (
        transaction_id, user_id, otp_hash, expires_at, attempts, max_attempts, consumed
    ) VALUES (
        v_txn_id, v_user_id, v_otp_hash, v_expires_at, 0, 3, false
    );

    -- Log initiation in audit_log
    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (v_user_id, 'TRANSFER_INITIATED', jsonb_build_object(
        'transaction_id', v_txn_id,
        'reference_no', v_ref_no,
        'from_account_id', p_from_account_id,
        'to_account_number', p_to_account_number,
        'amount', p_amount
    ));

    -- Return response with simulated OTP for the on-screen simulated SMS inbox
    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', v_txn_id,
        'reference_no', v_ref_no,
        'amount', p_amount,
        'beneficiary_name', v_beneficiary.beneficiary_name,
        'simulated_otp', v_otp_code,
        'expires_at', v_expires_at,
        'max_attempts', 3
    );
END;
$$;

-- 2. Function to confirm transfer with OTP (Atomic, Race-safe via SELECT FOR UPDATE)
CREATE OR REPLACE FUNCTION public.confirm_transfer(
    p_transaction_id UUID,
    p_otp TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_txn RECORD;
    v_challenge RECORD;
    v_source_acc RECORD;
    v_dest_acc RECORD;
    v_entered_hash TEXT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_REQUIRED: User must be authenticated to confirm transfers';
    END IF;

    -- 1. Fetch transaction and verify ownership
    SELECT t.*, a.owner_id AS from_owner_id
    INTO v_txn
    FROM public.transactions t
    JOIN public.accounts a ON t.from_account_id = a.id
    WHERE t.id = p_transaction_id;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'TRANSACTION_NOT_FOUND',
            'message', 'Transaction record not found.'
        );
    END IF;

    IF v_txn.from_owner_id != v_user_id THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'UNAUTHORIZED',
            'message', 'You are not authorized to confirm this transaction.'
        );
    END IF;

    IF v_txn.status != 'PENDING_OTP' THEN
        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INVALID_TRANSACTION_STATE',
            'message', 'Transaction is already ' || v_txn.status || '. Only pending transactions can be verified.'
        );
    END IF;

    -- 2. Fetch active OTP challenge
    SELECT * INTO v_challenge
    FROM public.otp_challenges
    WHERE transaction_id = p_transaction_id AND consumed = false
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        UPDATE public.transactions
        SET status = 'FAILED', failure_reason = 'OTP_EXPIRED: No active OTP challenge found.', completed_at = now()
        WHERE id = p_transaction_id;

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'OTP_EXPIRED',
            'message', 'Verification session has expired. Please initiate a new transfer.'
        );
    END IF;

    -- Check if OTP expired
    IF now() > v_challenge.expires_at THEN
        UPDATE public.otp_challenges
        SET consumed = true
        WHERE id = v_challenge.id;

        UPDATE public.transactions
        SET status = 'FAILED', failure_reason = 'OTP_EXPIRED: The OTP has expired after 5 minutes.', completed_at = now()
        WHERE id = p_transaction_id;

        INSERT INTO public.audit_log (user_id, action, details)
        VALUES (v_user_id, 'TRANSFER_FAILED_OTP_EXPIRED', jsonb_build_object(
            'transaction_id', p_transaction_id,
            'reference_no', v_txn.reference_no
        ));

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'OTP_EXPIRED',
            'message', 'The OTP has expired after 5 minutes. Transfer has failed.'
        );
    END IF;

    -- Check attempts limit
    IF v_challenge.attempts >= v_challenge.max_attempts THEN
        UPDATE public.otp_challenges
        SET consumed = true
        WHERE id = v_challenge.id;

        UPDATE public.transactions
        SET status = 'FAILED', failure_reason = 'OTP_ATTEMPTS_EXCEEDED: Maximum 3 verification attempts reached.', completed_at = now()
        WHERE id = p_transaction_id;

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'OTP_ATTEMPTS_EXCEEDED',
            'message', 'Maximum OTP attempts reached. Transfer failed.'
        );
    END IF;

    -- 3. Verify OTP Hash
    v_entered_hash := encode(digest(TRIM(p_otp), 'sha256'), 'hex');

    IF v_entered_hash != v_challenge.otp_hash THEN
        -- Increment attempt
        UPDATE public.otp_challenges
        SET attempts = attempts + 1
        WHERE id = v_challenge.id;

        IF (v_challenge.attempts + 1) >= v_challenge.max_attempts THEN
            -- Exhausted attempts: fail transaction
            UPDATE public.otp_challenges
            SET consumed = true
            WHERE id = v_challenge.id;

            UPDATE public.transactions
            SET status = 'FAILED', failure_reason = 'OTP_ATTEMPTS_EXCEEDED: Incorrect OTP entered 3 times.', completed_at = now()
            WHERE id = p_transaction_id;

            INSERT INTO public.audit_log (user_id, action, details)
            VALUES (v_user_id, 'TRANSFER_FAILED_MAX_OTP', jsonb_build_object(
                'transaction_id', p_transaction_id,
                'reference_no', v_txn.reference_no
            ));

            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'OTP_ATTEMPTS_EXCEEDED',
                'attempts_left', 0,
                'message', 'Maximum 3 attempts exceeded. Transaction marked as FAILED.'
            );
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error_code', 'INVALID_OTP',
                'attempts_left', (v_challenge.max_attempts - (v_challenge.attempts + 1)),
                'message', 'Incorrect OTP. ' || (v_challenge.max_attempts - (v_challenge.attempts + 1)) || ' attempt(s) remaining.'
            );
        END IF;
    END IF;

    -- 4. OTP is VALID. Now perform Atomic Money Transfer with SELECT FOR UPDATE row locking!
    -- Lock source account
    SELECT * INTO v_source_acc
    FROM public.accounts
    WHERE id = v_txn.from_account_id
    FOR UPDATE;

    IF v_source_acc.status = 'FROZEN' THEN
        UPDATE public.transactions
        SET status = 'FAILED', failure_reason = 'ACCOUNT_FROZEN: Source account was frozen prior to confirmation.', completed_at = now()
        WHERE id = p_transaction_id;

        UPDATE public.otp_challenges SET consumed = true WHERE id = v_challenge.id;

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'ACCOUNT_FROZEN',
            'message', 'Source account is frozen. Transfer cannot be completed.'
        );
    END IF;

    IF v_source_acc.balance < v_txn.amount THEN
        UPDATE public.transactions
        SET status = 'FAILED', failure_reason = 'INSUFFICIENT_BALANCE: Balance insufficient at confirmation time.', completed_at = now()
        WHERE id = p_transaction_id;

        UPDATE public.otp_challenges SET consumed = true WHERE id = v_challenge.id;

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'INSUFFICIENT_BALANCE',
            'message', 'Insufficient balance in source account.'
        );
    END IF;

    -- Lock destination account
    SELECT * INTO v_dest_acc
    FROM public.accounts
    WHERE account_number = v_txn.to_account_number
    FOR UPDATE;

    IF NOT FOUND THEN
        UPDATE public.transactions
        SET status = 'FAILED', failure_reason = 'DESTINATION_ACCOUNT_NOT_FOUND: Destination account missing at settlement.', completed_at = now()
        WHERE id = p_transaction_id;

        UPDATE public.otp_challenges SET consumed = true WHERE id = v_challenge.id;

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'DESTINATION_ACCOUNT_NOT_FOUND',
            'message', 'Destination account not found.'
        );
    END IF;

    IF v_dest_acc.status = 'FROZEN' THEN
        UPDATE public.transactions
        SET status = 'FAILED', failure_reason = 'DESTINATION_ACCOUNT_FROZEN: Beneficiary account is frozen.', completed_at = now()
        WHERE id = p_transaction_id;

        UPDATE public.otp_challenges SET consumed = true WHERE id = v_challenge.id;

        RETURN jsonb_build_object(
            'success', false,
            'error_code', 'DESTINATION_ACCOUNT_FROZEN',
            'message', 'Destination account is frozen. Transfer rejected.'
        );
    END IF;

    -- 5. ATOMIC EXECUTION: Debit Source, Credit Destination
    UPDATE public.accounts
    SET balance = balance - v_txn.amount,
        updated_at = now()
    WHERE id = v_source_acc.id;

    UPDATE public.accounts
    SET balance = balance + v_txn.amount,
        updated_at = now()
    WHERE id = v_dest_acc.id;

    -- Consume challenge
    UPDATE public.otp_challenges
    SET consumed = true
    WHERE id = v_challenge.id;

    -- Mark transaction SUCCESS
    UPDATE public.transactions
    SET status = 'SUCCESS',
        completed_at = now()
    WHERE id = p_transaction_id;

    -- Write audit log
    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (v_user_id, 'TRANSFER_SUCCESS', jsonb_build_object(
        'transaction_id', p_transaction_id,
        'reference_no', v_txn.reference_no,
        'amount', v_txn.amount,
        'from_account', v_source_acc.account_number,
        'to_account', v_dest_acc.account_number,
        'source_new_balance', v_source_acc.balance - v_txn.amount
    ));

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', p_transaction_id,
        'reference_no', v_txn.reference_no,
        'amount', v_txn.amount,
        'from_account_number', v_source_acc.account_number,
        'to_account_number', v_dest_acc.account_number,
        'status', 'SUCCESS',
        'completed_at', now(),
        'message', 'Transfer completed successfully.'
    );
END;
$$;

-- 3. Function to cancel transfer
CREATE OR REPLACE FUNCTION public.cancel_transfer(p_transaction_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_txn RECORD;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_REQUIRED: User must be authenticated to cancel transfers';
    END IF;

    SELECT t.*, a.owner_id AS from_owner_id
    INTO v_txn
    FROM public.transactions t
    JOIN public.accounts a ON t.from_account_id = a.id
    WHERE t.id = p_transaction_id;

    IF NOT FOUND OR v_txn.from_owner_id != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction not found or unauthorized.');
    END IF;

    IF v_txn.status != 'PENDING_OTP' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Only pending transactions can be cancelled.');
    END IF;

    UPDATE public.transactions
    SET status = 'CANCELLED',
        failure_reason = 'TRANSFER_CANCELLED_BY_USER',
        completed_at = now()
    WHERE id = p_transaction_id;

    UPDATE public.otp_challenges
    SET consumed = true
    WHERE transaction_id = p_transaction_id;

    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (v_user_id, 'TRANSFER_CANCELLED', jsonb_build_object(
        'transaction_id', p_transaction_id,
        'reference_no', v_txn.reference_no
    ));

    RETURN jsonb_build_object('success', true, 'message', 'Transfer cancelled successfully.');
END;
$$;

-- 4. Function to resend transfer OTP
CREATE OR REPLACE FUNCTION public.resend_transfer_otp(p_transaction_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_txn RECORD;
    v_new_otp TEXT;
    v_new_hash TEXT;
    v_expires_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'AUTH_REQUIRED: User must be authenticated to resend OTP';
    END IF;

    SELECT t.*, a.owner_id AS from_owner_id
    INTO v_txn
    FROM public.transactions t
    JOIN public.accounts a ON t.from_account_id = a.id
    WHERE t.id = p_transaction_id;

    IF NOT FOUND OR v_txn.from_owner_id != v_user_id THEN
        RETURN jsonb_build_object('success', false, 'message', 'Transaction not found or unauthorized.');
    END IF;

    IF v_txn.status != 'PENDING_OTP' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Only pending transactions can receive new OTPs.');
    END IF;

    -- Invalidate existing challenges
    UPDATE public.otp_challenges
    SET consumed = true
    WHERE transaction_id = p_transaction_id;

    -- Generate new OTP
    v_new_otp := lpad(floor(random() * 900000 + 100000)::text, 6, '0');
    v_new_hash := encode(digest(v_new_otp, 'sha256'), 'hex');
    v_expires_at := now() + interval '5 minutes';

    INSERT INTO public.otp_challenges (
        transaction_id, user_id, otp_hash, expires_at, attempts, max_attempts, consumed
    ) VALUES (
        p_transaction_id, v_user_id, v_new_hash, v_expires_at, 0, 3, false
    );

    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (v_user_id, 'OTP_RESENT', jsonb_build_object(
        'transaction_id', p_transaction_id,
        'reference_no', v_txn.reference_no
    ));

    RETURN jsonb_build_object(
        'success', true,
        'transaction_id', p_transaction_id,
        'simulated_otp', v_new_otp,
        'expires_at', v_expires_at,
        'message', 'A new simulated OTP has been generated.'
    );
END;
$$;

-- 5. Admin function to freeze an account
CREATE OR REPLACE FUNCTION public.admin_freeze_account(p_account_id UUID, p_reason TEXT DEFAULT 'Administrative hold')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id UUID;
    v_acc RECORD;
BEGIN
    v_admin_id := auth.uid();
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'ADMIN_REQUIRED: Only administrators can freeze accounts';
    END IF;

    SELECT * INTO v_acc FROM public.accounts WHERE id = p_account_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Account not found.');
    END IF;

    UPDATE public.accounts
    SET status = 'FROZEN', updated_at = now()
    WHERE id = p_account_id;

    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (v_admin_id, 'ACCOUNT_FROZEN', jsonb_build_object(
        'account_id', p_account_id,
        'account_number', v_acc.account_number,
        'reason', p_reason
    ));

    RETURN jsonb_build_object(
        'success', true,
        'account_id', p_account_id,
        'status', 'FROZEN',
        'message', 'Account ' || v_acc.account_number || ' has been frozen.'
    );
END;
$$;

-- 6. Admin function to unfreeze an account
CREATE OR REPLACE FUNCTION public.admin_unfreeze_account(p_account_id UUID, p_reason TEXT DEFAULT 'Administrative release')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id UUID;
    v_acc RECORD;
BEGIN
    v_admin_id := auth.uid();
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'ADMIN_REQUIRED: Only administrators can unfreeze accounts';
    END IF;

    SELECT * INTO v_acc FROM public.accounts WHERE id = p_account_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Account not found.');
    END IF;

    UPDATE public.accounts
    SET status = 'ACTIVE', updated_at = now()
    WHERE id = p_account_id;

    INSERT INTO public.audit_log (user_id, action, details)
    VALUES (v_admin_id, 'ACCOUNT_UNFROZEN', jsonb_build_object(
        'account_id', p_account_id,
        'account_number', v_acc.account_number,
        'reason', p_reason
    ));

    RETURN jsonb_build_object(
        'success', true,
        'account_id', p_account_id,
        'status', 'ACTIVE',
        'message', 'Account ' || v_acc.account_number || ' has been reactivated.'
    );
END;
$$;
