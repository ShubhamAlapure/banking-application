import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  ArrowRight,
  Zap,
  Lock,
  Smartphone,
  CheckCircle2,
  Users,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-[85vh]">
      {/* Hero Section */}
      <section className="py-16 sm:py-24 px-4 max-w-7xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-6">
          <Zap className="w-3.5 h-3.5" />
          <span>Agile Software Development Final Jury Prototype</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
          Apex Trust Bank <br />
          <span className="text-indigo-600">Scaling Agile Architecture</span>
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A working, race-safe financial banking prototype built with Next.js App Router, Supabase Postgres RLS, atomic RPC stored procedures, and simulated SMS OTP verification.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 transition-all group"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-all shadow-xs"
          >
            <span>Create Demo Account (+₹50k)</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Atomic Money Transfers
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Postgres stored procedures with <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">SELECT ... FOR UPDATE</code> row locks guarantee strict concurrency protection and zero double-spend.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Simulated SMS OTP Inbox
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Self-contained offline simulation panel with 5-minute expiry, SHA-256 hashed challenges, and 3-attempt safety cutoff.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              3-Layer Role Guarding
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Strict isolation between Customers and Admins enforced across Supabase RLS, Next.js Middleware, and Server Action guards.
            </p>
          </div>
        </div>

        {/* Test Accounts Quick Reference */}
        <div className="mt-12 bg-slate-100/80 p-5 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
          <p className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Pre-Seeded Jury Accounts</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">Rahul Sharma (Customer)</span>
              <span className="font-mono text-slate-500 block">rahul@demo.bank</span>
              <span className="text-emerald-600 font-semibold mt-1 block">Bal: ₹75,000.00</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">Priya Deshmukh (Customer)</span>
              <span className="font-mono text-slate-500 block">priya@demo.bank</span>
              <span className="text-amber-600 font-semibold mt-1 block">Bal: ₹500.00 (Low Bal)</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-900 block">Amit Patel (Customer)</span>
              <span className="font-mono text-slate-500 block">amit@demo.bank</span>
              <span className="text-emerald-600 font-semibold mt-1 block">Bal: ₹1,20,000.00</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-purple-200 bg-purple-50/30">
              <span className="font-bold text-purple-900 block">System Admin</span>
              <span className="font-mono text-purple-700 block">admin@demo.bank</span>
              <span className="text-purple-600 font-semibold mt-1 block">Freeze & Audit Tools</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Password for customers: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">Demo@12345</code> • Password for admin: <code className="bg-white px-1.5 py-0.5 rounded border font-mono">Admin@12345</code>
          </p>
        </div>
      </section>
    </div>
  );
}
