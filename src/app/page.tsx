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
  QrCode,
  Zap,
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
    <div className="flex flex-col min-h-screen bg-transparent selection:bg-rose-600 selection:text-white relative">
      {/* ============================================================== */}
      {/* 1. HERO SECTION WITH ILLUMINATING SQUARES GRID */}
      {/* ============================================================== */}
      <section className="relative overflow-hidden pt-14 pb-20 lg:pt-24 lg:pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Illuminating Squares Grid Background */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden -z-0">
          {/* Ambient Radial Illumination */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-gradient-to-tr from-rose-500/15 via-indigo-500/10 to-blue-400/10 blur-[100px] rounded-full" />

          {/* High-Tech Squares Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(225,29,72,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(225,29,72,0.08)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_65%_at_50%_45%,black_35%,transparent_85%)]" />

          {/* Lightly Illuminating Square Tiles */}
          <div className="absolute top-[48px] left-[15%] w-[48px] h-[48px] bg-rose-500/15 border border-rose-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[96px] right-[18%] w-[48px] h-[48px] bg-indigo-500/15 border border-indigo-400/40 rounded-xl animate-tile-fast" />
          <div className="absolute top-[144px] left-[8%] w-[48px] h-[48px] bg-sky-500/15 border border-sky-400/40 rounded-xl animate-tile-cyan" />
          <div className="absolute top-[192px] right-[10%] w-[48px] h-[48px] bg-rose-500/15 border border-rose-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[144px] left-[78%] w-[48px] h-[48px] bg-blue-500/15 border border-blue-400/40 rounded-xl animate-tile-fast" />
          <div className="absolute top-[240px] left-[18%] w-[48px] h-[48px] bg-violet-500/15 border border-violet-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[288px] right-[24%] w-[48px] h-[48px] bg-rose-500/20 border border-rose-400/50 rounded-xl animate-tile-cyan" />
          <div className="absolute top-[336px] left-[32%] w-[48px] h-[48px] bg-sky-500/15 border border-sky-400/40 rounded-xl animate-tile-fast" />
          <div className="absolute top-[384px] right-[16%] w-[48px] h-[48px] bg-teal-500/15 border border-teal-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[240px] right-[38%] w-[48px] h-[48px] bg-rose-500/15 border border-rose-400/40 rounded-xl animate-tile-slow" />
          <div className="absolute top-[96px] left-[44%] w-[48px] h-[48px] bg-rose-400/15 border border-rose-300/40 rounded-xl animate-tile-fast" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Regulatory Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50/90 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-2xs backdrop-blur-xs">
            <ShieldCheck className="w-4 h-4 text-rose-600" />
            <span>RBI Licensed Scheduled Payments Bank</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
            India&apos;s Smart Second Account for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-700 to-indigo-900">
              Daily Payments.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Isolate your daily UPI, shopping, and bill payments from your primary savings account. Zero minimum balance, instant transfers, and 256-bit bank-grade cryptographic security.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-base font-bold shadow-lg shadow-rose-200 transition-all group"
            >
              <span>Open an Account Online</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-base font-bold transition-all shadow-xs hover:border-slate-300"
            >
              <Lock className="w-4 h-4 text-rose-600" />
              <span>Sign in to NetBanking</span>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Zero Minimum Balance Requirement</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Instant IMPS & UPI 24x7</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Free Virtual Debit Card</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SCROLL-DRIVEN PHONE MOCKUP REVEAL SECTION */}
      {/* ============================================================== */}
      <section
        ref={scrollSectionRef}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 w-full"
      >
        {/* Intro Tagline & CTA Button (Like in Image 1 top) */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-sm sm:text-base font-semibold text-slate-600">
            Open a Safe Second Account with MIT Payments Bank
          </p>
          <div className="mt-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-950 hover:bg-black text-white rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg shadow-slate-300 transition-all hover:scale-[1.02]"
            >
              <span>Open Account Today</span>
            </Link>
          </div>
        </div>

        {/* The Big Card with Scroll-Animated Phone Mockup */}
        <div className="bg-gradient-to-b from-white via-slate-50/70 to-rose-50/30 rounded-[36px] sm:rounded-[48px] border border-slate-200/90 shadow-sm relative overflow-hidden p-6 sm:p-12 lg:p-16">
          {/* Subtle Ambient Blush In Top Background */}
          <div className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-rose-200/25 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-[450px] h-[350px] bg-indigo-100/30 blur-[100px] rounded-full pointer-events-none" />

          {/* Grid Layout: Left Features & Right Animated Phone Mockup */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
            {/* Left Column: Rich Content & Value Proposition (Eliminates the empty look!) */}
            <div className="lg:col-span-7 space-y-7">
              {/* Category Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                <span>Smart Digital Banking Core</span>
              </div>

              {/* Headings */}
              <div>
                <p className="text-base sm:text-lg font-medium text-slate-500 tracking-tight">
                  Know Your Daily Transaction
                </p>
                <h2 className="text-5xl sm:text-7xl lg:text-[96px] font-black text-slate-900 tracking-tighter leading-[0.95] mt-1 select-none">
                  Digital <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-indigo-900">Account</span>
                </h2>
                <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-xl">
                  Keep your main bank balance private and safe. Route daily UPI transfers, cab rides, food deliveries, and online shopping through an isolated MIT Payments Bank digital account.
                </p>
              </div>

              {/* 4-Feature Matrix (Fills the space with high-value points!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Feature 1 */}
                <div className="p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-2xs hover:border-rose-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-2.5">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Zero minimum balance</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    No hidden charges or non-maintenance penalty required ever.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-2xs hover:border-rose-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2.5">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Instant 2-minute KYC</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    100% digital onboarding with immediate account number generation.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-2xs hover:border-rose-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">7.15% p.a. High Yield</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Earn daily compounding interest credited monthly into your balance.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="p-4 bg-white/80 backdrop-blur-xs rounded-2xl border border-slate-200/80 shadow-2xs hover:border-rose-200 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">Fraud-Proof Isolation</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Protect your life savings by isolating routine merchant payments.
                  </p>
                </div>
              </div>

              {/* Stat Counters Row */}
              <div className="pt-4 border-t border-slate-200/80 flex items-center gap-8">
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">2.5M+</div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Active Users</p>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div>
                  <div className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">₹45,000 Cr+</div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Processed Annually</p>
                </div>
                <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                <div className="hidden sm:block">
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">99.99%</div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Uptime Reliability</p>
                </div>
              </div>

              {/* App Store Download Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-black text-white rounded-xl shadow-xs cursor-pointer hover:bg-slate-800 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186a2.122 2.122 0 0 1-.61-1.503V3.317c0-.585.228-1.12.609-1.503zM15.207 13.414l2.122 2.122-12.87 7.43 10.748-9.552zm0-2.828L4.46 1.034l12.868 7.43-2.121 2.122zm1.414 1.414l3.772 2.178c.848.49 1.348 1.34 1.348 2.222 0 .882-.5 1.732-1.348 2.222l-3.772 2.178-2.122-2.122 2.122-2.122z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-wider text-slate-300 leading-none">GET IT ON</p>
                    <p className="text-xs font-bold leading-tight">Google Play</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-4 py-2.5 bg-black text-white rounded-xl shadow-xs cursor-pointer hover:bg-slate-800 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.9.04-2.03.62-2.67 1.37-.56.64-1.05 1.7-0.92 2.73 1.02.08 2.06-.48 2.67-1.23z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[9px] uppercase tracking-wider text-slate-300 leading-none">Download on the</p>
                    <p className="text-xs font-bold leading-tight">App Store</p>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-200 transition-colors"
                >
                  Launch Web Banking →
                </Link>
              </div>
            </div>

            {/* Right Column: Properly Proportioned Flagship Smartphone Mockup (Point 2 Solved!) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
              <div
                className="w-[330px] sm:w-[350px] h-[710px] sm:h-[725px] rounded-[56px] bg-slate-950 p-[11px] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] ring-1 ring-slate-800 transition-transform duration-200 ease-out will-change-transform relative flex flex-col justify-between select-none"
                style={{
                  transform: `translateY(${Math.max(0, (1 - scrollProgress) * 140)}px)`,
                  opacity: 0.8 + scrollProgress * 0.2,
                }}
              >
                {/* Mechanical Hardware Side Buttons */}
                <div className="absolute -left-[4px] top-[120px] w-[3px] h-[36px] bg-slate-700 rounded-l-xs" />
                <div className="absolute -left-[4px] top-[170px] w-[3px] h-[36px] bg-slate-700 rounded-l-xs" />
                <div className="absolute -right-[4px] top-[140px] w-[3px] h-[48px] bg-slate-700 rounded-r-xs" />

                {/* Phone Screen Container */}
                <div className="rounded-[46px] bg-white h-full overflow-hidden border border-slate-100 flex flex-col justify-between shadow-inner">
                  {/* Phone Header / Dynamic Island */}
                  <div className="pt-3 pb-2 px-6 bg-slate-950 text-white flex items-center justify-between text-[11px] font-semibold">
                    <span>9:41</span>
                    {/* Dynamic Island Capsule */}
                    <div className="w-24 h-5 bg-black rounded-full flex items-center justify-end px-2 gap-1.5 shadow-inner">
                      <div className="w-2 h-2 rounded-full bg-slate-900 border border-slate-800" />
                      <div className="w-2 h-2 rounded-full bg-indigo-900/90" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold">5G</span>
                      <div className="w-4 h-2.5 border border-white/80 rounded-xs flex items-center px-0.5">
                        <div className="w-full h-1.5 bg-white rounded-2xs" />
                      </div>
                    </div>
                  </div>

                  {/* Scrollable / Full App Canvas */}
                  <div className="flex-1 p-4 space-y-3.5 bg-gradient-to-b from-slate-50 via-white to-slate-50/60 overflow-y-auto">
                    {/* In-App Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-auto flex items-center">
                          <img src="/logo.png" alt="MIT Payments Bank" className="h-6 w-auto object-contain" />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-medium leading-none">NetBanking</p>
                          <p className="text-xs font-bold text-slate-800 leading-tight">Rahul Sharma</p>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 relative">
                        <Bell className="w-3.5 h-3.5" />
                        <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1" />
                      </div>
                    </div>

                    {/* Primary Savings Account Card */}
                    <div className="bg-gradient-to-br from-rose-50/90 via-white to-indigo-50/70 p-4 rounded-2xl border border-rose-100/90 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        <span>MIT DIGITAL SAVINGS</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                        ₹1,00,000.00
                      </div>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                        earn 7.15% interest p.a. • Zero fees
                      </p>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Link
                          href="/transfer"
                          className="py-2 bg-slate-950 hover:bg-black text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs"
                        >
                          <SendHorizontal className="w-3 h-3 text-rose-400" />
                          <span>SEND MONEY</span>
                        </Link>
                        <button
                          type="button"
                          className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 border border-rose-200"
                        >
                          <span>+ ADD FUNDS</span>
                        </button>
                      </div>
                    </div>

                    {/* Banking Services 4-Icon Grid */}
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Quick Banking
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-semibold text-slate-700">
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-rose-50 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
                            <QrCode className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px]">Scan UPI</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-indigo-50 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                            <SendHorizontal className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px]">Transfer</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                            <Clock className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px]">Passbook</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-emerald-50 transition-colors">
                          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Shield className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[9px]">SafePay</span>
                        </div>
                      </div>
                    </div>

                    {/* Realistic Virtual Debit Card */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950 text-white shadow-md relative overflow-hidden">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-bold tracking-widest text-rose-300">MIT PLATINUM DEBIT</span>
                        <div className="w-5 h-3.5 bg-amber-400/90 rounded-xs" />
                      </div>
                      <div className="my-2">
                        <p className="text-[12px] font-mono tracking-widest text-slate-200">•••• •••• •••• 8820</p>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-white/10">
                        <span>RAHUL SHARMA</span>
                        <span className="text-white font-bold">RuPay</span>
                      </div>
                    </div>

                    {/* Mini Transaction Activity List */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <span>Recent Transactions</span>
                        <Link href="/history" className="text-rose-600 hover:underline">View All</Link>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-[10px]">
                            +
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-[11px] leading-none">Salary Credit</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">Automated Payroll</p>
                          </div>
                        </div>
                        <span className="font-bold text-emerald-600 text-[11px]">+₹12,500</span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-white border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                            -
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-[11px] leading-none">Priya Deshmukh</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">IMPS Fund Transfer</p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-[11px]">-₹5,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Home Indicator Bar */}
                  <div className="py-2 bg-white flex justify-center">
                    <div className="w-32 h-1 bg-slate-900/30 rounded-full" />
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
        <div className="absolute top-28 left-0 right-0 h-44 bg-gradient-to-r from-rose-400/25 via-indigo-500/25 to-blue-400/25 blur-3xl rounded-full transform -rotate-1 pointer-events-none" />

        <div className="mb-14 relative z-10">
          <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Times change.
          </h2>
          <p className="text-xl sm:text-2xl text-slate-600 font-light mt-1">
            The way you pay should too!
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
                <svg viewBox="0 0 200 60" className="w-full h-16 text-rose-600 stroke-current fill-none">
                  <path
                    d="M 10 50 Q 60 45, 100 30 T 190 10"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="10" cy="50" r="3.5" fill="#e11d48" />
                  <circle cx="100" cy="30" r="3.5" fill="#e11d48" />
                  <circle cx="190" cy="10" r="4.5" fill="#e11d48" />
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
            <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-rose-50/80 via-indigo-50/40 to-teal-50/60 border border-rose-100/60 flex items-center justify-center relative overflow-hidden mb-6">
              <div className="w-24 h-24 rounded-full bg-rose-500/10 blur-xl absolute" />
              <div className="w-20 h-24 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 shadow-md flex items-center justify-center text-rose-600 relative z-10">
                <ShieldCheck className="w-10 h-10 text-rose-600" />
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

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-rose-600">
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
                <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/60">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Zero transaction fee on all domestic transfers
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/60">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Complimentary virtual multi-currency cards
                  </span>
                </div>

                <div className="flex items-center gap-3 p-3 bg-rose-50/50 rounded-xl border border-rose-100/60">
                  <span className="w-6 h-6 rounded-lg bg-rose-600 text-white font-bold text-xs flex items-center justify-center">
                    3
                  </span>
                  <span className="text-xs font-semibold text-slate-800">
                    Automated high-yield interest sweep-in
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link href="/register" className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1">
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
          {/* Card 1: Safe Pay (5 cols) */}
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
                <Fingerprint className="w-10 h-10 text-rose-600" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/transfer"
                className="text-xs font-bold text-slate-900 group-hover:text-rose-600 flex items-center gap-1.5 transition-colors"
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
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-amber-300/15 to-indigo-500/10 blur-2xl rounded-full" />

              {/* Tilted Black Card */}
              <div className="w-56 h-34 rounded-2xl bg-slate-900 text-white p-4 shadow-xl border border-slate-700 transform -rotate-12 group-hover:-rotate-6 transition-transform relative z-10 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-rose-300">MIT PLATINUM</span>
                  <CreditCard className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <p className="text-[11px] font-mono tracking-widest text-slate-300">•••• •••• •••• 8820</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">RAHUL SHARMA</p>
                </div>
              </div>

              {/* Tilted Red/Navy Card */}
              <div className="w-56 h-34 rounded-2xl bg-gradient-to-r from-rose-700 to-indigo-900 text-white p-4 shadow-2xl border border-rose-400/50 transform rotate-6 -ml-16 group-hover:rotate-12 transition-transform relative z-20 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-white">MIT DIGITAL</span>
                  <div className="w-5 h-3 bg-amber-400/80 rounded-xs" />
                </div>
                <div>
                  <p className="text-[11px] font-mono tracking-widest text-white">•••• •••• •••• 4444</p>
                  <p className="text-[9px] text-rose-200 mt-0.5">PRIYA DESHMUKH</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/register"
                className="text-xs font-bold text-slate-900 group-hover:text-rose-600 flex items-center gap-1.5 transition-colors"
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

              <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/60 text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">TERM DEPOSIT</span>
                <p className="text-lg font-black text-rose-600 mt-1">7.85% p.a.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Fixed interest compounding</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/register"
                className="text-xs font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1.5"
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
                <span className="font-semibold text-slate-700">Digital Fund Transfers (IMPS/UPI)</span>
                <span className="font-bold text-emerald-600">Zero Fee</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link
                href="/login"
                className="text-xs font-bold text-slate-900 hover:text-rose-600 flex items-center gap-1.5"
              >
                <span>Understand Schedule of Charges</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. FLOATING STICKY ACTION PILL */}
      {/* ============================================================== */}
      {showStickyPill && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Link
            href="/register"
            className="flex items-center gap-2.5 px-5 py-3.5 bg-slate-950/95 hover:bg-black text-white rounded-full shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-105 group"
          >
            <div className="w-5 h-5 rounded-full bg-rose-600 flex items-center justify-center text-white text-[10px] font-bold group-hover:rotate-12 transition-transform">
              <Building2 className="w-3 h-3" />
            </div>
            <span className="text-xs sm:text-sm font-bold tracking-tight">Open Bank Account</span>
          </Link>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. CALL TO ACTION FOOTER BANNER */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-r from-rose-700 via-rose-600 to-indigo-950 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Experience MIT Payments Bank?
          </h2>
          <p className="mt-3 text-rose-100 text-sm max-w-xl mx-auto leading-relaxed">
            Open an account online in less than 2 minutes with zero paperwork and immediate access to digital funds.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-rose-700 hover:bg-rose-50 rounded-xl text-sm font-bold shadow-md transition-all"
            >
              Get Started Now
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900/60 hover:bg-slate-900 text-white border border-rose-400/40 rounded-xl text-sm font-bold transition-all"
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
                <div className="h-8 flex items-center justify-center p-0.5 bg-white">
                  <img src="/logo.png" alt="MIT Payments Bank" className="h-7 w-auto object-contain" />
                </div>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Headquartered at MIT IT Park, Paud Road, Kothrud, Pune, Maharashtra 411038. Licensed digital commercial banking provider.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-[11px]">
                Accounts & Deposits
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/register" className="hover:text-rose-600">Digital Savings Account</Link></li>
                <li><Link href="/register" className="hover:text-rose-600">Merchant Current Account</Link></li>
                <li><Link href="/register" className="hover:text-rose-600">Term Fixed Deposits</Link></li>
                <li><Link href="/register" className="hover:text-rose-600">RuPay Debit Cards</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-[11px]">
                Digital Services
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li><Link href="/login" className="hover:text-rose-600">NetBanking Portal</Link></li>
                <li><Link href="/transfer" className="hover:text-rose-600">IMPS & UPI Transfers</Link></li>
                <li><Link href="/beneficiaries" className="hover:text-rose-600">Payee Directory</Link></li>
                <li><Link href="/history" className="hover:text-rose-600">Digital Passbook</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3 text-[11px]">
                Security & Support
              </h4>
              <ul className="space-y-2 text-[11px]">
                <li><span className="text-slate-600">24/7 Helpline: 1800-MIT-BANK</span></li>
                <li><span className="text-slate-600">Fraud Desk: 1800-999-MIT</span></li>
                <li><span className="text-slate-600">support@mitpayments.bank</span></li>
                <li><span className="text-emerald-600 font-semibold">256-Bit SSL Certified</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
            <p>© 2026 MIT Payments Bank Limited. All rights reserved.</p>
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
