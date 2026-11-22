'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Transaction, Account } from '@/types/database';
import { formatCurrency, maskAccountNumber, formatDate } from '@/lib/utils';
import { resolveAvatarUrl } from '@/lib/avatar';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  ChevronLeft,
  ChevronRight,
  Info,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // User Accounts & Name Directories
  const [userAccountIds, setUserAccountIds] = useState<string[]>([]);
  const [userAccountNumbers, setUserAccountNumbers] = useState<string[]>([]);
  const [accountDirectory, setAccountDirectory] = useState<Record<string, { name: string; phone: string; userId: string }>>({});
  const [accountIdDirectory, setAccountIdDirectory] = useState<Record<string, { name: string; accountNumber: string; userId: string }>>({});

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL'); // ALL | CREDIT | DEBIT
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const supabase = createClient();

  useEffect(() => {
    async function loadTransactions() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        // 1. Fetch user's own accounts
        const { data: userAccounts } = await supabase
          .from('accounts')
          .select('id, account_number')
          .eq('owner_id', user.id);

        const myAccountIds = (userAccounts || []).map((a: any) => a.id);
        const myAccountNumbers = (userAccounts || []).map((a: any) => a.account_number);
        setUserAccountIds(myAccountIds);
        setUserAccountNumbers(myAccountNumbers);

        // 2. Fetch full directory from secure API for universal name & partial account resolution
        try {
          const dirRes = await fetch('/api/account/directory');
          const dirData = await dirRes.json();
          if (dirData.success) {
            setAccountDirectory(dirData.accountDirectory || {});
            setAccountIdDirectory(dirData.accountIdDirectory || {});
          }
        } catch (dirErr) {
          console.error('Failed to load account directory:', dirErr);
        }

        if (myAccountIds.length === 0) {
          setLoading(false);
          return;
        }

        // 3. Fetch all user transactions
        const { data: txnsData, error } = await supabase
          .from('transactions')
          .select(`
            *,
            beneficiary:beneficiaries(nickname, beneficiary_name, bank_name)
          `)
          .or(`from_account_id.in.(${myAccountIds.join(',')}),to_account_number.in.(${myAccountNumbers.join(',')})`)
          .order('created_at', { ascending: false });

        if (txnsData) {
          setTransactions(txnsData as Transaction[]);
        }
        if (error) {
          console.error('Error fetching transactions:', error);
        }
      } catch (err) {
        console.error('History load exception:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTransactions();
  }, [router, supabase]);

  // Helper to determine credit/debit, counterparty name, partial account, and avatar
  const getTransactionDetails = (txn: any) => {
    const isDirectDeposit =
      (txn.remarks &&
        (txn.remarks.includes('Deposit') ||
          txn.remarks.includes('UPI') ||
          txn.remarks.includes('Top-Up') ||
          txn.remarks.includes('Bonus') ||
          txn.remarks.includes('Cashback') ||
          txn.remarks.includes('Loan'))) ||
      txn.transaction_type === 'CREDIT';

    const isFromUser = userAccountIds.includes(txn.from_account_id);
    const isToUser = userAccountNumbers.includes(txn.to_account_number);

    let isCredit = false;
    if (isDirectDeposit && isToUser) {
      isCredit = true;
    } else if (!isFromUser && isToUser) {
      isCredit = true;
    } else if (isFromUser && !isToUser) {
      isCredit = false;
    } else if (isFromUser && isToUser) {
      isCredit = isDirectDeposit;
    }

    let counterpartyName = '';
    let partialAccount = '';
    let avatarUserId: string | undefined = undefined;

    if (isCredit) {
      // Money came IN (CREDIT)
      if (isDirectDeposit) {
        counterpartyName = txn.remarks
          ? txn.remarks.split('(')[0].trim()
          : 'UPI Instant Top-Up';
        partialAccount = `A/C: ${maskAccountNumber(txn.to_account_number)}`;
      } else if (accountIdDirectory[txn.from_account_id]) {
        const sender = accountIdDirectory[txn.from_account_id];
        counterpartyName = sender.name;
        partialAccount = `A/C: ${maskAccountNumber(sender.accountNumber)}`;
        avatarUserId = sender.userId;
      } else {
        counterpartyName = 'Inward Wire Transfer';
        partialAccount = `A/C: ${maskAccountNumber(txn.to_account_number)}`;
      }
    } else {
      // Money went OUT (DEBIT)
      if (txn.beneficiary?.beneficiary_name) {
        counterpartyName = txn.beneficiary.beneficiary_name;
        partialAccount = `A/C: ${maskAccountNumber(txn.to_account_number)}`;
      } else if (accountDirectory[txn.to_account_number]) {
        const recipient = accountDirectory[txn.to_account_number];
        counterpartyName = recipient.name;
        partialAccount = `A/C: ${maskAccountNumber(txn.to_account_number)}`;
        avatarUserId = recipient.userId;
      } else if (txn.to_account_number === 'MITP_BILLPAY_CORP') {
        counterpartyName = txn.remarks ? txn.remarks.split(':')[0] : 'Utility BillPay';
        partialAccount = 'Biller Corp (MITP)';
      } else {
        counterpartyName = `Account Holder`;
        partialAccount = `A/C: ${maskAccountNumber(txn.to_account_number)}`;
      }
    }

    return {
      isCredit,
      counterpartyName,
      partialAccount,
      avatarUserId,
    };
  };

  // Apply Client-Side Filters
  const filtered = transactions.filter((txn) => {
    const details = getTransactionDetails(txn);

    // 1. Status Filter
    if (statusFilter !== 'ALL' && txn.status !== statusFilter) {
      return false;
    }

    // 2. Type Filter (CREDIT / DEBIT)
    if (typeFilter === 'CREDIT' && !details.isCredit) return false;
    if (typeFilter === 'DEBIT' && details.isCredit) return false;

    // 3. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const refMatch = txn.reference_no.toLowerCase().includes(q);
      const remarkMatch = (txn.remarks || '').toLowerCase().includes(q);
      const toAccMatch = txn.to_account_number.includes(q);
      const nameMatch = details.counterpartyName.toLowerCase().includes(q);
      const partialMatch = details.partialAccount.toLowerCase().includes(q);
      if (!refMatch && !remarkMatch && !toAccMatch && !nameMatch && !partialMatch) {
        return false;
      }
    }

    // 4. Date Range
    if (startDate) {
      const start = new Date(startDate);
      const txnDate = new Date(txn.created_at);
      if (txnDate < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      const txnDate = new Date(txn.created_at);
      if (txnDate > end) return false;
    }

    return true;
  });

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedTransactions = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // CSV Export Function
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'Reference Number',
      'Date & Time',
      'Type',
      'Account Holder / Payee',
      'Partial Account',
      'Amount (INR)',
      'Remarks',
      'Status',
      'Failure Reason',
    ];

    const rows = filtered.map((txn) => {
      const d = getTransactionDetails(txn);
      return [
        `"${txn.reference_no}"`,
        `"${formatDate(txn.created_at)}"`,
        `"${d.isCredit ? 'CREDIT' : 'DEBIT'}"`,
        `"${d.counterpartyName.replace(/"/g, '""')}"`,
        `"${d.partialAccount}"`,
        d.isCredit ? `+${txn.amount}` : `-${txn.amount}`,
        `"${(txn.remarks || '').replace(/"/g, '""')}"`,
        `"${txn.status}"`,
        `"${(txn.failure_reason || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MIT_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
            Financial Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Transaction History & Status
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Audit trail of all incoming and outgoing payments with detailed failure reasons
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={loading || filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, account holder, account no..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Types (Credit & Debit)</option>
              <option value="CREDIT">Credits Only (Money In)</option>
              <option value="DEBIT">Debits Only (Money Out)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs font-bold bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS only</option>
              <option value="FAILED">FAILED only (Audit)</option>
              <option value="PENDING_OTP">PENDING_OTP only</option>
              <option value="CANCELLED">CANCELLED only</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-200"
              title="Start Date"
            />
          </div>
        </div>

        {(searchQuery || statusFilter !== 'ALL' || typeFilter !== 'ALL' || startDate || endDate) && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            <span>
              Showing {filtered.length} matching transaction{filtered.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setTypeFilter('ALL');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No transactions recorded</h3>
            <p className="text-xs text-slate-500 mt-1">
              No transactions match your current search and filter parameters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Date & Time</th>
                    <th className="py-3.5 px-4">Reference No</th>
                    <th className="py-3.5 px-4">Account Holder / Payee</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Remarks</th>
                    <th className="py-3.5 px-4">Status & Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedTransactions.map((txn) => {
                    const isSuccess = txn.status === 'SUCCESS';
                    const isFailed = txn.status === 'FAILED';
                    const isPending = txn.status === 'PENDING_OTP';
                    const isCancelled = txn.status === 'CANCELLED';

                    const details = getTransactionDetails(txn);

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                        {/* 1. Date & Time */}
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {formatDate(txn.created_at)}
                        </td>

                        {/* 2. Reference No */}
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          {txn.reference_no}
                        </td>

                        {/* 3. Account Holder Name & Partial Account No */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-2xs">
                              <Image
                                src={resolveAvatarUrl(
                                  null,
                                  details.counterpartyName,
                                  details.avatarUserId
                                )}
                                alt={details.counterpartyName}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                              <div
                                className={`absolute bottom-0 right-0 p-0.5 rounded-full ${
                                  details.isCredit ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                                }`}
                              >
                                {details.isCredit ? (
                                  <ArrowDownLeft className="w-2.5 h-2.5" />
                                ) : (
                                  <ArrowUpRight className="w-2.5 h-2.5" />
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                                {details.counterpartyName}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">
                                {details.partialAccount}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 4. Type Badge (CREDIT / DEBIT) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              details.isCredit
                                ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {details.isCredit ? 'CREDIT' : 'DEBIT'}
                          </span>
                        </td>

                        {/* 5. Amount (Green for Credited, Red for Debited) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-black text-sm ${
                              details.isCredit
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {details.isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                          </span>
                        </td>

                        {/* 6. Remarks */}
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                          {txn.remarks || '-'}
                        </td>

                        {/* 7. Status & Failure Reason */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isSuccess
                                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                  : isFailed
                                  ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                                  : isPending
                                  ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {isSuccess && <CheckCircle2 className="w-3 h-3" />}
                              {isFailed && <AlertCircle className="w-3 h-3" />}
                              {isPending && <Clock className="w-3 h-3" />}
                              {isCancelled && <Ban className="w-3 h-3" />}
                              <span>{txn.status}</span>
                            </span>

                            {isFailed && txn.failure_reason && (
                              <div
                                className="text-[11px] text-rose-700 dark:text-rose-300 font-medium bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-100 dark:border-rose-900/60 max-w-xs break-words"
                                title={txn.failure_reason}
                              >
                                {txn.failure_reason}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
