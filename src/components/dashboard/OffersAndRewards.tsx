'use client';

import React from 'react';
import { Trophy, Tag, Gift, Handshake } from 'lucide-react';
import { ServiceType } from './ServiceModal';

interface OffersAndRewardsProps {
  onSelectService: (service: ServiceType) => void;
}

export function OffersAndRewards({ onSelectService }: OffersAndRewardsProps) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Offers & rewards
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Exclusive partner perks & cash bonuses</p>
        </div>
      </div>

      {/* Grid of 4 Options matching reference image */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center">
        {/* 1. Rewards */}
        <button
          type="button"
          onClick={() => onSelectService('REWARDS')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
        >
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#F9BB04] to-[#F29900] shadow-xs text-white flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all">
            <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white/20" />
            {/* New notification indicator dot */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-500 border-2 border-white dark:border-[#111827] rounded-full" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Rewards
          </span>
        </button>

        {/* 2. Offers */}
        <button
          type="button"
          onClick={() => onSelectService('OFFERS')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#EA4335] to-[#D93025] shadow-xs text-white flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all">
            <Tag className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white/20" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Offers
          </span>
        </button>

        {/* 3. Referrals */}
        <button
          type="button"
          onClick={() => onSelectService('REFERRALS')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A73E8] shadow-xs text-white flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all">
            {/* Two phones icon representation */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="8" height="16" rx="2" />
              <rect x="14" y="4" width="8" height="16" rx="2" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Referrals
          </span>
        </button>

        {/* 4. Pocket money */}
        <button
          type="button"
          onClick={() => onSelectService('POCKET_MONEY')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95 text-center"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#F29900] to-[#E37400] shadow-xs text-white flex items-center justify-center group-hover:scale-105 group-hover:shadow-md transition-all">
            <Handshake className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Pocket<br />money
          </span>
        </button>
      </div>
    </div>
  );
}
