import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const serviceClient = createServiceClient();
    const { data: usersData } = await serviceClient.auth.admin.listUsers();
    const matched = usersData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase().trim());

    if (!matched) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Auto-confirm the user email in Supabase Auth
    await serviceClient.auth.admin.updateUserById(matched.id, {
      email_confirm: true,
    });

    return NextResponse.json({ success: true, message: 'Email successfully verified' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err?.message || 'Error' }, { status: 500 });
  }
}
