'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  SendHorizontal,
  ArrowRight,
  Lock,
  Smartphone,
  CheckCircle2,
  CreditCard,
  TrendingUp,
  Percent,
  Clock,
  PhoneCall,
  Check,
  ExternalLink,
  Shield,
  Wallet,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Award,
  Globe,
  Coins,
  ArrowUpRight,
  Bell,
  Fingerprint,
} from 'lucide-react';

export default function HomePage() {
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showStickyPill, setShowStickyPill] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // 1. Calculate scroll progress for the phone mockup reveal section
      if (scrollSectionRef.current) {
        const rect = scrollSectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Progress calculates as the section scrolls from below the viewport up into view
        const totalDistance = windowHeight + rect.height;
        const currentDistance = windowHeight - rect.top;
        const progress = Math.min(Math.max(currentDistance / (totalDistance * 0.75), 0), 1);
        setScrollProgress(progress);
      }

      // 2. Toggle floating sticky pill after scrolling past hero
      if (window.scrollY > 400) {
        setShowStickyPill(true);
      } else {
        setShowStickyPill(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-transparent selection:bg-indigo-600 selection:text-white relative">
      {/* ============================================================== */}
      {/* 1. HERO SECTION WITH ILLUMINATING SQUARES GRID */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Illuminating Squares Grid Background */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-0">
          {/* Ambient Radial Illumination */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-teal-400/10 blur-[100px] rounded-full" />

          {/* High-Tech Squares Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_45%,black_35%,transparent_85%)]" />

          {/* Lightly Illuminating Square Tiles */}
          <div className="absolute top-[48px] left-[15%] w-[48px] h-[48px] bg-indigo-500/15 border border-indigo-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[96px] right-[18%] w-[48px] h-[48px] bg-blue-500/15 border border-blue-400/40 rounded-xl animate-tile-fast" />
          <div className="absolute top-[144px] left-[8%] w-[48px] h-[48px] bg-sky-500/15 border border-sky-400/40 rounded-xl animate-tile-cyan" />
          <div className="absolute top-[192px] right-[10%] w-[48px] h-[48px] bg-indigo-500/15 border border-indigo-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[144px] left-[78%] w-[48px] h-[48px] bg-blue-500/15 border border-blue-400/40 rounded-xl animate-tile-fast" />
          <div className="absolute top-[240px] left-[18%] w-[48px] h-[48px] bg-violet-500/15 border border-violet-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[288px] right-[24%] w-[48px] h-[48px] bg-indigo-500/20 border border-indigo-400/50 rounded-xl animate-tile-cyan" />
          <div className="absolute top-[336px] left-[32%] w-[48px] h-[48px] bg-sky-500/15 border border-sky-400/40 rounded-xl animate-tile-fast" />
          <div className="absolute top-[384px] right-[16%] w-[48px] h-[48px] bg-teal-500/15 border border-teal-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[240px] right-[38%] w-[48px] h-[48px] bg-indigo-500/15 border border-indigo-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[96px] left-[44%] w-[48px] h-[48px] bg-indigo-400/15 border border-indigo-300/40 rounded-xl animate-tile-fast" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Regulatory Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-2xs backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Regulated Scheduled Commercial Banking Institution</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
            Modern Banking Built for Your <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600">
              Financial Growth.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Enjoy instant zero-fee transfers, high-yield digital savings accounts, automated payee management, and 256-bit bank-grade security built for both personal and enterprise needs.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-base font-bold shadow-lg shadow-indigo-200 transition-all group"
            >
              <span>Open an Account Online</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-base font-bold transition-all shadow-xs hover:border-slate-300"
            >
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Sign in to Online Banking</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Zero Account Opening Fees</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Instant IMPS & NEFT Settlements</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted Core</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SCROLL-DRIVEN PHONE MOCKUP REVEAL SECTION (INSPIRATION 1-3) */}
      {/* ============================================================== */}
      <section
        ref={scrollSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full"
      >
        {/* Intro Tagline & CTA Button (Like in Image 1 top) */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm sm:text-base font-semibold text-slate-600">
            Open a Safe Second Account with Apex Trust Bank
          </p>
          <div className="mt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-slate-300 transition-all hover:scale-[1.02]"
            >
              <span>Open Account Today</span>
            </Link>
          </div>
        </div>

        {/* The Big Card with Scroll-Animated Phone Mockup */}
        <div className="bg-gradient-to-b from-white via-slate-50/60 to-rose-50/20 rounded-[36px] sm:rounded-[48px] border border-slate-200/90 shadow-sm relative overflow-hidden p-6 sm:p-12 lg:p-16">
          {/* Subtle Ambient Blush In Top Background */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-rose-200/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-[450px] h-[350px] bg-indigo-100/30 blur-[100px] rounded-full pointer-events-none" />

          {/* Heading Label */}
          <div className="relative z-10">
            <p className="text-base sm:text-xl font-light text-slate-600 tracking-tight">
              Know Your Daily Transaction
            </p>
            {/* Giant 'Account' Typography spanning horizontally */}
            <h2 className="text-6xl sm:text-8xl lg:text-[140px] font-black text-slate-900 tracking-tighter leading-none mt-1 select-none">
              Account
            </h2>
          </div>

          {/* Grid Layout: Left Features & Right Animated Phone Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-8 lg:mt-12 items-end relative z-10">
            {/* Left Column: Key Features & Active Users */}
            <div className="lg:col-span-7 space-y-8 sm:space-y-10 pb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Feature 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 text-slate-800">
                    <Coins className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      Zero minimum balance
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      No hidden charges or minimum balance penalty required ever.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 text-slate-800">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      Instant account opening
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Quick & hassle-free, so you can enjoy instant digital liquidity right away.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stat Counter */}
              <div className="pt-4 border-t border-slate-200/80">
                <div className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight">
                  2.5M+
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Active Account Holders
                </p>
              </div>

              {/* App Store Download Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-black text-white rounded-xl shadow-xs cursor-pointer hover:bg-slate-800 transition-colors">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.122 2.122 0 0 1-.61-1.503V3.317c0-.585.228-1.12.609-1.503zM15.207 13.414l2.122 2.122-12.87 7.43 10.748-9.552zm0-2.828L4.46 1.034l12.868 7.43-2.121 2.122zm1.414 1.414l3.772 2.178c.848.49 1.348 1.34 1.348 2.222 0 .882-.5 1.732-1.348 2.222l-3.772 2.178-2.122-2.122 2.122-2.122z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-wider text-slate-300 leading-none">GET IT ON</p>
                    <p className="text-xs font-bold leading-tight">Google Play</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5 bg-black text-white rounded-xl shadow-xs cursor-pointer hover:bg-slate-800 transition-colors">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.03.62-2.67 1.37-.56.64-1.05 1.7-0.92 2.73 1.02.08 2.06-.48 2.67-1.23z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-wider text-slate-300 leading-none">Download on the</p>
                    <p className="text-xs font-bold leading-tight">App Store</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Scroll-Driven Animated Phone Mockup */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div
                className="w-full max-w-[320px] sm:max-w-[340px] rounded-[52px] bg-slate-950 p-3 shadow-2xl ring-1 ring-slate-800 transition-transform duration-200 ease-out will-change-transform"
                style={{
                  transform: `translateY(${Math.max(0, (1 - scrollProgress) * 140)}px)`,
                  opacity: 0.75 + scrollProgress * 0.25,
                }}
              >
                {/* Phone Outer Screen Container */}
                <div className="rounded-[44px] bg-white overflow-hidden border border-slate-100 flex flex-col shadow-inner">
                  {/* Phone Speaker & Dynamic Island Header */}
                  <div className="pt-3 pb-2 px-6 bg-slate-900 text-white flex items-center justify-between text-[11px] font-semibold">
                    <span>9:41</span>
                    {/* Dynamic Island Pill */}
                    <div className="w-20 h-4 bg-black rounded-full flex items-center justify-end px-2 gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-800" />
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/80" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-2 border border-white/80 rounded-xs flex items-center px-0.5">
                        <div className="w-full h-1 bg-white" />
                      </div>
                    </div>
                  </div>

                  {/* App Screen Content */}
                  <div className="p-4 space-y-4 bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
                    {/* In-App Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                          RS
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium leading-none">Apex Digital</p>
                          <p className="text-xs font-bold text-slate-800 leading-tight">Rahul Sharma</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <Bell className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Savings Account Card */}
                    <div className="bg-gradient-to-br from-indigo-50/90 to-blue-50/70 p-4 rounded-2xl border border-indigo-100/80 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span>SAVINGS A/C</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="text-xl font-black text-slate-900 mt-1">
                        ₹1,00,000.00
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        earn 7.15% interest p.a.*
                      </p>

                      <div className="mt-3">
                        <Link
                          href="/transfer"
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <SendHorizontal className="w-3 h-3 text-indigo-400" />
                          <span>SEND MONEY</span>
                        </Link>
                      </div>
                    </div>

                    {/* Debit Card & Fixed Deposit Small Split Cards */}
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">DEBIT CARD</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </div>
                          <p className="text-[10px] text-slate-600 mt-1">Active Visa</p>
                        </div>
                        <div className="mt-2 w-full h-8 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 flex items-center justify-between px-2 text-white">
                          <CreditCard className="w-3.5 h-3.5" />
                          <span className="text-[9px] font-mono font-bold">•••• 4444</span>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">FIXED DEPOSIT</span>
                            <ChevronRight className="w-3 h-3 text-slate-400" />
                          </div>
                          <p className="text-[11px] font-black text-indigo-600 mt-1">7.85% p.a.</p>
                        </div>
                        <div className="mt-2 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-center">
                          High Growth
                        </div>
                      </div>
                    </div>

                    {/* Banking Services 4-Icon Grid */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Banking Services
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-slate-700">
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            ₹
                          </div>
                          <span className="text-[9px]">Pay</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <SendHorizontal className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px]">Send</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px]">History</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px]">Safe</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. 'TIMES CHANGE' SECTION WITH SWEEPING RAINBOW ARC (IMAGE 4) */}
      {/* ============================================================== */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Sweeping Rainbow / Vibrant Gradient Arc in Background */}
        <div className="absolute top-28 left-0 right-0 h-44 bg-gradient-to-r from-blue-400/25 via-indigo-500/25 to-rose-400/25 blur-3xl rounded-full transform -rotate-1 pointer-events-none" />

        <div className="mb-14 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Times change.
          </h2>
          <p className="text-xl sm:text-2xl text-slate-600 font-light mt-1">
            The way you bank should too!
          </p>
        </div>

        {/* 3 Staggered / Offset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start relative z-10">
          {/* Card 1: Get Rewarded! with growth chart & floating transaction history */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Get rewarded!
              </h3>

              {/* Interest Rate */}
              <div className="mt-4">
                <span className="text-xs text-slate-400 font-semibold block">Earn up to</span>
                <span className="text-4xl font-black text-slate-900">7.15%</span>
                <span className="text-sm font-bold text-slate-500 ml-1">p.a.</span>
                <p className="text-xs text-slate-500 mt-1">
                  Monthly compounded returns on all depository tiers.
                </p>
              </div>

              {/* Upward Growth SVG Curve */}
              <div className="mt-6 mb-2">
                <svg viewBox="0 0 200 60" className="w-full h-16 text-indigo-600 stroke-current fill-none">
                  <path
                    d="M 10 50 Q 60 45, 100 30 T 190 10"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="50" r="3.5" fill="#4f46e5" />
                  <circle cx="100" cy="30" r="3.5" fill="#4f46e5" />
                  <circle cx="190" cy="10" r="4.5" fill="#4f46e5" />
                </svg>
              </div>
            </div>

            {/* Floating Overlapping Mini Transaction Card */}
            <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 shadow-2xs text-xs mt-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-slate-800">Clear & clutter-free</span>
                <span className="text-[10px] text-emerald-600 font-bold">+₹12,500</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                Keeping transactions neatly indexed with real-time audit receipts.
              </p>
            </div>
          </div>

          {/* Card 2 (Lower offset): Don't expose primary account with frosted glass shield */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[420px] md:mt-8">
            {/* Luminous Frosted Security Shield Graphic */}
            <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-teal-50/60 border border-indigo-100/60 flex items-center justify-center relative overflow-hidden mb-6">
              <div className="w-24 h-24 rounded-full bg-indigo-500/10 blur-xl absolute" />
              <div className="w-20 h-24 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center text-indigo-600 relative z-10">
                <ShieldCheck className="w-10 h-10 text-indigo-600" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Don&apos;t expose primary account
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Daily debit transactions are completely isolated from your core savings for fraud-proof peace of mind.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>Zero Risk Isolation</span>
              <Check className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          {/* Card 3 (Higher offset): Rewards 123 benefits */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[420px]">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                Rewards 123 benefits
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                Unlock consistent institutional benefits every single time you transact.
              </p>

              {/* 3 Tier Points */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Zero transaction fee on all domestic transfers
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Complimentary virtual multi-currency cards
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Automated high-yield interest sweep-in
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link href="/register" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                <span>View Full Benefits Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. 'AT YOUR FINGERTIPS' BENTO GRID (IMAGE 5) */}
      {/* ============================================================== */}
      <section className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="mb-14 text-center sm:text-left">
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight lowercase">
            at your fingertips
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
            Intelligent digital banking services designed for seamless daily control.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Card 1: Safe Pay (4 cols) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Safe Pay</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2.5">
                Our cryptographic network intelligence ensures no money leaves your account without your explicit two-factor approval.
              </p>
            </div>

            {/* Glowing Frosted Shield Illustration */}
            <div className="my-8 py-10 rounded-2xl bg-gradient-to-br from-rose-50/60 via-indigo-50/40 to-slate-50 border border-slate-100 flex items-center justify-center relative">
              <div className="w-24 h-24 rounded-full bg-rose-400/20 blur-xl absolute" />
              <div className="w-20 h-24 rounded-2xl bg-white/90 backdrop-blur-md border border-rose-200/60 shadow-lg flex items-center justify-center text-rose-600 group-hover:scale-105 transition-transform">
                <Fingerprint className="w-10 h-10 text-indigo-600" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/transfer"
                className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
              >
                <span>Learn More About Safe Pay</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Virtual & Eco-Friendly Debit Cards (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Good for you — great for the planet!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                Eco-friendly digital & contactless cards ready for instant mobile payments and online checkout.
              </p>
            </div>

            {/* Tilted Cards Display Area with 3D Abstract Loop */}
            <div className="my-6 py-8 relative flex items-center justify-center overflow-hidden min-h-[200px]">
              {/* Abstract 3D Arc Aura */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-amber-300/15 to-blue-500/10 blur-2xl rounded-full" />

              {/* Tilted Black Card */}
              <div className="w-56 h-34 rounded-2xl bg-slate-900 text-white p-4 shadow-xl border border-slate-700 transform -rotate-12 group-hover:-rotate-6 transition-transform relative z-10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-indigo-300">APEX PLATINUM</span>
                  <CreditCard className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <p className="text-[11px] font-mono tracking-widest text-slate-300">•••• •••• •••• 8820</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">RAHUL SHARMA</p>
                </div>
              </div>

              {/* Tilted Blue Card */}
              <div className="w-56 h-34 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-700 text-white p-4 shadow-2xl border border-indigo-400/50 transform rotate-6 -ml-16 group-hover:rotate-12 transition-transform relative z-20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-white">APEX DIGITAL</span>
                  <div className="w-5 h-3 bg-amber-400/80 rounded-xs" />
                </div>
                <div>
                  <p className="text-[11px] font-mono tracking-widest text-white">•••• •••• •••• 4444</p>
                  <p className="text-[9px] text-indigo-200 mt-0.5">PRIYA DESHMUKH</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/register"
                className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
              >
                <span>Choose Your Card</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Smart investments (6 cols) */}
          <div className="md:col-span-6 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Smart investments</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                Make your money work as hard as you do with institutional yields and automated sweeps.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 my-6">
              <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/60 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">DIGITAL TREASURY</span>
                <p className="text-lg font-black text-slate-900 mt-1">99.9% Liquid</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Automated overnight yields</p>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200/60 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">TERM DEPOSIT</span>
                <p className="text-lg font-black text-indigo-600 mt-1">7.85% p.a.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Fixed interest compounding</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/register"
                className="text-xs font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1.5"
              >
                <span>Explore Investment Solutions</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Banking Made Transparent (6 cols) */}
          <div className="md:col-span-6 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Banking Made Transparent</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                Understand charges, terms, and fee waivers clearly. No fine print traps or unexpected balance deductions.
              </p>
            </div>

            <div className="space-y-2.5 my-6">
              <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Account Maintenance Charges</span>
                <span className="font-bold text-emerald-600">₹0.00 / month</span>
              </div>
              <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-700">Digital Fund Transfers (IMPS/NEFT)</span>
                <span className="font-bold text-emerald-600">Zero Fee</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-900 hover:text-indigo-600 flex items-center gap-1.5"
              >
                <span>Understand Schedule of Charges</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. FLOATING STICKY ACTION PILL (LIKE IN IMAGES 4 & 5) */}
      {/* ============================================================== */}
      {showStickyPill && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Link
            href="/register"
            className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-950/90 hover:bg-black text-white rounded-full shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 group"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-[10px] font-bold group-hover:rotate-12 transition-transform">
              <Building2 className="w-3 h-3" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight">Open Bank Account</span>
          </Link>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. CALL TO ACTION FOOTER BANNER */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Experience Premier Banking?
          </h2>
          <p className="mt-3 text-indigo-100 text-sm max-w-xl mx-auto leading-relaxed">
            Open an account online in less than 3 minutes with zero paperwork and immediate access to digital funds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-indigo-700 hover:bg-indigo-50 rounded-xl text-sm font-bold shadow-md transition-all"
            >
              Get Started Now
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-800/60 hover:bg-indigo-800 text-white border border-indigo-400/40 rounded-xl text-sm font-bold transition-all"
            >
              Customer Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. PROFESSIONAL FOOTER */}
      {/* ============================================================== */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-50 to-blue-50 p-1 border border-indigo-100 shadow-2xs flex items-center justify-center">
                  <img src="/logo.png" alt="Apex Trust Bank" className="w-full h-full object-contain filter drop-shadow-xs" />
                </div>
                <span className="text-base font-black text-slate-900">Apex Trust Bank</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Headquartered at Financial District, Apex Tower, Pune, MH. Licensed commercial banking provider.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-[11px]">
                Accounts & Deposits
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/register" className="hover:text-indigo-600">Savings Account</Link></li>
                <li><Link href="/register" className="hover:text-indigo-600">Current Corporate Account</Link></li>
                <li><Link href="/register" className="hover:text-indigo-600">Term Deposits</Link></li>
                <li><Link href="/register" className="hover:text-indigo-600">Foreign Currency Accounts</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-[11px]">
                Digital Services
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/login" className="hover:text-indigo-600">Internet NetBanking</Link></li>
                <li><Link href="/transfer" className="hover:text-indigo-600">IMPS & Wire Transfers</Link></li>
                <li><Link href="/beneficiaries" className="hover:text-indigo-600">Payee Directory</Link></li>
                <li><Link href="/history" className="hover:text-indigo-600">E-Statements</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-[11px]">
                Security & Support
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li><span className="text-slate-600">24/7 Helpline: 1800-112-233</span></li>
                <li><span className="text-slate-600">Fraud Desk: 1800-999-000</span></li>
                <li><span className="text-slate-600">help@apextrust.bank</span></li>
                <li><span className="text-emerald-600 font-semibold">256-Bit SSL Certified</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
            <p>© 2026 Apex Trust Bank Limited. All rights reserved.</p>
            <div className="flex gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Security Practices</span>
              <span>Regulatory Disclosures</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
