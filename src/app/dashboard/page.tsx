'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Account, Transaction, Profile } from '@/types/database';
import { formatCurrency, maskAccountNumber, formatDate } from '@/lib/utils';
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
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

      // 1. Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData as Profile);
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

  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse space-y-6">
        <div className="h-20 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="h-44 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-72 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Personal Banking Overview
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, {profile?.full_name || 'Valued Customer'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered Mobile: {profile?.phone_masked || '+91 98*** **123'} • Active Account Holder
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh accounts data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
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
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold transition-all"
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Payees</span>
          </Link>
        </div>
      </div>

      {/* Total Liquidity & Key Stats Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl shadow-md relative overflow-hidden">
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

      {/* Account Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Your Accounts</h2>
          <span className="text-xs font-bold text-slate-500">{accounts.length} Depository Accounts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => {
            const isFrozen = account.status === 'FROZEN';
            const isSavings = account.account_type === 'SAVINGS';

            return (
              <div
                key={account.id}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-2xs hover:shadow-sm ${
                  isFrozen
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isSavings ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block leading-tight">
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
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {account.status}
                  </span>
                </div>

                {isFrozen && (
                  <div className="mb-4 p-2.5 bg-rose-50 rounded-xl border border-rose-200 flex items-center gap-2 text-rose-800 text-[11px] font-medium">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Transfers restricted by compliance hold</span>
                  </div>
                )}

                <div className="space-y-1 my-4">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Available Balance
                  </span>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {formatCurrency(account.balance)}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/transfer?from=${account.id}`}
                    className={`text-xs font-bold transition-colors inline-flex items-center gap-1 ${
                      isFrozen
                        ? 'text-slate-400 cursor-not-allowed pointer-events-none'
                        : 'text-indigo-600 hover:text-indigo-800'
                    }`}
                  >
                    <span>Transfer Funds</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href="/history"
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    History
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight">Recent Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Last 5 settled and pending transactions</p>
          </div>
          <Link
            href="/history"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
          >
            <span>View All Statements</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {recentTxns.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-slate-600">No transactions recorded yet</p>
            <p className="mt-1">Initiate your first transfer to see activity here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentTxns.map((txn: any) => {
              const isOutward = accounts.some((a) => a.id === txn.from_account_id);
              const isSuccess = txn.status === 'SUCCESS';
              const isPending = txn.status === 'PENDING_OTP';
              const isFailed = txn.status === 'FAILED';

              return (
                <div
                  key={txn.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isOutward ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {isOutward ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownLeft className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {txn.beneficiary?.beneficiary_name ||
                            txn.beneficiary?.nickname ||
                            `A/C: ${maskAccountNumber(txn.to_account_number)}`}
                        </span>
                        <span
                          className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
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

                  <div className="text-right">
                    <div
                      className={`text-sm sm:text-base font-black ${
                        isOutward ? 'text-slate-900' : 'text-emerald-600'
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
    </div>
  );
}
