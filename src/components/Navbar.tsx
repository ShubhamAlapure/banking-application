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
  AlertTriangle,
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
              full_name: user.user_metadata?.full_name || 'Demo User',
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
        console.error('Error loading session profile:', err);
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
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
      {/* Top Prominent Mandatory Simulation Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-bold py-1 px-4 text-center tracking-wider uppercase flex items-center justify-center gap-2 shadow-inner">
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>DEMO – SIMULATED BANK</span>
        <span className="hidden sm:inline font-normal text-amber-100">| Fictitious data only • No real transactions</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link href={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-900 block leading-tight">
                  Apex Trust <span className="text-indigo-600">Bank</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block">
                  Scaling Agile Prototype
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {profile && isCustomer && (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/transfer"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/transfer'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <SendHorizontal className="w-4 h-4" />
                  <span>Transfer Money</span>
                </Link>

                <Link
                  href="/beneficiaries"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/beneficiaries'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Beneficiaries</span>
                </Link>

                <Link
                  href="/history"
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/history'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Transactions</span>
                </Link>
              </>
            )}

            {profile && isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'bg-purple-50 text-purple-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Admin Audit & Control</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Auth State */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-24 h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : profile ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-sm font-semibold text-slate-800 leading-tight">
                      {profile.full_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {profile.role}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{profile.phone_masked}</span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {profile && isCustomer && (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
              <Link
                href="/transfer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <SendHorizontal className="w-5 h-5" />
                Transfer Money
              </Link>
              <Link
                href="/beneficiaries"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <Users className="w-5 h-5" />
                Beneficiaries
              </Link>
              <Link
                href="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"
              >
                <History className="w-5 h-5" />
                Transactions
              </Link>
            </>
          )}

          {profile && isAdmin && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-base font-medium text-purple-700 bg-purple-50"
            >
              <ShieldCheck className="w-5 h-5" />
              Admin Audit & Control
            </Link>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            {profile ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-semibold">{profile.full_name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-1 text-sm text-rose-600 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <div className="flex gap-2 w-full">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-2 text-center text-sm font-medium border border-slate-300 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-1/2 py-2 text-center text-sm font-semibold bg-indigo-600 text-white rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
