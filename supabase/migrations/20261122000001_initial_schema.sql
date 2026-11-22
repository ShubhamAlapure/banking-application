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
