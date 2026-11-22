'use client';

import React from 'react';
import { Gauge, Banknote, CreditCard, ShieldCheck } from 'lucide-react';
import { ServiceType } from './ServiceModal';

interface CreditAndLoansProps {
  onSelectService: (service: ServiceType) => void;
}

export function CreditAndLoans({ onSelectService }: CreditAndLoansProps) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Credit cards & loans
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Instant credit lines & score analysis</p>
        </div>
      </div>

      {/* Grid of 3 Core Options matching reference */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
        {/* 1. CIBIL Score */}
        <button
          type="button"
          onClick={() => onSelectService('CIBIL_SCORE')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A73E8] shadow-xs text-white flex items-center justify-center group-hover:bg-[#1557B0] group-hover:shadow-md transition-all">
            <Gauge className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            CIBIL score
          </span>
        </button>

        {/* 2. Personal Loan */}
        <button
          type="button"
          onClick={() => onSelectService('PERSONAL_LOAN')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A73E8] shadow-xs text-white flex items-center justify-center group-hover:bg-[#1557B0] group-hover:shadow-md transition-all">
            <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Personal<br />loan
          </span>
        </button>

        {/* 3. Flex Credit Card */}
        <button
          type="button"
          onClick={() => onSelectService('FLEX_CREDIT_CARD')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A73E8] shadow-xs text-white flex items-center justify-center group-hover:bg-[#1557B0] group-hover:shadow-md transition-all">
            <div className="relative">
              <CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 absolute -bottom-1 -right-1" />
            </div>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Flex credit<br />card
          </span>
        </button>
      </div>
    </div>
  );
}
