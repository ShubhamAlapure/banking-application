import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fromAccountId, toAccountNumber, amount, remarks, idempotencyKey } = body;

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const serviceClient = createServiceClient();
    const cleanKey = idempotencyKey || crypto.randomUUID();

    // 0. Idempotency Check: if exact key exists, reuse transaction
    const { data: existingTxn } = await serviceClient
      .from('transactions')
      .select('*')
      .eq('idempotency_key', cleanKey)
      .maybeSingle();

    if (existingTxn) {
      if (existingTxn.status === 'SUCCESS') {
        return NextResponse.json({
          success: true,
          transaction_id: existingTxn.id,
          reference_no: existingTxn.reference_no,
          amount: existingTxn.amount,
          message: 'Transaction already completed.',
        });
      }

      if (existingTxn.status === 'PENDING_OTP') {
        // Reuse or create challenge
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

        await serviceClient.from('otp_challenges').insert({
          transaction_id: existingTxn.id,
          user_id: user.id,
          otp_hash: otpHash,
          expires_at: expiresAt,
          attempts: 0,
          max_attempts: 3,
          consumed: false,
        });

        return NextResponse.json({
          success: true,
          transaction_id: existingTxn.id,
          reference_no: existingTxn.reference_no,
          amount: existingTxn.amount,
          simulated_otp: otpCode,
          expires_at: expiresAt,
          max_attempts: 3,
        });
      }
    }

    // 1. Validate source account
    const { data: fromAccount, error: accErr } = await serviceClient
      .from('accounts')
      .select('*')
      .eq('id', fromAccountId)
      .eq('owner_id', user.id)
      .single();

    if (accErr || !fromAccount) {
      return NextResponse.json({ success: false, message: 'Source account not found or access denied.' }, { status: 400 });
    }

    if (fromAccount.status === 'FROZEN') {
      return NextResponse.json({ success: false, message: 'Source account is FROZEN. Outbound transfers are blocked.' }, { status: 400 });
    }

    const numAmount = Number(amount);
    if (Number(fromAccount.balance) < numAmount) {
      return NextResponse.json({
        success: false,
        message: `Insufficient balance. Available: ₹${Number(fromAccount.balance).toLocaleString('en-IN')}, Requested: ₹${numAmount.toLocaleString('en-IN')}.`,
      }, { status: 400 });
    }

    // 2. Beneficiary details
    const { data: ben } = await serviceClient
      .from('beneficiaries')
      .select('*')
      .eq('owner_id', user.id)
      .eq('account_number', toAccountNumber)
      .maybeSingle();

    const { data: toInternal } = await serviceClient
      .from('accounts')
      .select('*, owner:profiles(full_name)')
      .eq('account_number', toAccountNumber)
      .maybeSingle();

    const beneficiaryName = ben?.beneficiary_name || toInternal?.owner?.full_name || 'Destination Account';

    // 3. Generate Reference Number & Transaction
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
    const referenceNo = `TXN${dateStr}${randomHex}`;

    const { data: txn, error: txnErr } = await serviceClient
      .from('transactions')
      .insert({
        from_account_id: fromAccountId,
        to_account_number: toAccountNumber,
        to_beneficiary_id: ben?.id || null,
        amount: numAmount,
        remarks: remarks || '',
        status: 'PENDING_OTP',
        idempotency_key: cleanKey,
        reference_no: referenceNo,
      })
      .select()
      .single();

    if (txnErr || !txn) {
      return NextResponse.json({ success: false, message: txnErr?.message || 'Failed to record transaction.' }, { status: 500 });
    }

    // 4. Generate 6-digit OTP & Hash
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    await serviceClient.from('otp_challenges').insert({
      transaction_id: txn.id,
      user_id: user.id,
      otp_hash: otpHash,
      expires_at: expiresAt,
      attempts: 0,
      max_attempts: 3,
      consumed: false,
    });

    // 5. Audit Log
    await serviceClient.from('audit_log').insert({
      user_id: user.id,
      action: 'TRANSFER_INITIATED',
      details: {
        transaction_id: txn.id,
        reference_no: referenceNo,
        amount: numAmount,
        from_account_id: fromAccountId,
        to_account_number: toAccountNumber,
      },
    });

    return NextResponse.json({
      success: true,
      transaction_id: txn.id,
      reference_no: referenceNo,
      amount: numAmount,
      beneficiary_name: beneficiaryName,
      simulated_otp: otpCode,
      expires_at: expiresAt,
      max_attempts: 3,
    });
  } catch (error: any) {
    console.error('API transfer initiation error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Internal server error.' }, { status: 500 });
  }
}
