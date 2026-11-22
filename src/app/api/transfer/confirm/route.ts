import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionId, otp } = body;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    // Try native RPC first
    const { data: rpcData, error: rpcError } = await supabase.rpc('confirm_transfer', {
      p_transaction_id: transactionId,
      p_otp: otp,
    });

    if (!rpcError && rpcData?.success) {
      return NextResponse.json(rpcData);
    }

    // Fallback using service role
    const serviceClient = createServiceClient();

    // 1. Fetch challenge
    const { data: challenge, error: chErr } = await serviceClient
      .from('otp_challenges')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('consumed', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (chErr || !challenge) {
      return NextResponse.json({ success: false, message: 'No active OTP verification challenge found or challenge already consumed.' }, { status: 400 });
    }

    if (new Date(challenge.expires_at) < new Date()) {
      return NextResponse.json({ success: false, error_code: 'OTP_EXPIRED', message: 'Verification window has expired (5-minute limit).' }, { status: 400 });
    }

    if (challenge.attempts >= challenge.max_attempts) {
      return NextResponse.json({ success: false, error_code: 'OTP_ATTEMPTS_EXCEEDED', message: 'Maximum verification attempts exceeded.' }, { status: 400 });
    }

    // 2. Validate OTP
    const enteredHash = crypto.createHash('sha256').update(otp.trim()).digest('hex');

    if (enteredHash !== challenge.otp_hash) {
      const newAttempts = challenge.attempts + 1;
      await serviceClient
        .from('otp_challenges')
        .update({ attempts: newAttempts })
        .eq('id', challenge.id);

      const attemptsLeft = challenge.max_attempts - newAttempts;

      if (attemptsLeft <= 0) {
        await serviceClient
          .from('transactions')
          .update({ status: 'FAILED', failure_reason: 'OTP_ATTEMPTS_EXCEEDED: Maximum 3 attempts exhausted.' })
          .eq('id', transactionId);

        return NextResponse.json({
          success: false,
          error_code: 'OTP_ATTEMPTS_EXCEEDED',
          message: 'Maximum verification attempts reached. Transfer locked for security.',
          attempts_left: 0,
        }, { status: 400 });
      }

      return NextResponse.json({
        success: false,
        error_code: 'INVALID_OTP',
        message: `Incorrect security OTP. You have ${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining.`,
        attempts_left: attemptsLeft,
      }, { status: 400 });
    }

    // 3. OTP is Valid -> Complete Atomic Settlement
    const { data: txn, error: txnErr } = await serviceClient
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txnErr || !txn) {
      return NextResponse.json({ success: false, message: 'Transaction record not found.' }, { status: 400 });
    }

    const { data: fromAcc } = await serviceClient
      .from('accounts')
      .select('*')
      .eq('id', txn.from_account_id)
      .single();

    if (!fromAcc) {
      return NextResponse.json({ success: false, message: 'Source account not found.' }, { status: 400 });
    }

    if (Number(fromAcc.balance) < Number(txn.amount)) {
      await serviceClient
        .from('transactions')
        .update({ status: 'FAILED', failure_reason: 'INSUFFICIENT_FUNDS: Balance fell below transfer amount before confirmation.' })
        .eq('id', transactionId);

      return NextResponse.json({ success: false, message: 'Insufficient funds available for settlement.' }, { status: 400 });
    }

    // Debit source account
    const newFromBal = Number(fromAcc.balance) - Number(txn.amount);
    await serviceClient
      .from('accounts')
      .update({ balance: newFromBal, updated_at: new Date().toISOString() })
      .eq('id', fromAcc.id);

    // Credit internal destination account if exists
    const { data: toAcc } = await serviceClient
      .from('accounts')
      .select('*')
      .eq('account_number', txn.to_account_number)
      .single();

    if (toAcc) {
      const newToBal = Number(toAcc.balance) + Number(txn.amount);
      await serviceClient
        .from('accounts')
        .update({ balance: newToBal, updated_at: new Date().toISOString() })
        .eq('id', toAcc.id);
    }

    // Mark transaction SUCCESS
    const completedAt = new Date().toISOString();
    await serviceClient
      .from('transactions')
      .update({ status: 'SUCCESS', completed_at: completedAt })
      .eq('id', transactionId);

    // Mark challenge consumed
    await serviceClient
      .from('otp_challenges')
      .update({ consumed: true })
      .eq('id', challenge.id);

    // Audit log
    await serviceClient.from('audit_log').insert({
      user_id: user.id,
      action: 'TRANSFER_COMPLETED',
      details: {
        transaction_id: transactionId,
        reference_no: txn.reference_no,
        amount: txn.amount,
        from_account_number: fromAcc.account_number,
        to_account_number: txn.to_account_number,
        new_balance: newFromBal,
      },
    });

    return NextResponse.json({
      success: true,
      transaction_id: transactionId,
      reference_no: txn.reference_no,
      amount: txn.amount,
      completed_at: completedAt,
      from_account_number: fromAcc.account_number,
      to_account_number: txn.to_account_number,
    });
  } catch (error: any) {
    console.error('API transfer confirm error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error.' }, { status: 500 });
  }
}
