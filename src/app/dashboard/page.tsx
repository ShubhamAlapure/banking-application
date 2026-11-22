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
      const accountIds = (accountsData || []).map((a) => a.id);
      const accountNumbers = (accountsData || []).map((a) => a.account_number);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Customer Dashboard
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Welcome back, {profile?.full_name || 'Customer'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered phone: {profile?.phone_masked || '+91 98*** **123'} • Verified Demo Customer
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          <Link
            href="/transfer"
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all shadow-indigo-100"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Send Money</span>
          </Link>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            <span>Your Bank Accounts</span>
          </h2>
          <span className="text-xs font-semibold text-slate-500">
            Total Net Balance:{' '}
            <span className="text-slate-900 font-bold text-sm">
              {formatCurrency(totalBalance)}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => {
            const isFrozen = acc.status === 'FROZEN';

            return (
              <div
                key={acc.id}
                className={`relative rounded-2xl p-6 transition-all duration-200 border ${
                  isFrozen
                    ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isFrozen
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-indigo-50 text-indigo-600'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                        {acc.account_type} Account
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        {maskAccountNumber(acc.account_number)}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isFrozen
                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {acc.status}
                  </span>
                </div>

                <div className="space-y-1 mb-6">
                  <span className="text-xs text-slate-400 font-medium">Available Balance</span>
                  <p
                    className={`text-2xl font-black tracking-tight ${
                      isFrozen ? 'text-rose-900 line-through' : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(acc.balance)}
                  </p>
                  {isFrozen && (
                    <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Account Frozen by Administrator
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    A/C: <span className="font-mono text-slate-600 font-medium">{acc.account_number}</span>
                  </span>

                  {!isFrozen ? (
                    <Link
                      href={`/transfer?from=${acc.id}`}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group"
                    >
                      <span>Transfer</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-rose-500">Hold</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Access Navigation Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/transfer"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Make Fund Transfer</h3>
            <p className="text-xs text-slate-500">Fast 2-step OTP simulated transfer</p>
          </div>
        </Link>

        <Link
          href="/beneficiaries"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Payee Directory</h3>
            <p className="text-xs text-slate-500">Add or manage saved beneficiaries</p>
          </div>
        </Link>

        <Link
          href="/history"
          className="p-4 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xs transition-all flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
            <p className="text-xs text-slate-500">Filter, search & CSV export</p>
          </div>
        </Link>
      </div>

      {/* Recent 5 Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Transactions</h2>
            <p className="text-xs text-slate-500">Your latest account movements</p>
          </div>
          <Link
            href="/history"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View All</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentTxns.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <History className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No transactions found for your accounts.</p>
            <Link
              href="/transfer"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Initiate your first transfer</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Reference No</th>
                  <th className="py-3 px-4">Recipient / Payee</th>
                  <th className="py-3 px-4">Remarks</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTxns.map((txn) => {
                  const isSuccess = txn.status === 'SUCCESS';
                  const isFailed = txn.status === 'FAILED';
                  const isPending = txn.status === 'PENDING_OTP';

                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {formatDate(txn.created_at)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {txn.reference_no}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {txn.beneficiary?.beneficiary_name || maskAccountNumber(txn.to_account_number)}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {txn.beneficiary?.bank_name || 'Internal Transfer'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                        {txn.remarks || '-'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                            isSuccess
                              ? 'bg-emerald-100 text-emerald-800'
                              : isFailed
                              ? 'bg-rose-100 text-rose-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {txn.status}
                        </span>
                        {isFailed && txn.failure_reason && (
                          <p className="text-[10px] text-rose-600 mt-1 max-w-[180px] truncate" title={txn.failure_reason}>
                            {txn.failure_reason}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
