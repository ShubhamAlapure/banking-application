import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Database configuration missing.' },
        { status: 500 }
      );
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Fetch all accounts and profiles
    const [{ data: accounts, error: accErr }, { data: profiles, error: profErr }] =
      await Promise.all([
        serviceClient.from('accounts').select('id, account_number, owner_id'),
        serviceClient.from('profiles').select('id, full_name, phone_masked'),
      ]);

    if (accErr || profErr) {
      console.error('Error fetching directory data:', accErr, profErr);
      return NextResponse.json(
        { success: false, message: 'Failed to retrieve directory data' },
        { status: 500 }
      );
    }

    const profileMap = new Map((profiles || []).map((p: any) => [p.id, p]));
    const accountDirectory: Record<string, { name: string; phone: string; userId: string }> = {};
    const accountIdDirectory: Record<string, { name: string; accountNumber: string; userId: string }> = {};

    (accounts || []).forEach((acc: any) => {
      const p = profileMap.get(acc.owner_id);
      if (p) {
        accountDirectory[acc.account_number] = {
          name: p.full_name || 'Account Holder',
          phone: p.phone_masked || '',
          userId: p.id,
        };
        accountIdDirectory[acc.id] = {
          name: p.full_name || 'Account Holder',
          accountNumber: acc.account_number,
          userId: p.id,
        };
      }
    });

    return NextResponse.json({
      success: true,
      accountDirectory,
      accountIdDirectory,
    });
  } catch (err: any) {
    console.error('Directory API exception:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
