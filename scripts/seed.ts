import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const isReset = process.argv.includes('--reset');

async function seed() {
  console.log(`\n🌱 Starting Banking Demo Database Seed ${isReset ? '(RESET MODE)' : ''}...`);

  const demoUsers = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@demo.bank',
      password: 'Admin@12345',
      fullName: 'System Administrator',
      role: 'admin',
      phone: '+91 98*** **999',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'rahul@demo.bank',
      password: 'Demo@12345',
      fullName: 'Rahul Sharma',
      role: 'customer',
      phone: '+91 98*** **101',
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'priya@demo.bank',
      password: 'Demo@12345',
      fullName: 'Priya Deshmukh',
      role: 'customer',
      phone: '+91 98*** **202',
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'amit@demo.bank',
      password: 'Demo@12345',
      fullName: 'Amit Patel',
      role: 'customer',
      phone: '+91 98*** **303',
    },
  ];

  // 1. Create or ensure Auth Users
  console.log('1. Checking & creating demo auth users...');
  for (const user of demoUsers) {
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users.find((u) => u.email === user.email);

    if (!existing) {
      const { error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: {
          full_name: user.fullName,
          role: user.role,
        },
      });
      if (error) {
        console.warn(`Notice creating ${user.email}:`, error.message);
      } else {
        console.log(`  ✓ Created auth user: ${user.email}`);
      }
    } else {
      // Update password and metadata
      await supabase.auth.admin.updateUserById(existing.id, {
        password: user.password,
        user_metadata: {
          full_name: user.fullName,
          role: user.role,
        },
      });
      console.log(`  ✓ Updated auth user: ${user.email}`);
    }

    // Ensure Profile
    const { data: matched } = await supabase.auth.admin.listUsers();
    const current = matched?.users.find((u) => u.email === user.email);
    if (current) {
      await supabase.from('profiles').upsert({
        id: current.id,
        full_name: user.fullName,
        role: user.role,
        phone_masked: user.phone,
      });
    }
  }

  // Get user UUIDs
  const { data: allUsers } = await supabase.auth.admin.listUsers();
  const rahulId = allUsers?.users.find((u) => u.email === 'rahul@demo.bank')?.id;
  const priyaId = allUsers?.users.find((u) => u.email === 'priya@demo.bank')?.id;
  const amitId = allUsers?.users.find((u) => u.email === 'amit@demo.bank')?.id;

  if (!rahulId || !priyaId || !amitId) {
    console.error('❌ Failed to retrieve user IDs for customers');
    process.exit(1);
  }

  // If reset mode, clear transactions, otp_challenges, beneficiaries, and accounts
  if (isReset) {
    console.log('Cleaning existing demo data...');
    await supabase.from('otp_challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('beneficiaries').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('accounts').delete().in('owner_id', [rahulId, priyaId, amitId]);
  }

  // 2. Insert Accounts with varied balances
  console.log('2. Seeding accounts...');
  const demoAccounts = [
    {
      owner_id: rahulId,
      account_number: '100011112222',
      account_type: 'SAVINGS',
      balance: 75000.0,
      status: 'ACTIVE',
    },
    {
      owner_id: rahulId,
      account_number: '100011113333',
      account_type: 'CURRENT',
      balance: 25000.0,
      status: 'ACTIVE',
    },
    {
      owner_id: priyaId,
      account_number: '200022224444',
      account_type: 'SAVINGS',
      balance: 500.0, // Low balance for negative test case TC04!
      status: 'ACTIVE',
    },
    {
      owner_id: priyaId,
      account_number: '200022225555',
      account_type: 'CURRENT',
      balance: 0.0,
      status: 'FROZEN', // Frozen for TC13!
    },
    {
      owner_id: amitId,
      account_number: '300033336666',
      account_type: 'SAVINGS',
      balance: 120000.0,
      status: 'ACTIVE',
    },
    {
      owner_id: amitId,
      account_number: '300033337777',
      account_type: 'CURRENT',
      balance: 60000.0,
      status: 'ACTIVE',
    },
  ];

  for (const acc of demoAccounts) {
    const { error } = await supabase.from('accounts').upsert(acc, { onConflict: 'account_number' });
    if (error) console.warn('Account insert error:', error.message);
  }
  console.log('  ✓ Accounts seeded successfully.');

  // 3. Seed Beneficiaries
  console.log('3. Seeding beneficiaries...');
  const demoBeneficiaries = [
    {
      owner_id: rahulId,
      nickname: 'Priya Savings',
      beneficiary_name: 'Priya Deshmukh',
      account_number: '200022224444',
      bank_name: 'Demo Bank of Pune',
      status: 'ACTIVE',
    },
    {
      owner_id: rahulId,
      nickname: 'Amit Business',
      beneficiary_name: 'Amit Patel',
      account_number: '300033336666',
      bank_name: 'Demo Bank of Mumbai',
      status: 'ACTIVE',
    },
    {
      owner_id: priyaId,
      nickname: 'Rahul Personal',
      beneficiary_name: 'Rahul Sharma',
      account_number: '100011112222',
      bank_name: 'Demo Bank of Pune',
      status: 'ACTIVE',
    },
    {
      owner_id: amitId,
      nickname: 'Rahul College',
      beneficiary_name: 'Rahul Sharma',
      account_number: '100011112222',
      bank_name: 'Demo Bank of Pune',
      status: 'ACTIVE',
    },
  ];

  for (const ben of demoBeneficiaries) {
    const { error } = await supabase.from('beneficiaries').upsert(ben, { onConflict: 'owner_id,account_number' });
    if (error) console.warn('Beneficiary insert error:', error.message);
  }
  console.log('  ✓ Beneficiaries seeded successfully.');

  // 4. Seed Historic Transactions
  console.log('4. Seeding historic transactions...');
  const { data: rahulAcc } = await supabase.from('accounts').select('id').eq('account_number', '100011112222').single();
  const { data: priyaAcc } = await supabase.from('accounts').select('id').eq('account_number', '200022224444').single();
  const { data: amitAcc } = await supabase.from('accounts').select('id').eq('account_number', '300033336666').single();

  if (rahulAcc && priyaAcc && amitAcc) {
    const historicTxns: Array<{
      from_account_id: string;
      to_account_number: string;
      amount: number;
      remarks: string;
      status: string;
      failure_reason: string | null;
      idempotency_key: string;
      reference_no: string;
    }> = [
      {
        from_account_id: rahulAcc.id,
        to_account_number: '200022224444',
        amount: 5000.0,
        remarks: 'Semester book allowance',
        status: 'SUCCESS',
        failure_reason: null,
        idempotency_key: 'idemp-seed-001',
        reference_no: 'TXN20261120100001',
      },
      {
        from_account_id: rahulAcc.id,
        to_account_number: '300033336666',
        amount: 12500.0,
        remarks: 'Laptop shared payment',
        status: 'SUCCESS',
        failure_reason: null,
        idempotency_key: 'idemp-seed-002',
        reference_no: 'TXN20261121110002',
      },
      {
        from_account_id: priyaAcc.id,
        to_account_number: '100011112222',
        amount: 2000.0,
        remarks: 'Dinner split',
        status: 'FAILED',
        failure_reason: 'INSUFFICIENT_BALANCE: Available balance is ₹500.00 but transfer requires ₹2,000.00',
        idempotency_key: 'idemp-seed-003',
        reference_no: 'TXN20261121140003',
      },
      {
        from_account_id: rahulAcc.id,
        to_account_number: '200022224444',
        amount: 1500.0,
        remarks: 'Stationery bill',
        status: 'FAILED',
        failure_reason: 'OTP_ATTEMPTS_EXCEEDED: Incorrect OTP entered 3 times.',
        idempotency_key: 'idemp-seed-004',
        reference_no: 'TXN20261121160004',
      },
      {
        from_account_id: amitAcc.id,
        to_account_number: '100011112222',
        amount: 25000.0,
        remarks: 'Client retainer advance',
        status: 'SUCCESS',
        failure_reason: null,
        idempotency_key: 'idemp-seed-005',
        reference_no: 'TXN20261122090005',
      },
      {
        from_account_id: rahulAcc.id,
        to_account_number: '200022224444',
        amount: 350.0,
        remarks: 'Coffee and snacks',
        status: 'CANCELLED',
        failure_reason: 'TRANSFER_CANCELLED_BY_USER',
        idempotency_key: 'idemp-seed-006',
        reference_no: 'TXN20261122100006',
      },
      {
        from_account_id: rahulAcc.id,
        to_account_number: '200022224444',
        amount: 800.0,
        remarks: 'Mobile recharge gift',
        status: 'FAILED',
        failure_reason: 'OTP_EXPIRED: The OTP has expired after 5 minutes.',
        idempotency_key: 'idemp-seed-008',
        reference_no: 'TXN20261122120008',
      },
      {
        from_account_id: amitAcc.id,
        to_account_number: '100011112222',
        amount: 15000.0,
        remarks: 'Equipment reimbursement',
        status: 'SUCCESS',
        failure_reason: null,
        idempotency_key: 'idemp-seed-009',
        reference_no: 'TXN20261122130009',
      },
    ];

    for (const txn of historicTxns) {
      await supabase.from('transactions').upsert(txn, { onConflict: 'reference_no' });
    }
    console.log('  ✓ Historic transactions seeded successfully.');
  }

  console.log('\n✅ Database seed completed successfully!');
  console.log('\nDemo User Credentials:');
  console.log('  - Admin:    admin@demo.bank / Admin@12345');
  console.log('  - Customer: rahul@demo.bank / Demo@12345 (Balance: ₹75,000.00)');
  console.log('  - Customer: priya@demo.bank / Demo@12345 (Balance: ₹500.00 - Low Balance Demo)');
  console.log('  - Customer: amit@demo.bank  / Demo@12345 (Balance: ₹1,20,000.00)');
}

seed().catch((err) => {
  console.error('❌ Seed script error:', err);
  process.exit(1);
});
