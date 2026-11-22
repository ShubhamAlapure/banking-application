'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/validations';
import { useDemo } from '@/context/DemoContext';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useDemo();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(searchParams.get('message') || null);

  const supabase = createClient();

  const setDemoCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || 'Invalid input.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        setErrorMsg(error.message || 'Failed to sign in. Please check your credentials.');
        setLoading(false);
        return;
      }

      if (data.user) {
        addToast({
          type: 'success',
          title: 'Sign In Successful',
          message: `Welcome back, ${data.user.user_metadata?.full_name || data.user.email}!`,
        });

        const role = data.user.user_metadata?.role;
        const redirectParam = searchParams.get('redirect');

        if (redirectParam && redirectParam.startsWith('/')) {
          router.push(redirectParam);
        } else if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    } catch (err: unknown) {
      console.error('Sign in exception:', err);
      setErrorMsg('An unexpected network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-slate-50 via-indigo-50/20 to-slate-100/50">
      <div className="max-w-md w-full space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-3.5">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Sign in to your account
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Apex Trust Bank • Simulated Online Banking Portal
          </p>
        </div>

        {/* Demo Fast-Switcher Box for Jury Evaluation */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Jury Demo Quick Switcher</span>
            </span>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Click to Auto-fill
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('rahul@demo.bank', 'Demo@12345')}
              className="p-3 text-left bg-slate-50/80 hover:bg-indigo-50/60 hover:border-indigo-300 border border-slate-200 rounded-2xl transition-all shadow-2xs group"
            >
              <span className="font-bold text-slate-900 block group-hover:text-indigo-700">
                Rahul Sharma
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                Bal: ₹75,000.00
              </span>
              <span className="text-[10px] text-slate-400 block">Normal Transfers</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('priya@demo.bank', 'Demo@12345')}
              className="p-3 text-left bg-slate-50/80 hover:bg-amber-50/60 hover:border-amber-300 border border-slate-200 rounded-2xl transition-all shadow-2xs group"
            >
              <span className="font-bold text-slate-900 block group-hover:text-amber-800">
                Priya Deshmukh
              </span>
              <span className="text-[11px] text-amber-600 font-bold block mt-0.5">
                ₹500 (Low Bal Demo)
              </span>
              <span className="text-[10px] text-slate-400 block">Tests TC04 Rejection</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('amit@demo.bank', 'Demo@12345')}
              className="p-3 text-left bg-slate-50/80 hover:bg-indigo-50/60 hover:border-indigo-300 border border-slate-200 rounded-2xl transition-all shadow-2xs group"
            >
              <span className="font-bold text-slate-900 block group-hover:text-indigo-700">
                Amit Patel
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                Bal: ₹1,20,000.00
              </span>
              <span className="text-[10px] text-slate-400 block">Business Payee</span>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('admin@demo.bank', 'Admin@12345')}
              className="p-3 text-left bg-purple-50/50 hover:bg-purple-100/70 hover:border-purple-300 border border-purple-200 rounded-2xl transition-all shadow-2xs group"
            >
              <span className="font-bold text-purple-900 block flex items-center gap-1 group-hover:text-purple-700">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Admin Portal
              </span>
              <span className="text-[11px] text-purple-700 font-semibold block mt-0.5">
                Supervisor Role
              </span>
              <span className="text-[10px] text-purple-500 block">Freeze & Audit Tools</span>
            </button>
          </div>
        </div>

        {/* Main Sign In Form Card */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@demo.bank"
                  className="block w-full pl-10 pr-3.5 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 shadow-md shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
              Create a demo account (₹50k bonus)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
