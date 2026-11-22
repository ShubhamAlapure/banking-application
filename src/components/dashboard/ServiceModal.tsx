'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  Zap,
  ShieldCheck,
  Smartphone,
  Tv,
  Lightbulb,
  Car,
  Gauge,
  CreditCard,
  Banknote,
  Trophy,
  Tag,
  Gift,
  Share2,
  Handshake,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Account } from '@/types/database';
import { formatCurrency, maskAccountNumber } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export type ServiceType =
  | 'MOBILE_RECHARGE'
  | 'AIRTEL_PREPAID'
  | 'JIO_PREPAID'
  | 'BSNL_PREPAID'
  | 'ICICI_FASTAG'
  | 'FASTAG_RECHARGE'
  | 'DTH'
  | 'ELECTRICITY'
  | 'CIBIL_SCORE'
  | 'PERSONAL_LOAN'
  | 'FLEX_CREDIT_CARD'
  | 'REWARDS'
  | 'OFFERS'
  | 'REFERRALS'
  | 'POCKET_MONEY';

interface ServiceModalProps {
  isOpen: boolean;
  service: ServiceType | null;
  onClose: () => void;
  account: Account | null;
  onBalanceUpdated: (newBalance: number) => void;
  userPhone?: string;
  userName?: string;
}

