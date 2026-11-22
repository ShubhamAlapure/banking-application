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
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-transparent selection:bg-indigo-600 selection:text-white">
      {/* Hero Section with Illuminating Squares Grid */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-8 shadow-2xs">
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

      {/* Metrics Banner */}
      <section className="bg-white border-y border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">2.5M+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Active Customers</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">₹45,000 Cr+</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Processed Annually</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">99.99%</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Uptime Reliability</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">24/7/365</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Fraud Surveillance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Banking Services & Core Products */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
            Tailored Financial Solutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-2">
            Engineered for Stability, Growth, and Security
          </h2>
          <p className="text-sm text-slate-600 mt-3">
            Whether managing daily transactions or securing enterprise treasury operations, Apex Trust Bank provides the foundation you need.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 shadow-2xs">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">High-Yield Savings</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Earn competitive monthly compounded interest on your idle balances with zero hidden penalties and complete liquidity.
              </p>
              <ul className="text-xs text-slate-700 space-y-2.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Up to 7.15% p.a. interest tiers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Zero account maintenance charges</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant virtual debit card issuance</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link href="/register" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5">
                <span>Explore Savings Benefits</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 shadow-2xs">
                <SendHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Instant Transfers & Payees</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Atomic settlement protocol ensures instant domestic fund movements with built-in idempotency and two-step verification.
              </p>
              <ul className="text-xs text-slate-700 space-y-2.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant IMPS & RTGS routing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>One-click verified payee directory</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Automatic transaction duplicate prevention</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link href="/login" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5">
                <span>View Payment Capabilities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 shadow-2xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Institutional Security</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-6">
                Your capital is protected by end-to-end cryptographic encryption, continuous audit logging, and automated account-lock safeguards.
              </p>
              <ul className="text-xs text-slate-700 space-y-2.5 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Multi-factor SMS verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time anomalous debit detection</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant account hold and release controls</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link href="/register" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5">
                <span>Security Architecture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
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

      {/* Professional Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
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
