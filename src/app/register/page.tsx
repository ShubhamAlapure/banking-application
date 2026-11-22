'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validations';
import { useDemo } from '@/context/DemoContext';
import {
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Check,
  AlertCircle,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useDemo();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const supabase = createClient();

  // Password strength checks for UX feedback
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&^#()_\-+=<>.,:;]/.test(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!agreedToTerms) {
      setErrorMsg('Please accept the digital banking terms to proceed.');
      return;
    }

    const cleanDigits = phone.replace(/\D/g, '');
    if (!cleanDigits || cleanDigits.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    const validation = registerSchema.safeParse({
      fullName,
      email,
      phone: cleanDigits,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || 'Please check your input.');
      return;
    }

    setLoading(true);
    try {
      // 1. Call dedicated registration endpoint (auto-confirms email and provisions ₹5,000 account)
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          fullName: fullName.trim(),
          phone: cleanDigits,
        }),
      });

      const regData = await regRes.json();

      if (!regData.success) {
        setErrorMsg(regData.message || 'Registration failed.');
        setLoading(false);
        return;
      }

      // 2. Sign in immediately to establish active session
      const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (loginErr) {
        setErrorMsg('Account created, but automatic sign-in failed. Please visit the Sign In page.');
        setLoading(false);
        return;
      }

      if (loginData.user) {
        addToast({
          type: 'success',
          title: 'Account Opened Successfully!',
          message: 'Welcome to MIT Payments Bank. Your digital account is active with ₹50,000 opening credit.',
        });

        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      console.error('Registration error:', err);
      setErrorMsg('An unexpected error occurred while creating your account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-sm border border-slate-200/90 mb-3.5">
            <img src="/logo.png" alt="MIT Payments Bank" className="h-12 w-auto object-contain" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Open an MIT Account Online
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
            Instant digital enrollment with zero minimum balance and immediate activation
          </p>
        </div>

        {/* Professional Feature Callout */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-slate-600">
            <div className="flex flex-col items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Instant Activation</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Zero Account Fees</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit Protection</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200/90">
          {errorMsg && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-800 text-xs font-medium"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="fullName"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Full Legal Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="block w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Mobile Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
                  +91
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={10}
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="93226 10932"
                  className="block w-full pl-12 pr-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used for instant UPI payee lookups and banking SMS notifications.
              </p>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Email Address *
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
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Create Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="block w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium"
                />
              </div>

              {/* Password Requirements Checklist */}
              {password.length > 0 && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-1.5 text-[11px]">
                  <span className={`flex items-center gap-1 ${hasMinLen ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> 8+ Characters
                  </span>
                  <span className={`flex items-center gap-1 ${hasUpper ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Uppercase (A-Z)
                  </span>
                  <span className={`flex items-center gap-1 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Lowercase (a-z)
                  </span>
                  <span className={`flex items-center gap-1 ${hasNumber && hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <Check className="w-3 h-3" /> Number & Symbol
                  </span>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="block w-full pl-10 pr-3.5 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 select-none">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span>
                  I acknowledge and accept the MIT Payments Bank Digital Account Terms, Privacy Policy, and electronic statements agreement.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm shadow-indigo-100 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Open Account Now</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 mt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Sign in to Online Banking
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
