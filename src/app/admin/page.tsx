'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Account, Transaction, Profile, AuditLog } from '@/types/database';
import { formatCurrency, maskAccountNumber, formatDate } from '@/lib/utils';
import { useDemo } from '@/context/DemoContext';
import {
  ShieldCheck,
  Users,
  CreditCard,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();
  const { addToast } = useDemo();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACCOUNTS' | 'AUDIT' | 'FAILURES'>('ACCOUNTS');

  // Admin Data
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Freeze action modal
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);
  const [freezeReason, setFreezeReason] = useState<string>('Suspicious transaction velocity / Compliance review');
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Search in admin
  const [searchQuery, setSearchQuery] = useState('');

  const supabase = createClient();

  const loadAdminData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check role
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        router.push('/dashboard?error=unauthorized_admin');
        return;
      }

      // 1. Fetch All Accounts with Owner profiles
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*, owner:profiles(*)')
        .order('created_at', { ascending: false });

      if (accountsData) {
        setAllAccounts(accountsData as Account[]);
      }

      // 2. Fetch Global Transactions
      const { data: txnsData } = await supabase
        .from('transactions')
        .select('*, beneficiary:beneficiaries(*)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (txnsData) {
        setAllTransactions(txnsData as Transaction[]);
      }

      // 3. Fetch Audit Logs
      const { data: logsData } = await supabase
        .from('audit_log')
        .select('*, user:profiles(full_name, role)')
        .order('created_at', { ascending: false })
        .limit(30);

      if (logsData) {
        setAuditLogs(logsData as AuditLog[]);
      }
    } catch (err) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [router]);

  // Handle Account Freeze
  const handleFreezeAccount = async () => {
    if (!selectedAcc) return;
    setActionLoading(true);

    try {
      const { data, error } = await supabase.rpc('admin_freeze_account', {
        p_account_id: selectedAcc.id,
        p_reason: freezeReason,
      });

      if (error) {
        addToast({
          type: 'error',
          title: 'Action Failed',
          message: error.message,
        });
        return;
      }

      addToast({
        type: 'warning',
        title: 'Account Frozen',
        message: `Account ${selectedAcc.account_number} status set to FROZEN. Outward transfers locked.`,
      });

      setIsFreezeModalOpen(false);
      setSelectedAcc(null);
      loadAdminData();
    } catch (err) {
      console.error('Freeze error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Account Unfreeze
  const handleUnfreezeAccount = async (account: Account) => {
    setActionLoading(true);

    try {
      const { data, error } = await supabase.rpc('admin_unfreeze_account', {
        p_account_id: account.id,
        p_reason: 'Administrative release approved by compliance officer',
      });

      if (error) {
        addToast({
          type: 'error',
          title: 'Action Failed',
          message: error.message,
        });
        return;
      }

      addToast({
        type: 'success',
        title: 'Account Unfrozen',
        message: `Account ${account.account_number} has been restored to ACTIVE.`,
      });

      loadAdminData();
    } catch (err) {
      console.error('Unfreeze error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Failed transactions breakdown
  const failedTxns = allTransactions.filter((t) => t.status === 'FAILED');
  const failureReasonCounts = failedTxns.reduce<Record<string, number>>((acc, curr) => {
    const rawReason = curr.failure_reason || 'UNKNOWN';
    const mainCategory = rawReason.split(':')[0].trim();
    acc[mainCategory] = (acc[mainCategory] || 0) + 1;
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-14 bg-slate-200 rounded-2xl w-1/3" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white text-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Admin Audit & Control Console</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                Staff Privileges
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Supervisory monitoring, account freezing controls, and failed transaction analysis
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadAdminData}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors shadow-2xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
          <span>Refresh Audit Feed</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'ACCOUNTS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>All Accounts ({allAccounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'AUDIT'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Global Transactions & Logs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FAILURES')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'FAILURES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Failed Transactions Report ({failedTxns.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ALL ACCOUNTS & FREEZE / UNFREEZE */}
      {/* ============================================================== */}
      {activeTab === 'ACCOUNTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Registered Customer Accounts</h2>
              <p className="text-xs text-slate-500">Live balances and administrative lock status</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Account Holder</th>
                  <th className="py-3 px-4">Account Number</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Current Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Administrative Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {allAccounts.map((acc) => {
                  const isFrozen = acc.status === 'FROZEN';

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">
                          {acc.owner?.full_name || 'Customer'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {acc.owner?.phone_masked}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {acc.account_number}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">
                        {acc.account_type}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {formatCurrency(acc.balance)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isFrozen
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isFrozen ? <Lock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          <span>{acc.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {isFrozen ? (
                          <button
                            type="button"
                            onClick={() => handleUnfreezeAccount(acc)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Unfreeze</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAcc(acc);
                              setIsFreezeModalOpen(true);
                            }}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Freeze Account</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: GLOBAL TRANSACTION AUDIT */}
      {/* ============================================================== */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">System-Wide Transactions Audit</h2>
                <p className="text-xs text-slate-500">Read-only view across all accounts</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reason / Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(txn.created_at)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {txn.reference_no}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {txn.to_account_number}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            txn.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800'
                              : txn.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {txn.failure_reason || txn.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Trail Log */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Immutable Audit Logs (audit_log table)</span>
            </h3>

            <div className="space-y-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs flex items-start justify-between font-mono"
                >
                  <div>
                    <span className="font-bold text-indigo-700 mr-2">{log.action}</span>
                    <span className="text-slate-500">
                      by {log.user?.full_name || 'System'} ({log.user?.role || 'system'})
                    </span>
                    <pre className="text-[11px] text-slate-600 mt-1 font-sans">
                      {JSON.stringify(log.details)}
                    </pre>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: FAILED TRANSACTIONS REPORT */}
      {/* ============================================================== */}
      {activeTab === 'FAILURES' && (
        <div className="space-y-6">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Failed Transactions
              </span>
              <p className="text-3xl font-black text-rose-600 mt-1">{failedTxns.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Caught by Postgres security guards</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Most Common Reason
              </span>
              <p className="text-xl font-bold text-slate-800 mt-1 truncate">
                {Object.keys(failureReasonCounts)[0] || 'None'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Top reject trigger</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                System Integrity
              </span>
              <p className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> 100% Zero-Loss
              </p>
              <p className="text-xs text-slate-500 mt-0.5">All failed txns rolled back atomically</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">Failure Reason Breakdown</h2>
              <p className="text-xs text-slate-500">Summary categorized by error code</p>
            </div>

            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(failureReasonCounts).map(([reason, count]) => (
                <div
                  key={reason}
                  className="p-3 bg-rose-50/60 rounded-xl border border-rose-100 flex items-center justify-between"
                >
                  <span className="font-mono text-xs font-bold text-rose-900">{reason}</span>
                  <span className="px-2.5 py-0.5 bg-rose-200 text-rose-800 rounded-full text-xs font-black">
                    {count} occurrence{count === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>

            {/* List of failed transactions */}
            <div className="overflow-x-auto border-t border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Detailed Failure Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {failedTxns.map((txn) => (
                    <tr key={txn.id} className="hover:bg-rose-50/30">
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {formatDate(txn.created_at)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                        {txn.reference_no}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-rose-700">
                        {txn.failure_reason || 'Unknown error'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Freeze Account Confirmation Modal Dialog */}
      {isFreezeModalOpen && selectedAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Freeze Bank Account?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Freezing account <span className="font-mono font-bold text-slate-800">{selectedAcc.account_number}</span> will immediately prohibit all outgoing fund transfers.
            </p>

            <div className="text-left mb-6">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Audit Reason *
              </label>
              <input
                type="text"
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsFreezeModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFreezeAccount}
                disabled={actionLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {actionLoading ? 'Freezing...' : 'Confirm Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
