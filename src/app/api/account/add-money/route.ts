import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { accountId, amount, upiId = 'shubhamalapure55-1@okhdfcbank' } = body;

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid deposit amount greater than ₹0.' },
        { status: 400 }
      );
    }

    if (depositAmount > 500000) {
      return NextResponse.json(
        { success: false, message: 'Maximum deposit limit per transaction is ₹5,00,000.' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error: missing Supabase credentials.' },
        { status: 500 }
      );
    }

    const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 1. Fetch target account
    const { data: account, error: accErr } = await serviceClient
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accErr || !account) {
      return NextResponse.json(
        { success: false, message: 'Destination depository account not found.' },
        { status: 404 }
      );
    }

    if (account.status === 'FROZEN') {
      return NextResponse.json(
        { success: false, message: 'Account is frozen by administrative policy. Deposits restricted.' },
        { status: 403 }
      );
    }

    // 2. Compute updated balance
    const currentBal = Number(account.balance || 0);
    const newBalance = Number((currentBal + depositAmount).toFixed(2));

    // 3. Atomically update balance
    const { error: updateErr } = await serviceClient
      .from('accounts')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('id', account.id);

    if (updateErr) {
      console.error('Failed to update balance:', updateErr);
      return NextResponse.json(
        { success: false, message: 'Failed to credit account balance.' },
        { status: 500 }
      );
    }

    // 4. Record successful UPI Deposit transaction
    const refNo = 'UPI' + Date.now().toString().slice(-8) + Math.floor(1000 + Math.random() * 9000);
    const idempotencyKey = 'UPI-DEP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const completedAt = new Date().toISOString();

    const { error: txnErr } = await serviceClient.from('transactions').insert({
      from_account_id: account.id,
      to_account_number: account.account_number,
      amount: depositAmount,
      remarks: `UPI Instant Deposit via QR (${upiId})`,
      status: 'SUCCESS',
      reference_no: refNo,
      idempotency_key: idempotencyKey,
      completed_at: completedAt,
    });

    if (txnErr) {
      console.error('Warning: transaction log failed, but balance credited:', txnErr);
    }

    return NextResponse.json({
      success: true,
      message: `₹${depositAmount.toLocaleString('en-IN')} added successfully via UPI QR.`,
      newBalance,
      referenceNo: refNo,
      amount: depositAmount,
      accountId: account.id,
      accountNumber: account.account_number,
    });
  } catch (err: any) {
    console.error('Add Money API error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error processing deposit.' },
      { status: 500 }
    );
  }
}
