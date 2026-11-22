'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { registerSchema } from '@/lib/validations';
import { useDemo } from '@/context/DemoContext';
import { Building2, User, Mail, Lock, ArrowRight, Check, AlertCircle, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useDemo();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    const validation = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      setErrorMsg(validation.error.issues[0]?.message || 'Please check your input.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: 'customer',
          },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        addToast({
          type: 'success',
          title: 'Account Created Successfully!',
          message: 'Your demo SAVINGS account has been pre-funded with ₹50,000.00!',
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Open a Demo Account
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Instantly provision a simulated savings account with preloaded balance
          </p>
        </div>

        {/* Demo Bonus Highlight */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3.5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold">Instant ₹50,000.00 Demo Credit</p>
            <p className="text-emerald-100">
              Auto-created SAVINGS account ready for transfer tests
            </p>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
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
              <label htmlFor="fullName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
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
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

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
                  placeholder="user@demo.bank"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Password strength criteria checklist */}
              <div className="mt-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasMinLen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span className={hasMinLen ? 'text-emerald-700 font-medium' : 'text-slate-500'}>At least 8 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasUpper && hasLower ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span className={hasUpper && hasLower ? 'text-emerald-700 font-medium' : 'text-slate-500'}>Uppercase and lowercase letters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasNumber && hasSpecial ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Check className="w-2.5 h-2.5" />
                  </span>
                  <span className={hasNumber && hasSpecial ? 'text-emerald-700 font-medium' : 'text-slate-500'}>Number and special character (@$!%*?&^#)</span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm Password
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
                  placeholder="Repeat your password"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account & Claim ₹50,000</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
