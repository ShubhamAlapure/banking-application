'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { resolveAvatarUrl } from '@/lib/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
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
          const meta = (user.user_metadata || {}) as any;
          const metaAvatar = meta.avatar_url || null;
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (data) {
            setProfile({
              ...(data as Profile),
              avatar_url: metaAvatar || (data as any).avatar_url,
            });
          } else {
            setProfile({
              id: user.id,
              full_name: meta.full_name || 'Valued Customer',
              role: meta.role || 'customer',
              phone_masked: meta.phone || '+91 93226 10932',
              avatar_url: metaAvatar,
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0c111d]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link href={profile ? (isAdmin ? '/admin' : '/dashboard') : '/'} className="flex items-center gap-3.5 group">
              <div className="h-12 flex items-center justify-center px-2 py-1 bg-white rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-2xs group-hover:border-rose-300 transition-colors">
                <img
                  src="/logo.png"
                  alt="MIT Payments Bank"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-100 tracking-tight block leading-tight">
                  MIT Payments Bank
                </span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest block">
                  Digital & Retail Banking Core
                </span>
              </div>
            </Link>

            {/* Public Links when not authenticated */}
            {!profile && (
              <nav className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300">
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Personal Banking
                </Link>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Business & Corporate
                </Link>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Cards & Loans
                </Link>
                <Link href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
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
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Accounts</span>
                </Link>

                <Link
                  href="/transfer"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/transfer'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <SendHorizontal className="w-4 h-4" />
                  <span>Transfer & Pay</span>
                </Link>

                <Link
                  href="/beneficiaries"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/beneficiaries'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Beneficiaries</span>
                </Link>

                <Link
                  href="/history"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    pathname === '/history'
                      ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/60 shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
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
                    ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Operations & Compliance Console</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Auth Actions & Dark Mode Toggle at the Top */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark Mode Toggle directly accessible at the top */}
            <ThemeToggle />

            {loading ? (
              <div className="w-24 h-9 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            ) : profile ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 hover:opacity-90 transition-opacity group text-right"
                  title="Manage Account & Profile Settings"
                >
                  <div>
                    <div className="flex items-center gap-1.5 justify-end">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                        {profile.full_name}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isAdmin
                            ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                            : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        {isAdmin ? 'Operations Staff' : 'Verified Customer'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{profile.phone_masked}</span>
                  </div>

                  <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 group-hover:border-indigo-500 shadow-xs transition-all shrink-0 bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={resolveAvatarUrl(profile.avatar_url, profile.full_name, profile.id)}
                      alt={profile.full_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50 cursor-pointer"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Online Banking</span>
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-100 dark:shadow-none transition-all"
                >
                  Open an Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger & compact Dark Mode Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle compact />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c111d] px-4 pt-3 pb-5 space-y-2 shadow-xl">
          {/* Theme selector row in drawer */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Color Mode
            </span>
            <ThemeToggle />
          </div>

          {profile && isCustomer && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <LayoutDashboard className="w-4 h-4" />
                Accounts Overview
              </Link>
              <Link
                href="/transfer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <SendHorizontal className="w-4 h-4" />
                Transfer & Pay
              </Link>
              <Link
                href="/beneficiaries"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <Users className="w-4 h-4" />
                Beneficiaries
              </Link>
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <History className="w-4 h-4" />
                Statements & History
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <User className="w-4 h-4" />
                Manage Profile & Settings
              </Link>
            </>
          )}

          {profile && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800"
            >
              <ShieldCheck className="w-4 h-4" />
              Operations Console
            </Link>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {profile ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile.full_name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-bold"
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
                  className="w-1/2 py-2.5 text-center text-xs font-bold border border-slate-300 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200"
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
