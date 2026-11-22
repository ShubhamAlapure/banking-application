import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 10-digit mobile number.' },
        { status: 400 }
      );
    }

    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (cleanDigits.length < 10) {
      return NextResponse.json(
        { success: false, message: 'Mobile number must be at least 10 digits.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Database configuration missing.' },
        { status: 500 }
      );
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Search profiles for matching phone
    const { data: profiles, error: pErr } = await serviceClient
      .from('profiles')
      .select('id, full_name, role, phone_masked');

    if (pErr || !profiles) {
      console.error('Profile lookup error:', pErr);
      return NextResponse.json(
        { success: false, message: 'Failed to search registered profiles.' },
        { status: 500 }
      );
    }

    const matchedProfile = profiles.find((p) => {
      const raw = (p.phone_masked || '').replace(/\D/g, '');
      return raw.includes(cleanDigits) || cleanDigits.includes(raw.slice(-10));
    });

    if (!matchedProfile) {
      return NextResponse.json(
        {
          success: false,
          message: `No MIT Payments Bank user found with mobile number +91 ${cleanDigits}.`,
        },
        { status: 404 }
      );
    }

    // 2. Fetch customer's primary active account
    const { data: accounts, error: aErr } = await serviceClient
      .from('accounts')
      .select('id, account_number, account_type, status')
      .eq('owner_id', matchedProfile.id)
      .eq('status', 'ACTIVE');

    if (aErr || !accounts || accounts.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: `User ${matchedProfile.full_name} is registered but has no active depository account.`,
        },
        { status: 404 }
      );
    }

    // Prefer SAVINGS account, else first active
    const primaryAccount =
      accounts.find((a) => a.account_type === 'SAVINGS') || accounts[0];

    return NextResponse.json({
      success: true,
      user: {
        id: matchedProfile.id,
        fullName: matchedProfile.full_name,
        phone: matchedProfile.phone_masked,
      },
      account: {
        accountNumber: primaryAccount.account_number,
        accountType: primaryAccount.account_type,
        bankName: 'MIT Payments Bank',
        ifsc: 'MITP0001001',
      },
    });
  } catch (err: any) {
    console.error('Lookup by phone error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Server error while resolving phone number.' },
      { status: 500 }
    );
  }
}
