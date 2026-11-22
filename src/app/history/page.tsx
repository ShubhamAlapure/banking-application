'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Transaction, Account } from '@/types/database';
import { formatCurrency, maskAccountNumber, formatDate } from '@/lib/utils';
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
} from 'lucide-react';

export default function HistoryPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
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

        // Fetch user's account IDs & account numbers
        const { data: accountsData } = await supabase
          .from('accounts')
          .select('id, account_number')
          .eq('owner_id', user.id);

        const accountIds = (accountsData || []).map((a: any) => a.id);
        const accountNumbers = (accountsData || []).map((a: any) => a.account_number);

        if (accountIds.length === 0) {
          setLoading(false);
          return;
        }

        const { data: txnsData, error } = await supabase
          .from('transactions')
          .select(`
            *,
            beneficiary:beneficiaries(nickname, beneficiary_name, bank_name)
          `)
          .or(`from_account_id.in.(${accountIds.join(',')}),to_account_number.in.(${accountNumbers.join(',')})`)
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

  // Apply Client-Side Filters
  const filtered = transactions.filter((txn) => {
    // 1. Status Filter
    if (statusFilter !== 'ALL' && txn.status !== statusFilter) {
      return false;
    }

    // 2. Search Query (reference number, remarks, to_account_number, beneficiary name)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const refMatch = txn.reference_no.toLowerCase().includes(q);
      const remarkMatch = (txn.remarks || '').toLowerCase().includes(q);
      const toAccMatch = txn.to_account_number.includes(q);
      const benMatch = (txn.beneficiary?.beneficiary_name || '').toLowerCase().includes(q);
      if (!refMatch && !remarkMatch && !toAccMatch && !benMatch) {
        return false;
      }
    }

    // 3. Date Range
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
      'From Account ID',
      'To Account',
      'Beneficiary',
      'Amount (INR)',
      'Remarks',
      'Status',
      'Failure Reason',
    ];

    const rows = filtered.map((t) => [
      t.reference_no,
      `"${new Date(t.created_at).toISOString()}"`,
      t.from_account_id,
      t.to_account_number,
      `"${t.beneficiary?.beneficiary_name || 'N/A'}"`,
      t.amount.toFixed(2),
      `"${(t.remarks || '').replace(/"/g, '""')}"`,
      t.status,
      `"${(t.failure_reason || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Financial Ledger
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Transaction History & Status
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of all incoming and outgoing payments with detailed failure reasons
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Statement</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search reference, account, remark..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">SUCCESS only</option>
              <option value="FAILED">FAILED only (Audit)</option>
              <option value="PENDING_OTP">PENDING_OTP only</option>
              <option value="CANCELLED">CANCELLED only</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              title="End Date"
            />
          </div>
        </div>

        {(searchQuery || statusFilter !== 'ALL' || startDate || endDate) && (
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>
              Showing {filtered.length} matching transaction{filtered.length === 1 ? '' : 's'}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
                setStartDate('');
                setEndDate('');
                setCurrentPage(1);
              }}
              className="text-indigo-600 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 space-y-4 animate-pulse">
            <div className="h-8 bg-slate-100 rounded-lg w-full" />
            <div className="h-8 bg-slate-100 rounded-lg w-full" />
            <div className="h-8 bg-slate-100 rounded-lg w-full" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <h3 className="text-base font-bold text-slate-700">No transactions recorded</h3>
            <p className="text-xs text-slate-500 mt-1">
              No transactions match your current search and filter parameters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Reference No</th>
                    <th className="py-3 px-4">To / Payee</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Remarks</th>
                    <th className="py-3 px-4">Status & Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedTransactions.map((txn) => {
                    const isSuccess = txn.status === 'SUCCESS';
                    const isFailed = txn.status === 'FAILED';
                    const isPending = txn.status === 'PENDING_OTP';
                    const isCancelled = txn.status === 'CANCELLED';
                    const isDeposit = (txn.remarks && (txn.remarks.includes('Deposit') || txn.remarks.includes('UPI')));

                    return (
                      <tr key={txn.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          {formatDate(txn.created_at)}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-slate-800">
                          {txn.reference_no}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">
                            {isDeposit
                              ? 'UPI Instant Top-Up'
                              : txn.beneficiary?.beneficiary_name || maskAccountNumber(txn.to_account_number)}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {maskAccountNumber(txn.to_account_number)}
                          </div>
                        </td>
                        <td className={`py-3.5 px-4 font-bold text-sm whitespace-nowrap ${isDeposit ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isDeposit ? '+' : ''}{formatCurrency(txn.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                          {txn.remarks || '-'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                isSuccess
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isFailed
                                  ? 'bg-rose-100 text-rose-800'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800'
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
                                className="text-[11px] text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded border border-rose-100 max-w-xs break-words"
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
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors"
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
