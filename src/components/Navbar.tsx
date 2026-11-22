'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Building2,
  LayoutDashboard,
  SendHorizontal,
  Users,
  History,
  ShieldCheck,
  LogOut,
  User,
  Menu,
  X,
  CreditCard,
  Briefcase,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { Profile } from '@/types/database';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setProfile(data as Profile);
          } else {
            setProfile({
              id: user.id,
              full_name: user.user_metadata?.full_name || 'Valued Customer',
              role: user.user_metadata?.role || 'customer',
              phone_masked: '+91 98*** **123',
              created_at: '',
              updated_at: '',
            });
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Session profile load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    router.push('/login');
    router.refresh();
  };

  const isCustomer = profile?.role === 'customer';
  const isAdmin = profile?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href={profile ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3.5 group">
              <div className="h-12 flex items-center justify-center px-2 py-1 bg-white rounded-xl border border-slate-200/80 shadow-2xs group-hover:border-rose-300 transition-colors">
                <img
                  src="/logo.png"
                  alt="MIT Payments Bank"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-slate-800 tracking-tight block leading-tight">
                  MIT Payments Bank
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Digital & Retail Banking Core
                </span>
              </div>
            </Link>

            {/* Public Links when not authenticated */}
            {!profile && (
              <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600">
                <Link href="/" className="hover:text-indigo-600 transition-colors">
                  Personal Banking
                </Link>
                <Link href="/" className="hover:text-indigo-600 transition-colors">
                  Business & Corporate
                </Link>
                <Link href="/" className="hover:text-indigo-600 transition-colors">
                  Cards & Loans
                </Link>
                <Link href="/" className="hover:text-indigo-600 transition-colors">
                  Wealth Management
                </Link>
              </nav>
            )}
          </div>

          {/* Authenticated Customer Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {profile && isCustomer && (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/dashboard'
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Accounts</span>
                </Link>

                <Link
                  href="/transfer"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/transfer'
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <SendHorizontal className="w-4 h-4" />
                  <span>Transfer & Pay</span>
                </Link>

                <Link
                  href="/beneficiaries"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/beneficiaries'
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Beneficiaries</span>
                </Link>

                <Link
                  href="/history"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/history'
                      ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Statements</span>
                </Link>
              </>
            )}

            {profile && isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Operations & Compliance Console</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-9 bg-slate-100 rounded-xl animate-pulse" />
            ) : profile ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-xs font-bold text-slate-900 leading-tight">
                      {profile.full_name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {isAdmin ? 'Operations Staff' : 'Verified Customer'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">{profile.phone_masked}</span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-colors border border-slate-200"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Online Banking</span>
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-100 transition-all"
                >
                  Open an Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-1.5">
          {profile && isCustomer && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <LayoutDashboard className="w-4 h-4" />
                Accounts Overview
              </Link>
              <Link
                href="/transfer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <SendHorizontal className="w-4 h-4" />
                Transfer & Pay
              </Link>
              <Link
                href="/beneficiaries"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Users className="w-4 h-4" />
                Beneficiaries
              </Link>
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <History className="w-4 h-4" />
                Statements & History
              </Link>
            </>
          )}

          {profile && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-purple-700 bg-purple-50"
            >
              <ShieldCheck className="w-4 h-4" />
              Operations Console
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {profile ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800">{profile.full_name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1 text-xs text-rose-600 font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 w-full">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-2.5 text-center text-xs font-bold border border-slate-300 rounded-xl"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-2.5 text-center text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-xs"
                >
                  Open Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
