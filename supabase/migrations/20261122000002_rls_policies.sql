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
