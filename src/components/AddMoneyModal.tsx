'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Copy,
  Check,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Building2,
  CheckCircle2,
  Loader2,
  QrCode,
  ArrowLeft,
} from 'lucide-react';
import { Account } from '@/types/database';
import { formatCurrency, maskAccountNumber } from '@/lib/utils';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSuccess: (newBalance: number) => void;
}

type Step = 'ENTER_AMOUNT' | 'SCAN_QR' | 'SUCCESS';

export default function AddMoneyModal({
  isOpen,
  onClose,
  account,
  onSuccess,
}: AddMoneyModalProps) {
  const [step, setStep] = useState<Step>('ENTER_AMOUNT');
  const [amount, setAmount] = useState<string>('1000');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [receipt, setReceipt] = useState<{
    newBalance: number;
    referenceNo: string;
    amount: number;
  } | null>(null);

  if (!isOpen || !account) return null;

  const quickAmounts = [500, 1000, 2000, 5000, 10000];
  const parsedAmount = parseFloat(amount) || 0;
  const currentBalance = Number(account.balance || 0);
  const projectedBalance = currentBalance + parsedAmount;
  const upiId = 'shubhamalapure55-1@okhdfcbank';
  const ifscCode = 'MITP0001001';

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyAcc = () => {
    navigator.clipboard.writeText(account.account_number);
    setCopiedAcc(true);
    setTimeout(() => setCopiedAcc(false), 2000);
  };

  const handleProceedToQR = () => {
    if (parsedAmount <= 0) {
      setErrorMsg('Please enter an amount greater than ₹0.');
      return;
    }
    if (parsedAmount > 500000) {
      setErrorMsg('Maximum deposit limit per transaction is ₹5,00,000.');
      return;
    }
    setErrorMsg(null);
    setStep('SCAN_QR');
  };

  const handleConfirmPaymentDone = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/account/add-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: account.id,
          amount: parsedAmount,
          upiId,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to process deposit.');
      }

      setReceipt({
        newBalance: data.newBalance,
        referenceNo: data.referenceNo,
        amount: data.amount,
      });

      onSuccess(data.newBalance);
      setStep('SUCCESS');
    } catch (err: any) {
      console.error('Add money error:', err);
      setErrorMsg(err?.message || 'Failed to add money. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('ENTER_AMOUNT');
    setAmount('1000');
    setErrorMsg(null);
    setReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[92vh] flex flex-col scale-in-95">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                {step === 'ENTER_AMOUNT' && 'Add Money to Primary Account'}
                {step === 'SCAN_QR' && 'Scan & Pay via UPI QR'}
                {step === 'SUCCESS' && 'Payment Completed!'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {step === 'ENTER_AMOUNT' && 'Instant UPI Top-Up • Zero Convenience Fee'}
                {step === 'SCAN_QR' && `Complete payment of ${formatCurrency(parsedAmount)} to deposit`}
                {step === 'SUCCESS' && 'Funds credited immediately to your balance'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center justify-between">
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg(null)}
                className="text-rose-500 hover:text-rose-700 ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ================= STEP 1: ENTER AMOUNT & REVIEW DETAILS ================= */}
          {step === 'ENTER_AMOUNT' && (
            <>
              {/* Depository Account Details Card */}
              <div className="p-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs text-indigo-200 font-bold">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-400" />
                    <span>MIT Payments Bank • Primary Account</span>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    ACTIVE
                  </span>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                      Account Number
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-base sm:text-lg font-black tracking-wider">
                        {account.account_number}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAcc}
                        className="p-1 hover:bg-white/10 rounded text-slate-300 hover:text-white transition-colors"
                        title="Copy Account Number"
                      >
                        {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                      Current Balance
                    </span>
                    <div className="text-lg font-black text-emerald-300">
                      {formatCurrency(currentBalance)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-400">IFSC Code:</span>{' '}
                    <span className="font-mono font-bold text-white">{ifscCode}</span>
                  </div>
                  <div className="text-right truncate">
                    <span className="text-slate-400">UPI VPA:</span>{' '}
                    <span className="font-mono font-bold text-indigo-200">{upiId}</span>
                  </div>
                </div>
              </div>

              {/* Useful Assurance Badges */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Zap className="w-3.5 h-3.5 text-indigo-600 mx-auto mb-0.5" />
                  <span className="text-[10px] font-bold text-slate-700 block">Instant Settlement</span>
                  <span className="text-[9px] text-slate-400">Under 1 second</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mx-auto mb-0.5" />
                  <span className="text-[10px] font-bold text-slate-700 block">Zero Fee</span>
                  <span className="text-[9px] text-slate-400">100% Free deposit</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <QrCode className="w-3.5 h-3.5 text-purple-600 mx-auto mb-0.5" />
                  <span className="text-[10px] font-bold text-slate-700 block">Any UPI App</span>
                  <span className="text-[9px] text-slate-400">GPay, PhonePe, Paytm</span>
                </div>
              </div>

              {/* Enter Amount Section */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Enter Amount to Add
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-black text-xl">
                    ₹
                  </div>
                  <input
                    type="number"
                    min="1"
                    max="500000"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1,000"
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-2xl text-2xl font-black text-slate-900 tracking-tight transition-all outline-hidden"
                  />
                </div>

                {/* Quick Selection Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  {quickAmounts.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setAmount(q.toString())}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${
                        parsedAmount === q
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      +₹{q.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Projected Balance Preview */}
                {parsedAmount > 0 && (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs flex items-center justify-between text-emerald-900">
                    <span className="font-medium">Estimated New Balance:</span>
                    <span className="font-mono font-black text-sm text-emerald-800">
                      {formatCurrency(projectedBalance)}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleProceedToQR}
                  disabled={parsedAmount <= 0}
                  className="w-2/3 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-100 transition-all flex items-center justify-center gap-2"
                >
                  <span>Proceed to UPI QR</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {/* ================= STEP 2: CROPPED QR POPUP ================= */}
          {step === 'SCAN_QR' && (
            <div className="space-y-4 text-center">
              {/* Payment Amount Callout */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Amount to Pay
                </span>
                <div className="text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  {formatCurrency(parsedAmount)}
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Depositing to Primary A/C: {maskAccountNumber(account.account_number)}
                </span>
              </div>

              {/* Cropped QR Code Card Display */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative p-2.5 bg-white rounded-2xl border-2 border-slate-200 shadow-md inline-block">
                  <div className="relative w-64 h-72 sm:w-72 sm:h-80 overflow-hidden rounded-xl bg-slate-50 flex items-center justify-center">
                    <Image
                      src="/upi-qr-card.png"
                      alt="UPI Payment QR Code"
                      fill
                      className="object-contain p-1"
                      priority
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium mt-3">
                  Scan to pay with Google Pay, PhonePe, Paytm, BHIM, or any UPI app
                </p>
              </div>

              {/* UPI ID Copy Bar */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 text-left truncate">
                  <span className="text-slate-400 font-medium">UPI ID:</span>
                  <span className="font-mono font-bold text-slate-800 truncate">{upiId}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition-all shrink-0 flex items-center gap-1"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-left text-amber-900 text-[11px] space-y-1">
                <p className="font-bold">Instructions:</p>
                <p>1. Open your UPI App and scan this QR code.</p>
                <p>2. Pay the exact amount of <span className="font-bold">{formatCurrency(parsedAmount)}</span>.</p>
                <p>3. Click <span className="font-bold">Done</span> below once the transfer is completed to credit your balance.</p>
              </div>

              {/* Action Buttons: Cancel vs Done */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep('ENTER_AMOUNT')}
                  disabled={loading}
                  className="w-1/3 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmPaymentDone}
                  disabled={loading}
                  className="w-2/3 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Crediting Account...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Done (I Have Paid {formatCurrency(parsedAmount)})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SUCCESS CONFIRMATION ================= */}
          {step === 'SUCCESS' && receipt && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                  Funds Deposited Successfully!
                </h4>
                <p className="text-xs text-slate-500">
                  Your UPI deposit has been settled and added to your primary account.
                </p>
              </div>

              {/* Receipt Summary Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Credited Amount</span>
                  <span className="text-lg font-black text-emerald-600">
                    +{formatCurrency(receipt.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">New Account Balance</span>
                  <span className="text-base font-black text-slate-900">
                    {formatCurrency(receipt.newBalance)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Reference No</span>
                  <span className="font-mono font-bold text-slate-700">{receipt.referenceNo}</span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Mode</span>
                  <span className="font-semibold text-slate-700">UPI Instant Settlement</span>
                </div>
              </div>

              {/* Done & Return Button */}
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-sm"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
