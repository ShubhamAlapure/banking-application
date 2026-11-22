'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Account, Transaction, Profile } from '@/types/database';
import { formatCurrency, maskAccountNumber, formatDate } from '@/lib/utils';
import { resolveAvatarUrl } from '@/lib/avatar';
import {
  Wallet,
  ArrowUpRight,
  PlusCircle,
  Users,
  History,
  ShieldAlert,
  ArrowDownLeft,
  RefreshCw,
  ExternalLink,
  CreditCard,
  Building2,
  TrendingUp,
  Sparkles,
  Gift,
  User,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import WelcomeBonusModal from '@/components/WelcomeBonusModal';
import AddMoneyModal from '@/components/AddMoneyModal';
import { BillsAndRecharges } from '@/components/dashboard/BillsAndRecharges';
import { CreditAndLoans } from '@/components/dashboard/CreditAndLoans';
import { OffersAndRewards } from '@/components/dashboard/OffersAndRewards';
import ServiceModal, { ServiceType } from '@/components/dashboard/ServiceModal';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Modal States
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedAccountForAddMoney, setSelectedAccountForAddMoney] = useState<Account | null>(null);

  // Service Hub Modal State
  const [activeService, setActiveService] = useState<ServiceType | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const supabase = createClient();

  const loadDashboardData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setCurrentUserId(user.id);

      // Check if user should see the welcome popup
      const dismissed = typeof window !== 'undefined' ? localStorage.getItem(`mit_welcome_dismissed_${user.id}`) : null;
      if (!dismissed) {
        setShowWelcomeModal(true);
      }

      // 1. Fetch user profile
      const meta = (user.user_metadata || {}) as any;
      const metaAvatar = meta.avatar_url || null;
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile({
          ...(profileData as Profile),
          avatar_url: metaAvatar || (profileData as any).avatar_url,
        });
      } else {
        setProfile({
          id: user.id,
          full_name: meta.full_name || 'Valued Customer',
          role: meta.role || 'customer',
          phone_masked: meta.phone || '+91 93226 10932',
          avatar_url: metaAvatar,
          created_at: '',
          updated_at: '',
        });
      }

      // 2. Fetch customer accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id)
        .order('account_type', { ascending: false });

      if (accountsData) {
        setAccounts(accountsData as Account[]);
      }

      // 3. Fetch recent 5 transactions
      const accountIds = (accountsData || []).map((a: any) => a.id);
      const accountNumbers = (accountsData || []).map((a: any) => a.account_number);

      if (accountIds.length > 0) {
        const { data: txnsData } = await supabase
          .from('transactions')
          .select(`
            *,
            beneficiary:beneficiaries(nickname, beneficiary_name, bank_name)
          `)
          .or(`from_account_id.in.(${accountIds.join(',')}),to_account_number.in.(${accountNumbers.join(',')})`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (txnsData) {
          setRecentTxns(txnsData as Transaction[]);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleOpenAddMoney = (acc?: Account) => {
    const target = acc || accounts[0] || null;
    setSelectedAccountForAddMoney(target);
    setShowAddMoneyModal(true);
  };

  const handleAddMoneySuccess = (newBalance: number) => {
    if (selectedAccountForAddMoney) {
      setAccounts((prev) =>
        prev.map((a) => (a.id === selectedAccountForAddMoney.id ? { ...a, balance: newBalance } : a))
      );
    }
    handleRefresh();
  };

  const handleDismissWelcomeModal = () => {
    if (currentUserId && typeof window !== 'undefined') {
      localStorage.setItem(`mit_welcome_dismissed_${currentUserId}`, 'true');
    }
    setShowWelcomeModal(false);
  };

  const handleOpenService = (service: ServiceType) => {
    setActiveService(service);
    setShowServiceModal(true);
  };

  const handleBalanceUpdated = (newBalance: number) => {
    if (accounts.length > 0) {
      setAccounts((prev) =>
        prev.map((a, i) => (i === 0 ? { ...a, balance: newBalance } : a))
      );
    }
    handleRefresh();
  };

  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-4">
          <Link
            href="/profile"
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-500 shadow-md transition-all shrink-0 bg-slate-100 dark:bg-slate-800 group cursor-pointer"
            title="Click to Manage Profile & Avatar"
          >
            <Image
              src={resolveAvatarUrl(profile?.avatar_url, profile?.full_name, currentUserId)}
              alt={profile?.full_name || 'Profile'}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              unoptimized
            />
          </Link>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Personal Banking Overview
              </span>
              <button
                type="button"
                onClick={() => setShowWelcomeModal(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-[11px] font-bold transition-colors cursor-pointer"
                title="Click to view welcome perks"
              >
                <Sparkles className="w-3 h-3 text-amber-600" />
                <span>₹5,000 Welcome Benefit Active</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, {profile?.full_name || 'Valued Customer'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registered Mobile: {profile?.phone_masked || '+91 93226 10932'} • Active Account Holder
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh accounts data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <Link
            href="/profile"
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all"
            title="Manage Profile & Settings"
          >
            <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Profile</span>
          </Link>

          <button
            type="button"
            onClick={() => handleOpenAddMoney()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-emerald-100 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Money</span>
          </button>

          <Link
            href="/transfer"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm shadow-indigo-100 transition-all"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Send Money</span>
          </Link>

          <Link
            href="/beneficiaries"
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all"
          >
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Payees</span>
          </Link>
        </div>
      </div>

      {/* Total Liquidity & Key Stats Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
              Total Consolidated Liquidity
            </span>
            <div className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mt-1">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              Combined available balance across {accounts.length} active depository accounts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleOpenAddMoney()}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Money (UPI QR)</span>
            </button>

            <Link
              href="/transfer"
              className="px-5 py-3 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm flex items-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4 text-indigo-600" />
              <span>Instant Transfer</span>
            </Link>

            <Link
              href="/history"
              className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              <span>View Statements</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ================= YOUR ACCOUNTS & CARDS SECTION ================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Your Accounts & Depository</h2>
          <span className="text-xs font-bold text-slate-500">{accounts.length} Active Accounts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Primary Account */}
          {accounts.map((account) => {
            const isFrozen = account.status === 'FROZEN';
            const isSavings = account.account_type === 'SAVINGS';

            return (
              <div
                key={account.id}
                className={`bg-white dark:bg-[#111827] rounded-3xl p-6 border transition-all shadow-2xs hover:shadow-sm ${
                  isFrozen
                    ? 'border-rose-200 dark:border-rose-900 bg-rose-50/20'
                    : 'border-slate-200/90 dark:border-slate-800 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isSavings ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block leading-tight">
                        {isSavings ? 'Digital High-Yield Savings' : 'Premier Corporate Current'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {maskAccountNumber(account.account_number)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isFrozen
                        ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {account.status}
                  </span>
                </div>

                {isFrozen && (
                  <div className="mb-4 p-2.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800 flex items-center gap-2 text-rose-800 dark:text-rose-300 text-[11px] font-medium">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Transfers restricted by compliance hold</span>
                  </div>
                )}

                <div className="space-y-1 my-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Available Balance
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {formatCurrency(account.balance)}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAddMoney(account)}
                    disabled={isFrozen}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 disabled:opacity-40 inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Money</span>
                  </button>

                  <Link
                    href={`/transfer?from=${account.id}`}
                    className={`text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                      isFrozen
                        ? 'text-slate-400 cursor-not-allowed pointer-events-none'
                        : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-800'
                    }`}
                  >
                    <span>Transfer</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/history"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  >
                    Statements
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Card 2: Fixed Deposit Feature Card */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block leading-tight">
                      Digital Smart Fixed Deposit
                    </span>
                    <span className="text-[11px] text-slate-400">Guaranteed Return Deposit</span>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  7.85% P.A.
                </span>
              </div>

              <div className="space-y-1 my-4">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Projected Maturity Yield
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                  ₹1,08,180.00
                </div>
                <span className="text-[10px] text-slate-500 block">
                  Based on ₹1,00,000 for 12 months with quarterly compounding
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleOpenService('PERSONAL_LOAN')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Book Instant FD</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] text-slate-400">Zero penalty withdrawal</span>
            </div>
          </div>

          {/* Card 3: MIT RuPay Platinum Virtual Card */}
          <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 shadow-md border border-indigo-900/50 flex flex-col justify-between relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                  MIT RuPay Platinum Virtual
                </span>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  ACTIVE
                </span>
              </div>

              <div className="text-sm font-mono tracking-widest font-black my-3 text-slate-100">
                4532 •••• •••• {(profile?.phone_masked || '9322').slice(-4)}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>{profile?.full_name?.toUpperCase() || 'SHUBHAM ALAPURE'}</span>
                <span>EXP 11/31 • CVV •••</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleOpenService('FLEX_CREDIT_CARD')}
                className="text-xs font-bold text-indigo-300 hover:text-white inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Limits & Controls</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= BILLS, RECHARGES & FINTECH HUB ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Bills & Recharges (7 columns on desktop) */}
        <div className="lg:col-span-7">
          <BillsAndRecharges onSelectService={handleOpenService} />
        </div>

        {/* Right: Credit & Loans + Offers & Rewards (5 columns on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          <CreditAndLoans onSelectService={handleOpenService} />
          <OffersAndRewards onSelectService={handleOpenService} />
        </div>
      </div>

      {/* ================= RECENT ACTIVITY SECTION ================= */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Your latest account transfers & deposits</p>
          </div>
          <Link
            href="/history"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 inline-flex items-center gap-1"
          >
            <span>View Full Ledger</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {recentTxns.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            <p className="font-semibold text-slate-600 dark:text-slate-300">No transactions recorded yet</p>
            <p className="mt-1">Add money or initiate your first transfer to see activity here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentTxns.map((txn: any) => {
              const isDeposit =
                (txn.remarks && (txn.remarks.includes('Deposit') || txn.remarks.includes('UPI') || txn.remarks.includes('Top-Up') || txn.remarks.includes('Cashback') || txn.remarks.includes('Loan'))) ||
                (accounts.some((a) => a.id === txn.from_account_id) &&
                  accounts.some((a) => a.account_number === txn.to_account_number));
              const isOutward = !isDeposit && accounts.some((a) => a.id === txn.from_account_id);
              const isSuccess = txn.status === 'SUCCESS';
              const isPending = txn.status === 'PENDING_OTP';
              const isFailed = txn.status === 'FAILED';

              const payeeLabel = isDeposit
                ? txn.remarks || 'UPI Deposit'
                : txn.beneficiary?.beneficiary_name ||
                  txn.beneficiary?.nickname ||
                  `A/C: ${maskAccountNumber(txn.to_account_number)}`;

              return (
                <div
                  key={txn.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                      <Image
                        src={
                          isDeposit
                            ? resolveAvatarUrl(profile?.avatar_url, profile?.full_name, currentUserId)
                            : resolveAvatarUrl(null, payeeLabel)
                        }
                        alt={payeeLabel}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div
                        className={`absolute bottom-0 right-0 p-0.5 rounded-full ${
                          isOutward ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                        }`}
                      >
                        {isOutward ? (
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        ) : (
                          <ArrowDownLeft className="w-2.5 h-2.5" />
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[220px] sm:max-w-md">
                          {payeeLabel}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isSuccess
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : isPending
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="font-mono">{txn.reference_no}</span>
                        <span>•</span>
                        <span>{formatDate(txn.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-sm sm:text-base font-black ${
                        isOutward ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isOutward ? '-' : '+'}
                      {formatCurrency(txn.amount)}
                    </div>
                    {txn.failure_reason && (
                      <span className="text-[10px] text-rose-600 font-medium block truncate max-w-[140px]">
                        {txn.failure_reason}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {/* 1. Welcome Bonus Modal Popup */}
      <WelcomeBonusModal
        isOpen={showWelcomeModal}
        onClose={handleDismissWelcomeModal}
        onAddMoney={() => handleOpenAddMoney()}
        userName={profile?.full_name || 'Shubham Alapure'}
        accountNumber={accounts[0]?.account_number}
        bonusAmount={5000}
      />

      {/* 2. Add Money Modal with Cropped QR Popup */}
      <AddMoneyModal
        isOpen={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        account={selectedAccountForAddMoney}
        onSuccess={handleAddMoneySuccess}
      />

      {/* 3. Universal Service Action Modal (Recharge, Electricity, FASTag, CIBIL, Loan, Rewards) */}
      <ServiceModal
        isOpen={showServiceModal}
        service={activeService}
        onClose={() => setShowServiceModal(false)}
        account={accounts[0] || null}
        onBalanceUpdated={handleBalanceUpdated}
        userPhone={profile?.phone_masked || '+91 93226 10932'}
        userName={profile?.full_name || 'Shubham Alapure'}
      />
    </div>
  );
}
