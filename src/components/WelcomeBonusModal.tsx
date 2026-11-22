'use client';

import React from 'react';
import { PartyPopper, Gift, Sparkles, CheckCircle2, ArrowRight, X, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrency, maskAccountNumber } from '@/lib/utils';

interface WelcomeBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: () => void;
  userName: string;
  accountNumber?: string;
  bonusAmount?: number;
}

export default function WelcomeBonusModal({
  isOpen,
  onClose,
  onAddMoney,
  userName,
  accountNumber = '400050822485',
  bonusAmount = 5000,
}: WelcomeBonusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-in-95">
        {/* Top Decorative Header Banner */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 p-8 text-white text-center overflow-hidden">
          {/* Subtle background glow circles */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-inner mb-3">
            <PartyPopper className="w-8 h-8 text-amber-300 animate-bounce" />
          </div>

          <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-300/30 rounded-full text-[11px] font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>New Member Welcome Benefit</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Congratulations, {userName}!
          </h2>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-md mx-auto">
            Your MIT Payments Bank digital account is fully active and ready for transactions.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Welcome Balance Highlight Card */}
          <div className="p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50/40 rounded-2xl border border-emerald-200/80 shadow-xs flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Credited Welcome Balance</span>
              </div>
              <div className="text-3xl font-black text-slate-900 tracking-tight">
                {formatCurrency(bonusAmount)}
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Primary Account: {maskAccountNumber(accountNumber)}
              </p>
            </div>

            <div className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-black shadow-xs shrink-0 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Available Now</span>
            </div>
          </div>

          {/* Key Advantages Grid */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Instant 24/7 UPI</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Send & receive money in seconds with zero downtime.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Minimum Balance</span>
              </div>
              <p className="text-[11px] text-slate-500">
                No penalty or maintenance charges required ever.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onAddMoney();
              }}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Add Money to Account</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
            >
              Explore Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
