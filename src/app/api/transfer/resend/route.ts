import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId } = body;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    // Try native RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('resend_transfer_otp', {
      p_transaction_id: transactionId,
    });

    if (!rpcError && rpcData?.success) {
      return NextResponse.json(rpcData);
    }

    // Fallback using service role
    const serviceClient = createServiceClient();

    // Verify transaction
    const { data: txn } = await serviceClient
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (!txn || txn.status !== 'PENDING_OTP') {
      return NextResponse.json({ success: false, message: 'Only pending transactions can receive new OTPs.' }, { status: 400 });
    }

    // Invalidate existing challenges
    await serviceClient
      .from('otp_challenges')
      .update({ consumed: true })
      .eq('transaction_id', transactionId);

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newHash = crypto.createHash('sha256').update(newOtp).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await serviceClient.from('otp_challenges').insert({
      transaction_id: transactionId,
      user_id: user.id,
      otp_hash: newHash,
      expires_at: expiresAt,
      attempts: 0,
      max_attempts: 3,
      consumed: false,
    });

    await serviceClient.from('audit_log').insert({
      user_id: user.id,
      action: 'OTP_RESENT',
      details: {
        transaction_id: transactionId,
        reference_no: txn.reference_no,
      },
    });

    return NextResponse.json({
      success: true,
      simulated_otp: newOtp,
    });
  } catch (error: any) {
    console.error('API resend OTP error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error.' }, { status: 500 });
  }
}
