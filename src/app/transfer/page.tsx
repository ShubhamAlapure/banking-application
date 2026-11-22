'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Account, Beneficiary } from '@/types/database';
import { transferInitiateSchema, otpVerifySchema } from '@/lib/validations';
import { formatCurrency, maskAccountNumber, generateIdempotencyKey } from '@/lib/utils';
import { useDemo } from '@/context/DemoContext';
import confetti from 'canvas-confetti';
import {
  SendHorizontal,
  ArrowRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Ban,
  Wallet,
  Building2,
  Sparkles,
  Printer,
  ChevronRight,
  Check,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';

type Step = 'FORM' | 'REVIEW' | 'OTP' | 'RECEIPT';

function TransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast, addSimulatedSms, latestOtp } = useDemo();

  const [step, setStep] = useState<Step>('FORM');
  const [loading, setLoading] = useState(true);

  // Data lists
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);

  // Form Fields
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountNumber, setToAccountNumber] = useState<string>('');
  const [amountStr, setAmountStr] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [idempotencyKey, setIdempotencyKey] = useState<string>('');

  // OTP Fields
  const [otpCode, setOtpCode] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [referenceNo, setReferenceNo] = useState<string | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState<number>(3);
  const [timerSeconds, setTimerSeconds] = useState<number>(300); // 5 minutes
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // Receipt data
  const [completedTxn, setCompletedTxn] = useState<any>(null);

  // State flags
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const supabase = createClient();

  // Load user's accounts & beneficiaries
  useEffect(() => {
    async function loadData() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        const { data: accountsData } = await supabase
          .from('accounts')
          .select('*')
          .eq('owner_id', user.id);

        if (accountsData) {
          setAccounts(accountsData as Account[]);
          const defaultAcc =
            (accountsData as any[]).find((a: any) => a.id === searchParams.get('from')) ||
            (accountsData as any[]).find((a: any) => a.status === 'ACTIVE') ||
            accountsData[0];
          if (defaultAcc) setFromAccountId(defaultAcc.id);
        }

        const { data: benData } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('owner_id', user.id)
          .eq('status', 'ACTIVE');

        if (benData) {
          setBeneficiaries(benData as Beneficiary[]);
          const queryBen = (benData as any[]).find((b: any) => b.id === searchParams.get('beneficiary'));
          if (queryBen) {
            setToAccountNumber(queryBen.account_number);
          } else if (benData.length > 0) {
            setToAccountNumber(benData[0].account_number);
          }
        }

        // Initialize fresh idempotency key
        setIdempotencyKey(generateIdempotencyKey());
      } catch (err) {
        console.error('Failed to load transfer dependencies:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router, searchParams, supabase]);

  // 5-minute countdown timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerActive) {
      setIsTimerActive(false);
      setErrorMessage('The 5-minute OTP window has expired. Please initiate a new transfer.');
      addToast({
        type: 'error',
        title: 'OTP Expired',
        message: 'The verification period has timed out.',
      });
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timerSeconds, addToast]);

  const selectedFromAccount = accounts.find((a) => a.id === fromAccountId);
  const selectedBeneficiary = beneficiaries.find((b) => b.account_number === toAccountNumber);
  const numAmount = parseFloat(amountStr) || 0;

  // STEP 1 -> STEP 2: Validate and go to review
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = transferInitiateSchema.safeParse({
      fromAccountId,
      toAccountNumber,
      amount: numAmount,
      remarks,
      idempotencyKey,
    });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || 'Please check your inputs.');
      return;
    }

    if (selectedFromAccount?.status === 'FROZEN') {
      setErrorMessage('Source account is frozen. Outgoing transfers are prohibited.');
      return;
    }

    if (selectedFromAccount && numAmount > selectedFromAccount.balance) {
      setErrorMessage(
        `Insufficient balance. Available: ${formatCurrency(
          selectedFromAccount.balance
        )}, Requested: ${formatCurrency(numAmount)}.`
      );
      return;
    }

    setStep('REVIEW');
  };

  // STEP 2 -> STEP 3: Initiate transfer RPC and receive simulated OTP
  const handleInitiateTransfer = async () => {
    setErrorMessage(null);
    setSubmitting(true);

    try {
      // Call Postgres SECURITY DEFINER function via Supabase RPC
      const { data, error } = await supabase.rpc('initiate_transfer', {
        p_from_account_id: fromAccountId,
        p_to_account_number: toAccountNumber,
        p_amount: numAmount,
        p_remarks: remarks,
        p_idempotency_key: idempotencyKey,
      });

      if (error) {
        setErrorMessage(error.message || 'Transfer initiation failed.');
        setSubmitting(false);
        return;
      }

      const result = data as any;

      if (!result.success) {
        setErrorMessage(result.message || 'Validation failed.');
        setSubmitting(false);
        return;
      }

      // Successful initiation
      setTransactionId(result.transaction_id);
      setReferenceNo(result.reference_no);
      setAttemptsLeft(3);
      setTimerSeconds(300);
      setIsTimerActive(true);

      // Add to Simulated SMS Inbox
      if (result.simulated_otp) {
        addSimulatedSms({
          sender: 'VK-APEXBANK',
          otp: result.simulated_otp,
          amount: numAmount,
          recipient: selectedBeneficiary?.beneficiary_name || toAccountNumber,
          referenceNo: result.reference_no,
        });
      }

      setStep('OTP');
    } catch (err: unknown) {
      console.error('Initiate transfer error:', err);
      setErrorMessage('An unexpected error occurred while contacting the banking core.');
    } finally {
      setSubmitting(false);
    }
  };

  // STEP 3: Confirm Transfer with OTP
  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!transactionId) {
      setErrorMessage('Session invalid. Please start again.');
      return;
    }

    const validation = otpVerifySchema.safeParse({
      transactionId,
      otp: otpCode.trim(),
    });

    if (!validation.success) {
      setErrorMessage(validation.error.issues[0]?.message || 'Please enter a valid 6-digit OTP.');
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('confirm_transfer', {
        p_transaction_id: transactionId,
        p_otp: otpCode.trim(),
      });

      if (error) {
        setErrorMessage(error.message || 'OTP confirmation failed.');
        setSubmitting(false);
        return;
      }

      const result = data as any;

      if (!result.success) {
        setErrorMessage(result.message);
        if (result.attempts_left !== undefined) {
          setAttemptsLeft(result.attempts_left);
        }
        if (result.error_code === 'OTP_ATTEMPTS_EXCEEDED' || result.error_code === 'OTP_EXPIRED') {
          setIsTimerActive(false);
        }
        setSubmitting(false);
        return;
      }

      // Success!
      setIsTimerActive(false);
      setCompletedTxn(result);
      setStep('RECEIPT');

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      addToast({
        type: 'success',
        title: 'Transfer Completed',
        message: `₹${numAmount.toLocaleString('en-IN')} transferred to ${
          selectedBeneficiary?.beneficiary_name
        }.`,
      });
    } catch (err: unknown) {
      console.error('Confirm transfer error:', err);
      setErrorMessage('A network error occurred while confirming the transfer.');
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!transactionId) return;
    setErrorMessage(null);
    setSubmitting(true);

    try {
      const { data, error } = await supabase.rpc('resend_transfer_otp', {
        p_transaction_id: transactionId,
      });

      if (error) {
        setErrorMessage(error.message);
        setSubmitting(false);
        return;
      }

      const res = data as any;
      if (res.success && res.simulated_otp) {
        addSimulatedSms({
          sender: 'VK-APEXBANK',
          otp: res.simulated_otp,
          amount: numAmount,
          recipient: selectedBeneficiary?.beneficiary_name,
          referenceNo: referenceNo || '',
        });
        setTimerSeconds(300);
        setIsTimerActive(true);
        setOtpCode('');
        addToast({
          type: 'info',
          title: 'OTP Resent',
          message: 'A new simulated verification code has been dispatched.',
        });
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Cancel Transfer
  const handleCancelTransfer = async () => {
    if (!transactionId) return;
    setSubmitting(true);

    try {
      await supabase.rpc('cancel_transfer', {
        p_transaction_id: transactionId,
      });

      addToast({
        type: 'info',
        title: 'Transfer Cancelled',
        message: 'The pending transaction has been cancelled.',
      });

      router.push('/dashboard');
    } catch (err) {
      console.error('Cancel transfer error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 rounded-xl w-1/2" />
        <div className="h-96 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Step Progress Tracker */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <li className={`flex items-center gap-2 ${step === 'FORM' ? 'text-indigo-600 font-bold' : 'text-emerald-600'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs ${step === 'FORM' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-emerald-600 bg-emerald-600 text-white'}`}>
              {step !== 'FORM' ? <Check className="w-3.5 h-3.5" /> : '1'}
            </span>
            <span>Details</span>
          </li>
          <ChevronRight className="w-4 h-4 text-slate-300" />

          <li className={`flex items-center gap-2 ${step === 'REVIEW' ? 'text-indigo-600 font-bold' : step === 'OTP' || step === 'RECEIPT' ? 'text-emerald-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs ${step === 'REVIEW' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : step === 'OTP' || step === 'RECEIPT' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
              {step === 'OTP' || step === 'RECEIPT' ? <Check className="w-3.5 h-3.5" /> : '2'}
            </span>
            <span>Review</span>
          </li>
          <ChevronRight className="w-4 h-4 text-slate-300" />

          <li className={`flex items-center gap-2 ${step === 'OTP' ? 'text-indigo-600 font-bold' : step === 'RECEIPT' ? 'text-emerald-600' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs ${step === 'OTP' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : step === 'RECEIPT' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
              {step === 'RECEIPT' ? <Check className="w-3.5 h-3.5" /> : '3'}
            </span>
            <span>OTP Verification</span>
          </li>
          <ChevronRight className="w-4 h-4 text-slate-300" />

          <li className={`flex items-center gap-2 ${step === 'RECEIPT' ? 'text-emerald-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center border text-xs ${step === 'RECEIPT' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}`}>
              4
            </span>
            <span>Receipt</span>
          </li>
        </ol>
      </nav>

      {/* Error Alert Box */}
      {errorMessage && (
        <div
          role="alert"
          className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs font-medium animate-in fade-in"
        >
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold block mb-0.5">Transfer Alert:</span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 1: TRANSFER FORM */}
      {/* ============================================================== */}
      {step === 'FORM' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Step 1 of 3
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Transfer Funds
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Transfer money instantly to registered internal accounts
            </p>
          </div>

          <form onSubmit={handleProceedToReview} className="space-y-5" noValidate>
            {/* From Account */}
            <div>
              <label htmlFor="fromAccount" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Debited Account *
              </label>
              <select
                id="fromAccount"
                value={fromAccountId}
                onChange={(e) => setFromAccountId(e.target.value)}
                className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.account_type} ({maskAccountNumber(acc.account_number)}) — Bal:{' '}
                    {formatCurrency(acc.balance)} {acc.status === 'FROZEN' ? '[FROZEN]' : ''}
                  </option>
                ))}
              </select>

              {selectedFromAccount && (
                <div className="mt-2 flex items-center justify-between text-xs px-1">
                  <span className="text-slate-500">Available Balance:</span>
                  <span
                    className={`font-bold ${
                      selectedFromAccount.status === 'FROZEN'
                        ? 'text-rose-600 line-through'
                        : 'text-slate-900'
                    }`}
                  >
                    {formatCurrency(selectedFromAccount.balance)}
                  </span>
                </div>
              )}
            </div>

            {/* To Beneficiary */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="toBeneficiary" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Payee / Beneficiary *
                </label>
                <Link
                  href="/beneficiaries"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  + Add New Payee
                </Link>
              </div>

              {beneficiaries.length === 0 ? (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                  <p className="font-semibold">No registered beneficiaries found.</p>
                  <p className="mt-1">
                    You must add a beneficiary before initiating an outward transfer.
                  </p>
                  <Link
                    href="/beneficiaries"
                    className="mt-2.5 inline-block px-3 py-1.5 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700"
                  >
                    Register Beneficiary Now
                  </Link>
                </div>
              ) : (
                <select
                  id="toBeneficiary"
                  value={toAccountNumber}
                  onChange={(e) => setToAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.account_number}>
                      {b.beneficiary_name} ({b.nickname}) — {maskAccountNumber(b.account_number)} [
                      {b.bank_name}]
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor="amount" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Transfer Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base font-bold text-slate-400">
                  ₹
                </span>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="1"
                  max="100000"
                  required
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-3 text-lg font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {[500, 1000, 5000, 10000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmountStr(val.toString())}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-slate-700 transition-colors"
                  >
                    +₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
                {selectedFromAccount && selectedFromAccount.balance > 0 && (
                  <button
                    type="button"
                    onClick={() => setAmountStr(selectedFromAccount.balance.toString())}
                    className="px-2.5 py-1 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors"
                  >
                    Max (₹{selectedFromAccount.balance.toLocaleString('en-IN')})
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Allowed limits: Min ₹1.00 • Max ₹1,00,000.00 per transaction
              </p>
            </div>

            {/* Remarks */}
            <div>
              <label htmlFor="remarks" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Remarks (Optional)
              </label>
              <input
                id="remarks"
                type="text"
                maxLength={100}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Project stipend, rent, allowance"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={beneficiaries.length === 0 || selectedFromAccount?.status === 'FROZEN'}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 2: REVIEW & CONFIRMATION */}
      {/* ============================================================== */}
      {step === 'REVIEW' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Step 2 of 3
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Review Transfer Details
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Please verify all payment parameters before generating your OTP
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-slate-500">Transfer Amount</span>
              <span className="text-xl font-black text-slate-900">
                {formatCurrency(numAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">From Account</span>
              <span className="font-semibold text-slate-800">
                {selectedFromAccount?.account_type} ({selectedFromAccount?.account_number})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Beneficiary Name</span>
              <span className="font-semibold text-slate-800">
                {selectedBeneficiary?.beneficiary_name} ({selectedBeneficiary?.nickname})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Destination Account</span>
              <span className="font-mono font-semibold text-slate-800">
                {selectedBeneficiary?.account_number}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Beneficiary Bank</span>
              <span className="font-semibold text-slate-800">
                {selectedBeneficiary?.bank_name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Remarks</span>
              <span className="font-medium text-slate-700">{remarks || 'None'}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Transfer Fee</span>
              <span className="font-bold text-emerald-600">₹0.00 (Zero Fee Demo)</span>
            </div>

            <div className="flex items-center justify-between text-slate-500">
              <span>Remaining Balance After Transfer</span>
              <span className="font-bold text-slate-800">
                {formatCurrency((selectedFromAccount?.balance || 0) - numAmount)}
              </span>
            </div>
          </div>

          {/* Idempotency Protection Indicator */}
          <div className="flex items-center gap-2 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-[11px] text-indigo-800">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              Protected by Double-Click Prevention & Idempotency Key (
              <span className="font-mono">{idempotencyKey.slice(0, 12)}...</span>)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep('FORM')}
              disabled={submitting}
              className="w-1/3 py-3 px-4 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleInitiateTransfer}
              disabled={submitting}
              className="w-2/3 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Request Simulated OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 3: OTP VERIFICATION */}
      {/* ============================================================== */}
      {step === 'OTP' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Step 3 of 3 • Step-Up Security
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Enter Verification Code
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              A 6-digit simulated OTP was delivered to your on-screen SMS inbox for reference{' '}
              <span className="font-mono font-semibold text-slate-800">{referenceNo}</span>
            </p>
          </div>

          {/* Simulated SMS Panel Prompt */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Simulated OTP – no SMS is sent (Offline Demo)</span>
            </div>
            {latestOtp && (
              <button
                type="button"
                onClick={() => setOtpCode(latestOtp)}
                className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors shadow-2xs"
              >
                Auto-Fill {latestOtp}
              </button>
            )}
          </div>

          <form onSubmit={handleConfirmOtp} className="space-y-5" noValidate>
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider">
                  6-Digit OTP Code
                </span>
                <div className="flex items-center gap-1.5 font-mono text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  <span className={timerSeconds < 60 ? 'text-rose-600 font-bold' : ''}>
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
              </div>

              {/* Single accessible input with inputmode numeric and monospace letter-spacing */}
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="\d{6}"
                required
                autoFocus
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full py-4 text-center text-3xl font-mono font-black tracking-[0.5em] text-indigo-700 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-600 transition-all"
              />

              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Attempts remaining:</span>
                <span className={`font-bold ${attemptsLeft === 1 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {attemptsLeft} of 3
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || otpCode.length !== 6 || timerSeconds === 0}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify & Execute Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={submitting}
              className="text-indigo-600 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resend New OTP</span>
            </button>

            <button
              type="button"
              onClick={handleCancelTransfer}
              disabled={submitting}
              className="text-rose-600 font-semibold hover:underline flex items-center gap-1"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Cancel Transfer</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* STEP 4: SUCCESS RECEIPT */}
      {/* ============================================================== */}
      {step === 'RECEIPT' && completedTxn && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Payment Successful
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              {formatCurrency(completedTxn.amount)} Transferred
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Transaction has been atomically settled and committed to the ledger
            </p>
          </div>

          {/* Receipt Breakdown Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left text-xs space-y-2.5 font-sans">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-slate-500">Transaction Reference</span>
              <span className="font-mono font-bold text-slate-900">
                {completedTxn.reference_no}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">From Account</span>
              <span className="font-mono font-medium text-slate-800">
                {completedTxn.from_account_number}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">To Beneficiary</span>
              <span className="font-semibold text-slate-800">
                {selectedBeneficiary?.beneficiary_name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">To Account</span>
              <span className="font-mono font-medium text-slate-800">
                {completedTxn.to_account_number}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Payment Status</span>
              <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">
                {completedTxn.status}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-400">
              <span>Timestamp</span>
              <span>{new Date().toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('FORM');
                setAmountStr('');
                setRemarks('');
                setOtpCode('');
                setIdempotencyKey(generateIdempotencyKey());
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors"
            >
              <span>Make Another Transfer</span>
            </button>

            <Link
              href="/history"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <span>View in History</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TransferPage() {
  return (
    <Suspense fallback={<div className="max-w-2xl mx-auto px-4 py-12"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>}>
      <TransferContent />
    </Suspense>
  );
}
