'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Beneficiary, Account } from '@/types/database';
import { beneficiarySchema } from '@/lib/validations';
import { maskAccountNumber } from '@/lib/utils';
import { resolveAvatarUrl } from '@/lib/avatar';
import { useDemo } from '@/context/DemoContext';
import {
  Users,
  UserPlus,
  Trash2,
  Edit2,
  Building2,
  Search,
  AlertCircle,
  CheckCircle2,
  X,
  Send,
  Eye,
  EyeOff,
  Phone,
  Loader2,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function BeneficiariesPage() {
  const router = useRouter();
  const { addToast } = useDemo();

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [ownAccounts, setOwnAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  // Form states
  const [nickname, setNickname] = useState('');
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('MIT Payments Bank');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unmaskedId, setUnmaskedId] = useState<string | null>(null);

  // Quick Mobile Number Search states
  const [searchPhone, setSearchPhone] = useState('');
  const [searchingPhone, setSearchingPhone] = useState(false);
  const [phoneLookupResult, setPhoneLookupResult] = useState<{
    fullName: string;
    phone: string;
    accountNumber: string;
    bankName: string;
  } | null>(null);
  const [phoneSearchError, setPhoneSearchError] = useState<string | null>(null);

  const handleSearchByPhone = async () => {
    const clean = searchPhone.replace(/\D/g, '').slice(-10);
    if (!clean || clean.length < 10) {
      setPhoneSearchError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSearchingPhone(true);
    setPhoneSearchError(null);
    setPhoneLookupResult(null);

    try {
      const res = await fetch('/api/account/lookup-by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPhoneSearchError(data.message || 'No user found with this mobile number.');
        return;
      }

      setPhoneLookupResult({
        fullName: data.user.fullName,
        phone: data.user.phone,
        accountNumber: data.account.accountNumber,
        bankName: data.account.bankName,
      });

      // Auto-fill form fields!
      setBeneficiaryName(data.user.fullName);
      setAccountNumber(data.account.accountNumber);
      setBankName(data.account.bankName);
      setNickname(`${data.user.fullName.split(' ')[0]} MIT`);
      setFormError(null);
    } catch (err: any) {
      console.error('Phone search error:', err);
      setPhoneSearchError('Failed to search user by mobile number.');
    } finally {
      setSearchingPhone(false);
    }
  };

  const supabase = createClient();

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Fetch own accounts to prevent adding own account as beneficiary
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('owner_id', user.id);

      if (accountsData) {
        setOwnAccounts(accountsData as Account[]);
      }

      // Fetch saved beneficiaries
      const { data: benData, error } = await supabase
        .from('beneficiaries')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (benData) {
        setBeneficiaries(benData as Beneficiary[]);
      }
      if (error) {
        console.error('Error fetching beneficiaries:', error);
      }
    } catch (err) {
      console.error('Load beneficiaries exception:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Schema Validation
    const validation = beneficiarySchema.safeParse({
      nickname,
      beneficiaryName,
      accountNumber,
      bankName,
    });

    if (!validation.success) {
      setFormError(validation.error.issues[0]?.message || 'Invalid input.');
      return;
    }

    // 2. Reject Own Account
    const isOwn = ownAccounts.some((acc) => acc.account_number === accountNumber.trim());
    if (isOwn) {
      setFormError('You cannot add your own bank account as a beneficiary.');
      return;
    }

    // 3. Reject Duplicate in caller's list
    const isDuplicate = beneficiaries.some(
      (b) => b.account_number === accountNumber.trim()
    );
    if (isDuplicate) {
      setFormError('This account number is already in your beneficiary list.');
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('beneficiaries')
        .insert({
          owner_id: user.id,
          nickname: nickname.trim(),
          beneficiary_name: beneficiaryName.trim(),
          account_number: accountNumber.trim(),
          bank_name: bankName.trim(),
          status: 'ACTIVE',
        })
        .select()
        .single();

      if (error) {
        setFormError(error.message || 'Failed to add beneficiary.');
        return;
      }

      addToast({
        type: 'success',
        title: 'Beneficiary Added',
        message: `${beneficiaryName} (${nickname}) added successfully.`,
      });

      // Reset and close
      setNickname('');
      setBeneficiaryName('');
      setAccountNumber('');
      setBankName('MIT Payments Bank');
      setIsAddOpen(false);
      loadData();
    } catch (err: unknown) {
      console.error('Error adding beneficiary:', err);
      setFormError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditNickname = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary || !nickname.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .update({ nickname: nickname.trim() })
        .eq('id', selectedBeneficiary.id);

      if (error) {
        setFormError(error.message);
        return;
      }

      addToast({
        type: 'success',
        title: 'Nickname Updated',
        message: `Updated nickname to "${nickname}".`,
      });

      setIsEditOpen(false);
      setSelectedBeneficiary(null);
      setNickname('');
      loadData();
    } catch (err) {
      console.error('Edit nickname error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBeneficiary = async () => {
    if (!selectedBeneficiary) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('beneficiaries')
        .delete()
        .eq('id', selectedBeneficiary.id);

      if (error) {
        addToast({
          type: 'error',
          title: 'Deletion Failed',
          message: error.message,
        });
        return;
      }

      addToast({
        type: 'success',
        title: 'Beneficiary Deleted',
        message: `${selectedBeneficiary.beneficiary_name} removed from your payees.`,
      });

      setIsDeleteOpen(false);
      setSelectedBeneficiary(null);
      loadData();
    } catch (err) {
      console.error('Delete beneficiary error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBeneficiaries = beneficiaries.filter(
    (b) =>
      b.beneficiary_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.account_number.includes(searchQuery)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Payee Directory
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Beneficiary Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Register and manage trusted accounts for instant fund transfers
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all shadow-indigo-100"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Beneficiary</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by payee name, nickname, or 12-digit account number..."
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-xs transition-colors"
        />
      </div>

      {/* Beneficiaries Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="h-44 bg-slate-200 rounded-2xl" />
          <div className="h-44 bg-slate-200 rounded-2xl" />
        </div>
      ) : filteredBeneficiaries.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-bold text-slate-700">No beneficiaries found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'No registered payees matched your search criteria.'
              : 'You have not added any beneficiaries yet. Add one to enable money transfers.'}
          </p>
          {!searchQuery && (
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add your first payee</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBeneficiaries.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-2xl overflow-hidden shrink-0 border border-slate-200 bg-slate-100 shadow-2xs">
                      <Image
                        src={resolveAvatarUrl(null, b.beneficiary_name)}
                        alt={b.beneficiary_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {b.beneficiary_name}
                      </h3>
                      <span className="text-xs text-indigo-600 font-medium">
                        &quot;{b.nickname}&quot;
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {b.status}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Bank</span>
                    <span className="font-semibold text-slate-800">{b.bank_name}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Account No</span>
                    <div className="flex items-center gap-1.5 font-mono font-medium text-slate-800">
                      <span>
                        {unmaskedId === b.id
                          ? b.account_number
                          : maskAccountNumber(b.account_number)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setUnmaskedId(unmaskedId === b.id ? null : b.id)}
                        className="text-slate-400 hover:text-slate-600"
                        title={unmaskedId === b.id ? 'Mask account number' : 'Show full number'}
                      >
                        {unmaskedId === b.id ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBeneficiary(b);
                      setNickname(b.nickname);
                      setFormError(null);
                      setIsEditOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit nickname"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBeneficiary(b);
                      setIsDeleteOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete beneficiary"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href={`/transfer?beneficiary=${b.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Transfer</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Beneficiary Modal Dialog */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Add New Beneficiary</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {/* Quick Search by Mobile Number */}
            <div className="mt-4 p-4 bg-gradient-to-br from-indigo-50/90 to-purple-50/60 border border-indigo-100 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Search MIT Account by Mobile Number</span>
                </span>
                <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>INSTANT</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-bold text-slate-400">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, ''))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearchByPhone();
                      }
                    }}
                    placeholder="e.g. 9322610932"
                    className="w-full pl-10 pr-3 py-2 text-xs font-mono bg-white border border-indigo-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchByPhone}
                  disabled={searchingPhone || searchPhone.length < 10}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                >
                  {searchingPhone ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Search className="w-3.5 h-3.5" />
                  )}
                  <span>Find Account</span>
                </button>
              </div>

              {phoneSearchError && (
                <p className="text-[11px] text-rose-600 font-semibold">{phoneSearchError}</p>
              )}

              {phoneLookupResult && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold block text-slate-900">{phoneLookupResult.fullName}</span>
                      <span className="text-[11px] font-mono text-emerald-800">
                        {phoneLookupResult.phone} • A/C: {phoneLookupResult.accountNumber} • {phoneLookupResult.bankName}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full shrink-0">
                    Auto-Filled Below
                  </span>
                </div>
              )}
            </div>

            <form onSubmit={handleAddBeneficiary} className="space-y-4 mt-4" noValidate>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payee Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. Priya Deshmukh"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nickname (Short identifier) *
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="e.g. Priya Savings"
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  12-Digit Account Number *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={12}
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 200022224444"
                  className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Must be exactly 12 numeric digits. Cannot be your own account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Beneficiary Financial Institution *
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="MIT Payments Bank">MIT Payments Bank</option>
                  <option value="State Bank of India">State Bank of India</option>
                  <option value="HDFC Bank">HDFC Bank</option>
                  <option value="ICICI Bank">ICICI Bank</option>
                  <option value="Axis Bank">Axis Bank</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Save Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Nickname Modal */}
      {isEditOpen && selectedBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Edit Beneficiary Nickname</h3>
            <p className="text-xs text-slate-500 mb-4">
              Updating nickname for {selectedBeneficiary.beneficiary_name} (
              {maskAccountNumber(selectedBeneficiary.account_number)})
            </p>

            <form onSubmit={handleEditNickname} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nickname *
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {submitting ? 'Updating...' : 'Update Nickname'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal Dialog */}
      {isDeleteOpen && selectedBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Beneficiary?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Are you sure you want to delete{' '}
              <span className="font-semibold text-slate-800">
                {selectedBeneficiary.beneficiary_name}
              </span>{' '}
              ({selectedBeneficiary.nickname})? You will not be able to initiate transfers to this
              account until re-added.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Keep Beneficiary
              </button>
              <button
                type="button"
                onClick={handleDeleteBeneficiary}
                disabled={submitting}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {submitting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
