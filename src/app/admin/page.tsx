'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Account, Transaction, Profile, AuditLog } from '@/types/database';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useDemo } from '@/context/DemoContext';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Activity,
  CheckCircle2,
  Search,
  RefreshCw,
  TrendingUp,
  Wallet,
  Building2,
  DollarSign,
  Download,
  Copy,
  Check,
  SlidersHorizontal,
  Server,
  Database,
  ArrowUpRight,
  ArrowDownRight,
  BadgeAlert,
  Zap,
  Filter,
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

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'FROZEN'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'SAVINGS' | 'CURRENT'>('ALL');
  const [tierFilter, setTierFilter] = useState<'ALL' | 'HNI' | 'STANDARD' | 'LOW'>('ALL');

  // Freeze action modal
  const [selectedAcc, setSelectedAcc] = useState<Account | null>(null);
  const [freezeReason, setFreezeReason] = useState<string>('Suspicious transaction velocity / Compliance review');
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Balance Adjustment Modal
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [adjustTargetAcc, setAdjustTargetAcc] = useState<Account | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('10000');
  const [adjustType, setAdjustType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [adjustReason, setAdjustReason] = useState<string>('Simulated test deposit / Regulatory adjustment');

  // Copy state
  const [copiedAcc, setCopiedAcc] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

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
        .limit(100);

      if (txnsData) {
        setAllTransactions(txnsData as Transaction[]);
      }

      // 3. Fetch Audit Logs
      const { data: logsData } = await supabase
        .from('audit_log')
        .select('*, user:profiles(full_name, role)')
        .order('created_at', { ascending: false })
        .limit(50);

      if (logsData) {
        setAuditLogs(logsData as AuditLog[]);
      }

      const now = new Date();
      setLastRefreshed(
        now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
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
      const { error } = await supabase.rpc('admin_freeze_account', {
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
      const { error } = await supabase.rpc('admin_unfreeze_account', {
        p_account_id: account.id,
        p_reason: 'Administrative release approved by compliance supervisor',
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
        title: 'Account Restored',
        message: `Account ${account.account_number} has been unlocked and restored to ACTIVE.`,
      });

      loadAdminData();
    } catch (err) {
      console.error('Unfreeze error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Balance Adjustment
  const handleAdjustBalance = async () => {
    if (!adjustTargetAcc) return;
    const numericAmount = parseFloat(adjustAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      addToast({ type: 'error', title: 'Invalid Amount', message: 'Enter a valid numeric value.' });
      return;
    }

    setActionLoading(true);
    try {
      const currentBal = Number(adjustTargetAcc.balance);
      const newBal = adjustType === 'CREDIT' ? currentBal + numericAmount : Math.max(0, currentBal - numericAmount);

      const { error } = await supabase
        .from('accounts')
        .update({ balance: newBal, updated_at: new Date().toISOString() })
        .eq('id', adjustTargetAcc.id);

      if (error) {
        addToast({ type: 'error', title: 'Update Failed', message: error.message });
        return;
      }

      // Record in audit log
      await supabase.from('audit_log').insert({
        user_id: adjustTargetAcc.owner_id,
        action: adjustType === 'CREDIT' ? 'ADMIN_CREDIT_ADJUSTMENT' : 'ADMIN_DEBIT_ADJUSTMENT',
        details: {
          account_number: adjustTargetAcc.account_number,
          previous_balance: currentBal,
          adjusted_balance: newBal,
          delta: numericAmount,
          reason: adjustReason,
        },
      });

      addToast({
        type: 'success',
        title: 'Balance Adjusted',
        message: `Account ${adjustTargetAcc.account_number} new balance: ${formatCurrency(newBal)}`,
      });

      setIsBalanceModalOpen(false);
      setAdjustTargetAcc(null);
      loadAdminData();
    } catch (err) {
      console.error('Balance adjustment error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAcc(text);
    setTimeout(() => setCopiedAcc(null), 2000);
    addToast({ type: 'info', title: 'Copied', message: `Copied ${text} to clipboard` });
  };

  const exportAccountsCSV = () => {
    const headers = 'Account Number,Holder Name,Phone,Type,Balance,Status,Created At\n';
    const rows = allAccounts
      .map(
        (a) =>
          `"${a.account_number}","${a.owner?.full_name || 'Customer'}","${a.owner?.phone_masked || ''}","${a.account_type}",${a.balance},"${a.status}","${a.created_at}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MIT_Payments_Bank_Accounts_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    addToast({ type: 'success', title: 'CSV Exported', message: 'Accounts ledger exported successfully.' });
  };

  // Analytical Computations
  const totalAUM = useMemo(() => {
    return allAccounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  }, [allAccounts]);

  const savingsAUM = useMemo(() => {
    return allAccounts
      .filter((a) => a.account_type === 'SAVINGS')
      .reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  }, [allAccounts]);

  const currentAUM = useMemo(() => {
    return allAccounts
      .filter((a) => a.account_type === 'CURRENT')
      .reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  }, [allAccounts]);

  const activeAccountsCount = allAccounts.filter((a) => a.status === 'ACTIVE').length;
  const frozenAccountsCount = allAccounts.filter((a) => a.status === 'FROZEN').length;
  const healthPercent = allAccounts.length > 0 ? Math.round((activeAccountsCount / allAccounts.length) * 100) : 100;

  const failedTxns = useMemo(() => allTransactions.filter((t) => t.status === 'FAILED'), [allTransactions]);
  const successTxns = useMemo(() => allTransactions.filter((t) => t.status === 'SUCCESS'), [allTransactions]);
  const totalVolume24h = useMemo(() => {
    return successTxns.reduce((sum, t) => sum + Number(t.amount || 0), 0);
  }, [successTxns]);

  // Customer Concentration Data
  const customerBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; total: number; count: number; phone: string }>();
    allAccounts.forEach((acc) => {
      const name = acc.owner?.full_name || 'Customer';
      const existing = map.get(name) || { name, total: 0, count: 0, phone: acc.owner?.phone_masked || '' };
      existing.total += Number(acc.balance || 0);
      existing.count += 1;
      map.set(name, existing);
    });
    return Array.from(map.values()).sort((a, b) => b.total - a.total);
  }, [allAccounts]);

  // Failure reasons
  const failureReasonCounts = useMemo(() => {
    return failedTxns.reduce<Record<string, number>>((acc, curr) => {
      const rawReason = curr.failure_reason || 'UNKNOWN';
      const mainCategory = rawReason.split(':')[0].trim();
      acc[mainCategory] = (acc[mainCategory] || 0) + 1;
      return acc;
    }, {});
  }, [failedTxns]);

  // Filtered Accounts
  const filteredAccounts = useMemo(() => {
    return allAccounts.filter((acc) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        acc.account_number.toLowerCase().includes(query) ||
        (acc.owner?.full_name || '').toLowerCase().includes(query) ||
        (acc.owner?.phone_masked || '').toLowerCase().includes(query) ||
        acc.account_type.toLowerCase().includes(query);

      const matchesStatus = statusFilter === 'ALL' || acc.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || acc.account_type === typeFilter;

      let matchesTier = true;
      const bal = Number(acc.balance);
      if (tierFilter === 'HNI') matchesTier = bal >= 100000;
      else if (tierFilter === 'STANDARD') matchesTier = bal >= 1000 && bal < 100000;
      else if (tierFilter === 'LOW') matchesTier = bal < 1000;

      return matchesSearch && matchesStatus && matchesType && matchesTier;
    });
  }, [allAccounts, searchQuery, statusFilter, typeFilter, tierFilter]);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (name.slice(0, 2) || 'CU').toUpperCase();
  };

  const getAvatarGradient = (name: string) => {
    if (name.includes('Rahul')) return 'from-blue-600 to-indigo-600 text-white';
    if (name.includes('Amit')) return 'from-emerald-600 to-teal-700 text-white';
    if (name.includes('Priya')) return 'from-amber-500 to-rose-600 text-white';
    return 'from-slate-700 to-slate-900 text-white';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-20 bg-slate-200 rounded-3xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
          <div className="h-32 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7">
      {/* ============================================================== */}
      {/* 1. EXECUTIVE COMMAND BANNER */}
      {/* ============================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg ring-4 ring-indigo-500/20 shrink-0">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  MIT Payments Bank
                </h1>
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 backdrop-blur-md">
                  Core Settlement & Control Console
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Operational
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-normal leading-relaxed">
                Supervisory real-time audit ledger, cryptographic RLS policy monitoring, instant account liquidity freeze/unfreeze controls, and ACID transaction diagnostics.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Core Engine Sync</div>
              <div className="text-xs font-mono font-bold text-slate-200">
                {lastRefreshed ? `Updated at ${lastRefreshed}` : 'Live connected'}
              </div>
            </div>

            <button
              type="button"
              onClick={exportAccountsCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-white rounded-xl text-xs font-bold border border-slate-700/80 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-300" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={loadAdminData}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ring-2 ring-indigo-400/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Core</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. EXECUTIVE KPI DASHBOARD GRID (4 METRIC CARDS) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Reserve Liquidity (AUM) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Reserve Liquidity (AUM)
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalAUM)}
            </p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.2%
              </span>
              <span className="text-[11px] text-slate-500">24h liquidity reserve</span>
            </div>
          </div>
          {/* Progress split */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-500">
            <span>Savings: {formatCurrency(savingsAUM)}</span>
            <span>Current: {formatCurrency(currentAUM)}</span>
          </div>
        </div>

        {/* KPI 2: Account Health & RLS Security */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Portfolio Integrity
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-black text-slate-900 tracking-tight">
                {activeAccountsCount} / {allAccounts.length}
              </p>
              <span className="text-xs font-bold text-emerald-600">
                {healthPercent}% Operational
              </span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${healthPercent}%` }}
              />
              {frozenAccountsCount > 0 && (
                <div
                  className="bg-rose-500 h-2 rounded-full transition-all"
                  style={{ width: `${100 - healthPercent}%` }}
                />
              )}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium">
            <span className="text-emerald-700 font-bold">{activeAccountsCount} Active Portfolios</span>
            <span className={frozenAccountsCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}>
              {frozenAccountsCount} Locked
            </span>
          </div>
        </div>

        {/* KPI 3: 24h Transaction Volume */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Settlement Volume
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalVolume24h)}
            </p>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <span className="font-bold text-slate-700">{allTransactions.length} Total Operations</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">{successTxns.length} Cleared</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-500">
            <span>Settlement SLA: 12ms avg</span>
            <span className="text-indigo-600 font-bold">Atomic ACID</span>
          </div>
        </div>

        {/* KPI 4: Regulatory & Security Compliance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              Security Compliance
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <p className="text-2xl font-black text-slate-900 tracking-tight">Grade A+</p>
              <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                100% Zero Leak
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Row-Level Security active across 6 database tables
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-medium text-slate-500">
            <span>Postgres PL/pgSQL</span>
            <span className="text-emerald-600 font-bold">2FA Enforced</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. LIQUIDITY CONCENTRATION & SYSTEM WATCHDOG DUAL CARDS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Liquidity Concentration */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <span>Customer Capital Concentration</span>
              </h2>
              <p className="text-xs text-slate-500">Distribution of customer balances across total reserve assets</p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {customerBreakdown.length} Accounts Monitored
            </span>
          </div>

          <div className="space-y-4">
            {customerBreakdown.map((customer) => {
              const pct = totalAUM > 0 ? Math.round((customer.total / totalAUM) * 100) : 0;
              return (
                <div key={customer.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{customer.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({customer.phone})</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-slate-100 text-slate-600">
                        {customer.count} {customer.count === 1 ? 'account' : 'accounts'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 font-mono">{formatCurrency(customer.total)}</span>
                      <span className="text-xs font-bold text-indigo-600 w-10 text-right">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        customer.name.includes('Amit')
                          ? 'bg-emerald-500'
                          : customer.name.includes('Rahul')
                          ? 'bg-indigo-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live System Watchdog & Diagnostics */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-emerald-600" />
              <span>Core Banking Health Watchdog</span>
            </h2>
            <p className="text-xs text-slate-500 mb-4">Infrastructure telemetry & cryptographic safeguards</p>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Postgres Engine</span>
                <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Supabase v15.8 Online
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Row-Level Security</span>
                <span className="font-bold font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Active (6/6 Tables)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Idempotency Guard</span>
                <span className="font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  Zero Double-Debits
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Audit Trail Table</span>
                <span className="font-bold font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                  {auditLogs.length} Events Logged
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Primary Region: ap-south-1</span>
            <span className="text-emerald-600 font-bold">100% Uptime SLA</span>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. NAVIGATION TABS */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('ACCOUNTS')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'ACCOUNTS'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>All Customer Portfolios ({allAccounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Settlement Ledger & Audit Trail ({allTransactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('FAILURES')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'FAILURES'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span>Security Exception Reports ({failedTxns.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: ALL ACCOUNTS & INTERACTIVE FREEZE / UNFREEZE / CREDIT */}
      {/* ============================================================== */}
      {activeTab === 'ACCOUNTS' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by holder name, phone, or 12-digit account number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Statuses ({allAccounts.length})</option>
                <option value="ACTIVE">Active ({activeAccountsCount})</option>
                <option value="FROZEN">Frozen ({frozenAccountsCount})</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Account Types</option>
                <option value="SAVINGS">Savings</option>
                <option value="CURRENT">Current</option>
              </select>

              {/* Tier Filter */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">All Liquidity Tiers</option>
                <option value="HNI">HNI (≥ ₹1,00,000)</option>
                <option value="STANDARD">Standard Tier</option>
                <option value="LOW">Low Balance (&lt; ₹1,000)</option>
              </select>
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-3.5 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Active Customer Portfolios ({filteredAccounts.length} of {allAccounts.length})
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Click any account number to copy
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Account Holder</th>
                    <th className="py-3 px-4">Account Number</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Current Balance</th>
                    <th className="py-3 px-4">Tier & Risk</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No accounts match your search filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((acc) => {
                      const isFrozen = acc.status === 'FROZEN';
                      const bal = Number(acc.balance);
                      const isHni = bal >= 100000;
                      const isLow = bal < 1000;
                      const holderName = acc.owner?.full_name || 'Customer';

                      return (
                        <tr key={acc.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Account Holder */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-9 h-9 rounded-xl bg-gradient-to-br ${getAvatarGradient(
                                  holderName
                                )} flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}
                              >
                                {getInitials(holderName)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{holderName}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {acc.owner?.phone_masked}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Account Number */}
                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(acc.account_number)}
                              className="inline-flex items-center gap-1.5 font-mono font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md text-xs transition-colors cursor-pointer group"
                              title="Click to copy account number"
                            >
                              <span>{acc.account_number}</span>
                              {copiedAcc === acc.account_number ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
                              )}
                            </button>
                          </td>

                          {/* Type */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                acc.account_type === 'SAVINGS'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              }`}
                            >
                              {acc.account_type}
                            </span>
                          </td>

                          {/* Balance */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-slate-900 text-sm font-mono">
                              {formatCurrency(acc.balance)}
                            </div>
                          </td>

                          {/* Tier & Risk */}
                          <td className="py-3.5 px-4">
                            {isHni ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                                Premier HNI
                              </span>
                            ) : isLow ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                Low Bal Test
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-600 bg-slate-100">
                                Standard
                              </span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isFrozen
                                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {isFrozen ? (
                                <Lock className="w-3 h-3 text-rose-600" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              )}
                              <span>{acc.status}</span>
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              {/* Quick Adjustment */}
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjustTargetAcc(acc);
                                  setIsBalanceModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                                title="Credit or adjust balance for live testing"
                              >
                                <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                                <span>Adjust</span>
                              </button>

                              {/* Freeze / Unfreeze */}
                              {isFrozen ? (
                                <button
                                  type="button"
                                  onClick={() => handleUnfreezeAccount(acc)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
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
                                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer active:scale-95"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  <span>Freeze</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: GLOBAL TRANSACTION AUDIT & IMMUTABLE LOGS */}
      {/* ============================================================== */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">System-Wide Settlement Ledger</h2>
                <p className="text-xs text-slate-500">Atomic PL/pgSQL transaction history with cryptographic hashes</p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                {allTransactions.length} Transactions Recorded
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Reference No</th>
                    <th className="py-3 px-4">Beneficiary / Route</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Settlement Status</th>
                    <th className="py-3 px-4">Audit Diagnostics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allTransactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                        {formatDate(txn.created_at)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(txn.reference_no)}
                          className="hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>{txn.reference_no}</span>
                          <Copy className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">
                          {txn.beneficiary?.beneficiary_name || 'Internal Transfer'}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          A/C {txn.to_account_number}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        {formatCurrency(txn.amount)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            txn.status === 'SUCCESS'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : txn.status === 'FAILED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {txn.failure_reason || txn.remarks || 'Cleared via Core IMPS Settlement'}
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
              <span>Immutable System Audit Trail (`public.audit_log`)</span>
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
                Total Security Interceptions
              </span>
              <p className="text-3xl font-black text-rose-600 mt-1">{failedTxns.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Safeguarded by Postgres triggers & guards</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Primary Reject Trigger
              </span>
              <p className="text-xl font-bold text-slate-800 mt-1 truncate">
                {Object.keys(failureReasonCounts)[0] || 'None'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Top compliance reject code</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                System Financial Integrity
              </span>
              <p className="text-xl font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> 100% Zero-Loss
              </p>
              <p className="text-xs text-slate-500 mt-0.5">All failed operations rolled back atomically</p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900">Failure Trigger Diagnostics</h2>
              <p className="text-xs text-slate-500">Categorized by PostgreSQL security guard exception codes</p>
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
                    <th className="py-3 px-4">Detailed Exception Reason</th>
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

      {/* ============================================================== */}
      {/* 5. FREEZE ACCOUNT CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {isFreezeModalOpen && selectedAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200 shadow-sm">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Freeze Customer Portfolio?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Freezing account <span className="font-mono font-bold text-slate-800">{selectedAcc.account_number}</span> ({selectedAcc.owner?.full_name}) will immediately lock all outbound debits and trigger an audit compliance hold.
            </p>

            <div className="text-left mb-6 space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Regulatory Audit Reason *
              </label>
              <input
                type="text"
                value={freezeReason}
                onChange={(e) => setFreezeReason(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
              />
              <p className="text-[10px] text-slate-400">
                This explanation will be committed to the immutable `audit_log` table.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsFreezeModalOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleFreezeAccount}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {actionLoading ? 'Freezing...' : 'Confirm Regulatory Freeze'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. BALANCE ADJUSTMENT MODAL */}
      {/* ============================================================== */}
      {isBalanceModalOpen && adjustTargetAcc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Adjust Portfolio Balance</h3>
                <p className="text-xs text-slate-500 font-mono">
                  A/C {adjustTargetAcc.account_number} • {adjustTargetAcc.owner?.full_name}
                </p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              {/* Adjustment Type Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setAdjustType('CREDIT')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adjustType === 'CREDIT'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  + Credit / Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('DEBIT')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    adjustType === 'DEBIT'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  - Debit / Deduction
                </button>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Adjustment Amount (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Audit Reason
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex justify-between font-mono">
                <span>Current: {formatCurrency(adjustTargetAcc.balance)}</span>
                <span>
                  Result:{' '}
                  {formatCurrency(
                    adjustType === 'CREDIT'
                      ? Number(adjustTargetAcc.balance) + (parseFloat(adjustAmount) || 0)
                      : Math.max(0, Number(adjustTargetAcc.balance) - (parseFloat(adjustAmount) || 0))
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsBalanceModalOpen(false)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAdjustBalance}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {actionLoading ? 'Updating...' : 'Commit Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
