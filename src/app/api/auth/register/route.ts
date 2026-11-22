import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phone } = await req.json();
    const cleanEmail = email.toLowerCase().trim();
    const cleanName = fullName.trim();
    const cleanDigits = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
    const visiblePhone = cleanDigits && cleanDigits.length === 10
      ? `+91 ${cleanDigits.slice(0, 5)} ${cleanDigits.slice(5)}`
      : `+91 98${Math.floor(10000000 + Math.random() * 90000000).toString().slice(0, 8)}`;

    const serviceClient = createServiceClient();

    // 1. Check if user already exists
    const { data: existingUsers } = await serviceClient.auth.admin.listUsers();
    const existing = existingUsers?.users.find((u) => u.email?.toLowerCase() === cleanEmail);

    let userId: string;

    if (existing) {
      userId = existing.id;
      // Update password & confirm
      await serviceClient.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { full_name: cleanName, role: 'customer', phone: visiblePhone },
      });
    } else {
      // Create user with email_confirm: true so no verification email gate is required
      const { data: newUser, error: createErr } = await serviceClient.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: { full_name: cleanName, role: 'customer', phone: visiblePhone },
      });

      if (createErr || !newUser.user) {
        return NextResponse.json(
          { success: false, message: createErr?.message || 'Failed to create account.' },
          { status: 400 }
        );
      }
      userId = newUser.user.id;
    }

    // 2. Ensure Profile exists in public.profiles with visible mobile number
    await serviceClient.from('profiles').upsert({
      id: userId,
      full_name: cleanName,
      role: 'customer',
      phone_masked: visiblePhone,
      updated_at: new Date().toISOString(),
    });

    // 3. Ensure a primary active SAVINGS account exists with ₹5,000 welcome balance
    const { data: existingAccs } = await serviceClient
      .from('accounts')
      .select('id')
      .eq('owner_id', userId);

    if (!existingAccs || existingAccs.length === 0) {
      const accNumber = '4000' + Math.floor(10000000 + Math.random() * 90000000).toString();
      await serviceClient.from('accounts').insert({
        owner_id: userId,
        account_number: accNumber,
        account_type: 'SAVINGS',
        balance: 5000.0,
        status: 'ACTIVE',
      });
    }

    return NextResponse.json({ success: true, userId });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json({ success: false, message: err?.message || 'Internal server error.' }, { status: 500 });
  }
}
