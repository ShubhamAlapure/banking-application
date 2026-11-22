'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile, Account } from '@/types/database';
import { resolveAvatarUrl } from '@/lib/avatar';
import { formatCurrency, maskAccountNumber } from '@/lib/utils';
import {
  User,
  Camera,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  Copy,
  Check,
  ArrowLeft,
  Save,
  Sliders,
  Bell,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [primaryAccount, setPrimaryAccount] = useState<Account | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Security & Preferences
  const [dailyLimit, setDailyLimit] = useState(100000);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [twoFactorRequired, setTwoFactorRequired] = useState(true);

  // Feedback states
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push('/login');
          return;
        }

        setUserId(user.id);
        setUserEmail(user.email || '');

        const meta = (user.user_metadata || {}) as any;
        const metaAvatar = meta.avatar_url || '';

        // 1. Fetch profile from database
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData as Profile);
          setFullName(profileData.full_name || meta.full_name || '');
          setPhone(profileData.phone_masked || meta.phone || '');
          const initialAvatar = resolveAvatarUrl(metaAvatar, profileData.full_name, user.id);
          setAvatarUrl(initialAvatar);
        } else {
          setFullName(meta.full_name || '');
          setPhone(meta.phone || '');
          setAvatarUrl(resolveAvatarUrl(metaAvatar, meta.full_name, user.id));
        }

        // 2. Fetch primary account
        const { data: accounts } = await supabase
          .from('accounts')
          .select('*')
          .eq('owner_id', user.id)
          .eq('status', 'ACTIVE');

        if (accounts && accounts.length > 0) {
          const primary = accounts.find((a: any) => a.account_type === 'SAVINGS') || accounts[0];
          setPrimaryAccount(primary as Account);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase]);

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Please select an image smaller than 5MB.');
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setErrorMsg(null);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Submit profile updates to Supabase
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('fullName', fullName.trim());
      formData.append('phone', phone.trim());

      if (selectedFile) {
        formData.append('avatar', selectedFile);
      } else if (avatarUrl) {
        formData.append('avatarUrl', avatarUrl);
      }

      const res = await fetch('/api/account/update-profile', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update profile.');
      }

      // Live update state
      if (data.profile?.avatarUrl) {
        setAvatarUrl(data.profile.avatarUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
      }
      if (data.profile?.fullName) {
        setFullName(data.profile.fullName);
      }
      if (data.profile?.phone) {
        setPhone(data.profile.phone);
      }

      setSuccessMsg('Profile and account preferences updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setErrorMsg(err?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-48 bg-slate-200 rounded-3xl" />
        <div className="h-80 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  const activeAvatar = previewUrl || avatarUrl || resolveAvatarUrl(null, fullName, userId);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Banking Dashboard</span>
        </Link>
        <span className="text-[11px] font-bold text-slate-400 font-mono">
          MIT CORE ID: {userId.slice(0, 13)}...
        </span>
      </div>

      {/* Hero Profile & Avatar Studio Card */}
      <div className="relative bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar Studio with Live Upload Button */}
          <div className="relative group shrink-0">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white/20 shadow-xl bg-slate-800">
              <Image
                src={activeAvatar}
                alt={fullName || 'User Avatar'}
                fill
                className="object-cover"
                unoptimized
                priority
              />
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />

            {/* Upload Camera Trigger Badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg border-2 border-slate-900 transition-transform transform hover:scale-110 cursor-pointer"
              title="Upload new profile picture"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Identity Details */}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>KYC Level 2 Verified</span>
              </span>
            </div>

            <p className="text-xs text-indigo-200 font-mono">{userEmail}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono font-semibold">{phone || '+91 93226 10932'}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">UUID:</span>
                <span className="font-mono text-[11px] truncate max-w-[130px]">{userId}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 hover:text-white text-slate-400"
                  title="Copy User ID"
                >
                  {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {selectedFile && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-200 border border-amber-300/30 rounded-full text-xs font-bold">
                <span>New photo ready to save: {selectedFile.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form & Settings Grid */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Personal Contact Details */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal Details</h3>
                <p className="text-[11px] text-slate-400">Update your verified account holder profile</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Shubham Alapure"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered Mobile Number *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  value={phone.replace(/^\+91\s*/, '').replace(/\s/g, '')}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="93226 10932"
                  className="w-full pl-12 pr-3.5 py-2.5 text-sm font-mono font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Used for instant UPI search, payee settlements, and security alerts.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address (Verified)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[10px] font-extrabold text-emerald-700">
                  AUTHENTICATED
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Primary Depository Account Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Primary Account Status</h3>
                <p className="text-[11px] text-slate-400">Connected depository savings core</p>
              </div>
            </div>

            {primaryAccount ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Account Number</span>
                  <span className="font-mono text-sm font-black text-slate-900">
                    {primaryAccount.account_number}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Account Type</span>
                  <span className="text-xs font-bold text-indigo-700">
                    {primaryAccount.account_type === 'SAVINGS'
                      ? 'Digital High-Yield Savings'
                      : 'Corporate Current'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Available Balance</span>
                  <span className="text-base font-black text-emerald-600">
                    {formatCurrency(primaryAccount.balance)}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>IFSC: <strong className="font-mono text-slate-800">MITP0001001</strong></span>
                  <span>Branch: <strong className="text-slate-800">Pune Tech Hub</strong></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No active depository account found.</p>
            )}

            <div className="pt-1">
              <Link
                href="/transfer"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Initiate Outward Transfer</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Transfer Limits & Security Preferences */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security & Operational Limits</h3>
              <p className="text-[11px] text-slate-400">Configure daily transaction limits and alerts</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Daily Transfer Limit
                </label>
                <span className="text-xs font-black text-indigo-600 font-mono">
                  {formatCurrency(dailyLimit)}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="500000"
                step="10000"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <span className="text-[10px] text-slate-400 block mt-1">
                RBI mandated payments bank maximum limit: ₹5,00,000.00
              </span>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Two-Factor OTP Security
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Mandatory OTP authorization on all outgoing transfers
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorRequired}
                  onChange={(e) => setTwoFactorRequired(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block leading-tight">
                      Instant SMS & Mobile Alerts
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Real-time alerts for all deposits, transfers & logins
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Action Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-black shadow-md shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
