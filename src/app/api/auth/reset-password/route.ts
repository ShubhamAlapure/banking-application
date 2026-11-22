import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { identifier, newPassword } = await req.json();

    if (!identifier || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Please provide your email/mobile and new password.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long.' },
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

    const cleanInput = identifier.trim().toLowerCase();
    const isEmail = cleanInput.includes('@');
    let targetUserId = '';
    let targetEmail = '';

    if (isEmail) {
      const { data: users } = await serviceClient.auth.admin.listUsers();
      const match = (users?.users || []).find((u) => u.email?.toLowerCase() === cleanInput);
      if (match) {
        targetUserId = match.id;
        targetEmail = match.email || '';
      }
    } else {
      const digits = cleanInput.replace(/\D/g, '').slice(-10);
      const { data: profiles } = await serviceClient.from('profiles').select('id, phone_masked');
      const match = (profiles || []).find((p) => {
        const raw = (p.phone_masked || '').replace(/\D/g, '');
        return raw.includes(digits) || digits.includes(raw.slice(-10));
      });
      if (match) {
        targetUserId = match.id;
        const { data: userData } = await serviceClient.auth.admin.getUserById(match.id);
        targetEmail = userData.user?.email || '';
      }
    }

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, message: 'No registered MIT Payments Bank account matches this identifier.' },
        { status: 404 }
      );
    }

    // Update password and ensure email is confirmed
    const { error: updateErr } = await serviceClient.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
      email_confirm: true,
    });

    if (updateErr) {
      return NextResponse.json(
        { success: false, message: updateErr.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      email: targetEmail,
      message: 'Password updated successfully! You can now sign in with your new password.',
    });
  } catch (err: any) {
    console.error('Password reset exception:', err);
    return NextResponse.json(
      { success: false, message: err.message || 'Server error' },
      { status: 500 }
    );
  }
}