export default function ServiceModal({
  isOpen,
  service,
  onClose,
  account,
  onBalanceUpdated,
  userPhone = '+91 93226 10932',
  userName = 'Shubham Alapure',
}: ServiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<{
    title: string;
    amount: number;
    refNo: string;
    details: string;
  } | null>(null);

  // Recharge State
  const [phoneInput, setPhoneInput] = useState(userPhone.replace(/\D/g, '').slice(-10) || '9322610932');
  const [selectedPlan, setSelectedPlan] = useState<number>(299);

  // Electricity State
  const [consumerNumber, setConsumerNumber] = useState('1029485736');
  const [electricityBoard, setElectricityBoard] = useState('Mahavitaran (MSEDCL)');

  // FASTag State
  const [vehicleNumber, setVehicleNumber] = useState('MH 12 AB 1234');
  const [fastagAmount, setFastagAmount] = useState<number>(500);

  // Loan State
  const [loanAmount, setLoanAmount] = useState<number>(100000);
  const [tenureMonths, setTenureMonths] = useState<number>(12);

  // Rewards State
  const [scratched, setScratched] = useState(false);
  const [claimedCashback, setClaimedCashback] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setLoading(false);
      setReceipt(null);
      setScratched(false);
      setClaimedCashback(false);
    }
  }, [isOpen, service]);

  if (!isOpen || !service || !account) return null;

  const currentBalance = Number(account.balance || 0);
  const supabase = createClient();

  const generateRef = () => `MIT${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;

  const executeDeduction = async (amount: number, description: string) => {
    setLoading(true);
    try {
      if (currentBalance < amount) {
        alert('Insufficient account balance to complete this transaction.');
        setLoading(false);
        return;
      }

      const newBalance = currentBalance - amount;
      const refNo = generateRef();

      // Update account balance
      const { error: accErr } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      if (!accErr) {
        // Record transaction
        await supabase.from('transactions').insert({
          from_account_id: account.id,
          to_account_number: 'MITP_BILLPAY_CORP',
          amount,
          status: 'SUCCESS',
          reference_no: refNo,
          remarks: description,
          transaction_type: 'DEBIT',
        } as any);

        onBalanceUpdated(newBalance);
      }

      setReceipt({
        title: description,
        amount,
        refNo,
        details: `Debited from A/C: ${maskAccountNumber(account.account_number)}`,
      });
      setSuccess(true);
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('Payment processing failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async (cashbackAmount: number) => {
    if (claimedCashback) return;
    setLoading(true);
    try {
      const newBalance = currentBalance + cashbackAmount;
      const refNo = generateRef();

      await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      await supabase.from('transactions').insert({
        from_account_id: account.id,
        to_account_number: account.account_number,
        amount: cashbackAmount,
        status: 'SUCCESS',
        reference_no: refNo,
        remarks: 'MIT Rewards Gold Trophy Cashback Credit',
        transaction_type: 'CREDIT',
      } as any);

      onBalanceUpdated(newBalance);
      setClaimedCashback(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (err) {
      console.error('Reward claim failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisburseLoan = async () => {
    setLoading(true);
    try {
      const newBalance = currentBalance + loanAmount;
      const refNo = generateRef();

      await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', account.id);

      await supabase.from('transactions').insert({
        from_account_id: account.id,
        to_account_number: account.account_number,
        amount: loanAmount,
        status: 'SUCCESS',
        reference_no: refNo,
        remarks: `Personal Loan Instant Disbursal (${tenureMonths} Mo @ 10.49%)`,
        transaction_type: 'CREDIT',
      } as any);

      onBalanceUpdated(newBalance);
      setReceipt({
        title: 'Instant Personal Loan Disbursed',
        amount: loanAmount,
        refNo,
        details: `Credited to A/C: ${maskAccountNumber(account.account_number)} • EMI: ₹${Math.round(
          (loanAmount * 1.09) / tenureMonths
        )}/mo`,
      });
      setSuccess(true);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.55 } });
    } catch (err) {
      console.error('Loan disbursal error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100 leading-tight">
                {service.replace(/_/g, ' ')}
              </h3>
              <span className="text-[11px] text-slate-400">MIT Payments Fast Pay Hub</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* SUCCESS RECEIPT STATE */}
          {success && receipt ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
                  Payment Successful
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  {formatCurrency(receipt.amount)}
                </h4>
                <p className="text-xs text-slate-500 mt-1">{receipt.title}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Reference No:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{receipt.refNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-emerald-600">Settled (0.00s Instant)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Account:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{maskAccountNumber(account.account_number)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span className="text-slate-400">Updated Balance:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatCurrency(account.balance)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* 1. MOBILE & OPERATOR RECHARGES */}
              {(service === 'MOBILE_RECHARGE' ||
                service === 'AIRTEL_PREPAID' ||
                service === 'JIO_PREPAID' ||
                service === 'BSNL_PREPAID') && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Mobile Number
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-500">+91</span>
                      <input
                        type="text"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="bg-transparent text-sm font-bold text-slate-900 dark:text-slate-100 w-full outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Popular Unlimited Plans
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { amt: 299, validity: '28 Days', data: '1.5 GB/Day', desc: 'Unlimited Calls + 100 SMS' },
                        { amt: 349, validity: '28 Days', data: '2.0 GB/Day', desc: '5G Unlimited + OTT Pack' },
                        { amt: 719, validity: '84 Days', data: '1.5 GB/Day', desc: 'Bestseller Long Term' },
                        { amt: 999, validity: '84 Days', data: '3.0 GB/Day', desc: 'True Unlimited 5G' },
                      ].map((plan) => (
                        <div
                          key={plan.amt}
                          onClick={() => setSelectedPlan(plan.amt)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                            selectedPlan === plan.amt
                              ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-base font-black text-slate-900 dark:text-slate-100">
                              ₹{plan.amt}
                            </span>
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                              {plan.validity}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                            {plan.data}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{plan.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Pay from Savings:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      Balance: {formatCurrency(currentBalance)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      executeDeduction(
                        selectedPlan,
                        `Mobile Recharge: ${service.replace('_PREPAID', '')} (+91 ${phoneInput})`
                      )
                    }
                    disabled={loading || currentBalance < selectedPlan}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    <span>Pay ₹{selectedPlan}.00 Now</span>
                  </button>
                </div>
              )}

              {/* 2. ELECTRICITY BILL */}
              {service === 'ELECTRICITY' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Electricity Provider / Board
                    </label>
                    <select
                      value={electricityBoard}
                      onChange={(e) => setElectricityBoard(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 outline-hidden"
                    >
                      <option>Mahavitaran (MSEDCL) - Maharashtra</option>
                      <option>Tata Power - Mumbai & Delhi</option>
                      <option>Adani Electricity Mumbai Limited</option>
                      <option>BSES Rajdhani Power - Delhi</option>
                      <option>BESCOM - Bengaluru</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Consumer / CA Number
                    </label>
                    <input
                      type="text"
                      value={consumerNumber}
                      onChange={(e) => setConsumerNumber(e.target.value)}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 outline-hidden"
                      placeholder="e.g. 1029485736"
                    />
                  </div>

                  {/* Fetched Bill Card */}
                  <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        Bill Due: 28th Nov 2026
                      </span>
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-full">
                        FETCHED
                      </span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                      ₹1,450.00
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Consumer Name: {userName} • Billing Cycle: Oct-Nov 2026
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      executeDeduction(1450, `Electricity Bill: ${electricityBoard} (CA: ${consumerNumber})`)
                    }
                    disabled={loading || currentBalance < 1450}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
                    <span>Pay Bill ₹1,450.00</span>
                  </button>
                </div>
              )}

              {/* 3. FASTAG RECHARGE */}
              {(service === 'ICICI_FASTAG' || service === 'FASTAG_RECHARGE') && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Vehicle Registration Number
                    </label>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 uppercase outline-hidden"
                      placeholder="MH 12 AB 1234"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
                      Top-Up Amount
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[500, 1000, 2000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setFastagAmount(amt)}
                          className={`py-2.5 rounded-xl text-xs font-extrabold border transition-all ${
                            fastagAmount === amt
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-300 flex items-center gap-2">
                    <Car className="w-4 h-4 shrink-0 text-blue-600" />
                    <span>Instant NETC FASTag sync across NHAI national toll plazas</span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      executeDeduction(fastagAmount, `FASTag Top-Up: ${vehicleNumber} (ICICI NETC)`)
                    }
                    disabled={loading || currentBalance < fastagAmount}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Car className="w-4 h-4" />}
                    <span>Recharge FASTag ₹{fastagAmount}.00</span>
                  </button>
                </div>
              )}

              {/* 4. DTH / CABLE TV */}
              {service === 'DTH' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      DTH Operator
                    </label>
                    <select className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-800 dark:text-slate-100 outline-hidden">
                      <option>Tata Play (Tata Sky)</option>
                      <option>Airtel Digital TV</option>
                      <option>Dish TV</option>
                      <option>Sun Direct</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      Subscriber ID / Smartcard Number
                    </label>
                    <input
                      type="text"
                      defaultValue="3019485726"
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono font-bold text-slate-900 dark:text-slate-100 outline-hidden"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => executeDeduction(450, 'DTH Monthly Pack Recharge: Tata Play (3019485726)')}
                    disabled={loading || currentBalance < 450}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Tv className="w-4 h-4" />}
                    <span>Pay DTH Pack ₹450.00</span>
                  </button>
                </div>
              )}

              {/* 5. CIBIL SCORE */}
              {service === 'CIBIL_SCORE' && (
                <div className="space-y-5 text-center py-2">
                  <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
                    {/* Visual speedometer circle */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-slate-200 dark:stroke-slate-800"
                        strokeWidth="10"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-emerald-500"
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset="35"
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        784
                      </span>
                      <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest mt-0.5">
                        EXCELLENT
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-left">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Payment History</span>
                      <span className="text-xs font-bold text-emerald-600 block mt-0.5">100% On-Time</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Credit Usage</span>
                      <span className="text-xs font-bold text-indigo-600 block mt-0.5">12% (Low)</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Credit Age</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                        4.2 Years
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500">
                    Your credit score qualifies you for pre-approved instant loans up to ₹5,00,000 at 10.49% p.a.
                  </p>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Close Report
                  </button>
                </div>
              )}

              {/* 6. PERSONAL LOAN */}
              {service === 'PERSONAL_LOAN' && (
                <div className="space-y-4">
                  <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-200/80 text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
                    <span className="font-bold">Pre-Approved Offer:</span>
                    <span className="font-black text-emerald-600">Up to ₹5,00,000 @ 10.49%</span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Loan Amount Needed
                      </label>
                      <span className="text-sm font-black text-indigo-600">
                        {formatCurrency(loanAmount)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="25000"
                      max="500000"
                      step="25000"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-1">
                      <span>₹25,000</span>
                      <span>₹5,00,000</span>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Monthly EMI:</span>
                      <span className="text-base font-black text-slate-900 dark:text-slate-100 block mt-0.5">
                        ₹{Math.round((loanAmount * 1.09) / tenureMonths).toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Tenure:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                        {tenureMonths} Months
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisburseLoan}
                    disabled={loading}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Banknote className="w-4 h-4" />}
                    <span>Disburse {formatCurrency(loanAmount)} Instantly</span>
                  </button>
                </div>
              )}

              {/* 7. FLEX CREDIT CARD */}
              {service === 'FLEX_CREDIT_CARD' && (
                <div className="space-y-4">
                  {/* Metal Card Preview */}
                  <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-white/10">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-xs font-black tracking-widest text-indigo-300">
                        MIT PLATINUM FLEX
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                        LIFETIME FREE
                      </span>
                    </div>
                    <div className="text-lg font-mono tracking-widest font-black my-4">
                      4532 •••• •••• 9812
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>{userName.toUpperCase()}</span>
                      <span>EXP 09/31</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>5% unlimited cashback on dining, food & flight bookings</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Zero annual fee, zero joining fee forever</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Complimentary domestic airport lounge access</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Congratulations! Your MIT Flex Credit Card application has been pre-approved.');
                      onClose();
                    }}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Activate Digital Card Now
                  </button>
                </div>
              )}

              {/* 8. REWARDS & SCRATCH CARDS */}
              {service === 'REWARDS' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                    <Trophy className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                      You Have 1 Lucky Scratch Card!
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tap or scratch to reveal your assured MIT bank cashback reward
                    </p>
                  </div>

                  {/* Interactive Scratch Card */}
                  <div
                    onClick={() => setScratched(true)}
                    className={`relative w-64 h-40 mx-auto rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all border-2 ${
                      scratched
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 shadow-md scale-102'
                        : 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 shadow-lg hover:scale-105'
                    }`}
                  >
                    {scratched ? (
                      <div className="animate-in zoom-in duration-300 space-y-1">
                        <Sparkles className="w-6 h-6 text-amber-500 mx-auto" />
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-100 block">
                          ₹75.00
                        </span>
                        <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block">
                          Assured Bank Cashback!
                        </span>
                      </div>
                    ) : (
                      <div className="text-white space-y-1">
                        <Gift className="w-8 h-8 mx-auto" />
                        <span className="text-sm font-extrabold block">Tap to Scratch</span>
                        <span className="text-[10px] opacity-80 block">Assured Cashback up to ₹500</span>
                      </div>
                    )}
                  </div>

                  {scratched && (
                    <button
                      type="button"
                      onClick={() => handleClaimReward(75)}
                      disabled={claimedCashback || loading}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {claimedCashback ? <Check className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
                      <span>{claimedCashback ? 'Credited to Savings Account' : 'Claim ₹75 to Bank Account'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* 9. OFFERS */}
              {service === 'OFFERS' && (
                <div className="space-y-3">
                  {[
                    { partner: 'Zomato & Swiggy', discount: 'Flat ₹120 Off', code: 'MITFOOD120', category: 'Dining' },
                    { partner: 'Amazon India', discount: '10% Instant Discount', code: 'MITPRIME10', category: 'Shopping' },
                    { partner: 'MakeMyTrip', discount: 'Up to ₹2,500 Off', code: 'MITTRAVEL', category: 'Flights' },
                    { partner: 'BookMyShow', discount: 'Buy 1 Get 1 Free', code: 'MITCINEMA', category: 'Movies' },
                  ].map((offer) => (
                    <div
                      key={offer.partner}
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-extrabold text-pink-600 uppercase tracking-wider block">
                          {offer.category}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block">
                          {offer.partner}
                        </span>
                        <span className="text-xs font-black text-emerald-600 block mt-0.5">
                          {offer.discount}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                          {offer.code}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 10. REFERRALS */}
              {service === 'REFERRALS' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center mx-auto">
                    <Share2 className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                      Invite Friends & Earn ₹250
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Both you and your friend receive ₹250 instant welcome credit when they register an MIT account!
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                      https://mitpaymentsbank.vercel.app/register?ref=SHUBHAM9322
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('https://mitpaymentsbank.vercel.app/register?ref=SHUBHAM9322');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shrink-0 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 11. POCKET MONEY */}
              {service === 'POCKET_MONEY' && (
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center mx-auto">
                    <Handshake className="w-7 h-7" />
                  </div>

                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
                      MIT Smart Family Pocket Money
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Set up automated monthly allowances, sub-wallets, and spend controls for children or family members.
                    </p>
                  </div>

                  <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sub-Wallet Balance:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">₹2,000.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Allowance Rule:</span>
                      <span className="font-bold text-indigo-600">₹2,000 on 1st of every month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Linked Minor Account:</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">A/C: 100099887711</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert('Pocket money allowance rules are active!');
                      onClose();
                    }}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Manage Pocket Money Settings
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
