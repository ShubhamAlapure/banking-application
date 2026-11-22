'use client';

import React from 'react';
import { Smartphone, Tv, Lightbulb, Car, ChevronRight } from 'lucide-react';
import { ServiceType } from './ServiceModal';

interface BillsAndRechargesProps {
  onSelectService: (service: ServiceType) => void;
}

export function BillsAndRecharges({ onSelectService }: BillsAndRechargesProps) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Bills & recharges
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Instant zero-fee utility settlements</p>
        </div>
        <button
          type="button"
          onClick={() => onSelectService('MOBILE_RECHARGE')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-0.5 cursor-pointer"
        >
          <span>Manage</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Row 1: Fast Branded Telecom & FASTag Operators */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center">
        {/* 1. ICICI FASTag */}
        <button
          type="button"
          onClick={() => onSelectService('ICICI_FASTAG')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-white shadow-xs border-2 border-slate-200 dark:border-slate-300 flex items-center justify-center p-2.5 group-hover:border-orange-400 group-hover:shadow-md transition-all">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="48" fill="#FFF" />
              {/* ICICI stylized i */}
              <circle cx="50" cy="28" r="9" fill="#F37021" />
              <path
                d="M41 44C41 41 44 41 50 41C56 41 59 41 59 44V72C59 75 56 75 50 75C44 75 41 75 41 72V44Z"
                fill="#B82228"
              />
              <path
                d="M32 46C34 40 40 37 50 37C60 37 66 40 68 46"
                stroke="#F37021"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            ICICI<br />FASTag
          </span>
        </button>

        {/* 2. Airtel Prepaid */}
        <button
          type="button"
          onClick={() => onSelectService('AIRTEL_PREPAID')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E40000] shadow-xs flex items-center justify-center p-3 group-hover:scale-105 group-hover:shadow-md transition-all">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              {/* Stylized Airtel lowercase a swoosh */}
              <path
                d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C62 80 72.3 72.8 77 62.5C76 62.8 74.8 63 73.5 63C65 63 58 56 58 47.5C58 39 65 32 73.5 32C74.8 32 76 32.2 77 32.5C72.3 22.2 62 15 50 20Z"
                fill="#FFF"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Airtel<br />Prepaid
          </span>
        </button>

        {/* 3. BSNL Prepaid */}
        <button
          type="button"
          onClick={() => onSelectService('BSNL_PREPAID')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-white shadow-xs border-2 border-slate-200 dark:border-slate-300 flex items-center justify-center p-2.5 group-hover:border-blue-400 group-hover:shadow-md transition-all">
            <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
              <circle cx="50" cy="50" r="48" fill="#FFF" />
              {/* BSNL converging arrows */}
              <path
                d="M25 42C30 32 45 28 58 35L48 42L72 45L62 23L53 30C36 22 20 30 15 42L25 42Z"
                fill="#003399"
              />
              <path
                d="M75 58C70 68 55 72 42 65L52 58L28 55L38 77L47 70C64 78 80 70 85 58L75 58Z"
                fill="#CC0000"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            BSNL<br />Prepaid
          </span>
        </button>

        {/* 4. Jio Prepaid */}
        <button
          type="button"
          onClick={() => onSelectService('JIO_PREPAID')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0050CF] shadow-xs flex items-center justify-center p-2 group-hover:scale-105 group-hover:shadow-md transition-all">
            <span className="text-white font-black text-xl sm:text-2xl tracking-tighter select-none font-sans">
              Jio
            </span>
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Jio<br />Prepaid
          </span>
        </button>
      </div>

      {/* Row 2: Four Core Utility Services */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 text-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
        {/* Mobile Recharge */}
        <button
          type="button"
          onClick={() => onSelectService('MOBILE_RECHARGE')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A73E8] shadow-xs text-white flex items-center justify-center group-hover:bg-[#1557B0] group-hover:shadow-md transition-all">
            <Smartphone className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Mobile<br />recharge
          </span>
        </button>

        {/* DTH / Cable TV */}
        <button
          type="button"
          onClick={() => onSelectService('DTH')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A73E8] shadow-xs text-white flex items-center justify-center group-hover:bg-[#1557B0] group-hover:shadow-md transition-all">
            <Tv className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            DTH / Cable<br />TV
          </span>
        </button>

        {/* Electricity */}
        <button
          type="button"
          onClick={() => onSelectService('ELECTRICITY')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A73E8] shadow-xs text-white flex items-center justify-center group-hover:bg-[#1557B0] group-hover:shadow-md transition-all">
            <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            Electricity
          </span>
        </button>

        {/* FASTag Recharge */}
        <button
          type="button"
          onClick={() => onSelectService('FASTAG_RECHARGE')}
          className="group flex flex-col items-center gap-2 cursor-pointer transition-transform active:scale-95"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A73E8] shadow-xs text-white flex items-center justify-center group-hover:bg-[#1557B0] group-hover:shadow-md transition-all">
            <Car className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
            FASTag<br />recharge
          </span>
        </button>
      </div>
    </div>
  );
}
