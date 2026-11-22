// In-Memory & LocalStorage Backed Simulation Database for Offline & Localhost Demo
// Exactly mirrors Supabase Postgres schema, RLS policies, and RPC stored procedures

import { Account, Beneficiary, Transaction, Profile, AuditLog } from '@/types/database';

export interface MockState {
  currentUser: Profile | null;
  profiles: Profile[];
  accounts: Account[];
  beneficiaries: Beneficiary[];
  transactions: Transaction[];
  challenges: Array<{
    id: string;
    transaction_id: string;
    user_id: string;
    otp_code: string;
    otp_hash: string;
    expires_at: string;
    attempts: number;
    max_attempts: number;
    consumed: boolean;
  }>;
  audit_logs: AuditLog[];
}

const STORAGE_KEY = 'apex_bank_demo_db_v1';

export const INITIAL_MOCK_STATE: MockState = {
  currentUser: {
    id: '00000000-0000-0000-0000-000000000002',
    full_name: 'Rahul Sharma',
    role: 'customer',
    phone_masked: '+91 98*** **101',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  profiles: [
    {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'System Administrator',
      role: 'admin',
      phone_masked: '+91 98*** **999',
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      full_name: 'Rahul Sharma',
      role: 'customer',
      phone_masked: '+91 98*** **101',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      full_name: 'Priya Deshmukh',
      role: 'customer',
      phone_masked: '+91 98*** **202',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      full_name: 'Amit Patel',
      role: 'customer',
      phone_masked: '+91 98*** **303',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  accounts: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      owner_id: '00000000-0000-0000-0000-000000000002', // Rahul
      account_number: '100011112222',
      account_type: 'SAVINGS',
      balance: 75000.0,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'a0000000-0000-0000-0000-000000000002',
      owner_id: '00000000-0000-0000-0000-000000000002', // Rahul
      account_number: '100011113333',
      account_type: 'CURRENT',
      balance: 25000.0,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'a0000000-0000-0000-0000-000000000003',
      owner_id: '00000000-0000-0000-0000-000000000003', // Priya (Low balance for TC04)
      account_number: '200022224444',
      account_type: 'SAVINGS',
      balance: 500.0,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'a0000000-0000-0000-0000-000000000004',
      owner_id: '00000000-0000-0000-0000-000000000003', // Priya (Frozen for TC13)
      account_number: '200022225555',
      account_type: 'CURRENT',
      balance: 0.0,
      status: 'FROZEN',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'a0000000-0000-0000-0000-000000000005',
      owner_id: '00000000-0000-0000-0000-000000000004', // Amit
      account_number: '300033336666',
      account_type: 'SAVINGS',
      balance: 120000.0,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'a0000000-0000-0000-0000-000000000006',
      owner_id: '00000000-0000-0000-0000-000000000004', // Amit
      account_number: '300033337777',
      account_type: 'CURRENT',
      balance: 60000.0,
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  beneficiaries: [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      owner_id: '00000000-0000-0000-0000-000000000002', // Rahul's payee: Priya
      nickname: 'Priya Savings',
      beneficiary_name: 'Priya Deshmukh',
      account_number: '200022224444',
      bank_name: 'State Bank of India',
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      owner_id: '00000000-0000-0000-0000-000000000002', // Rahul's payee: Amit
      nickname: 'Amit Business',
      beneficiary_name: 'Amit Patel',
      account_number: '300033336666',
      bank_name: 'HDFC Bank',
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      owner_id: '00000000-0000-0000-0000-000000000003', // Priya's payee: Rahul
      nickname: 'Rahul Personal',
      beneficiary_name: 'Rahul Sharma',
      account_number: '100011112222',
      bank_name: 'State Bank of India',
      status: 'ACTIVE',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  transactions: [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      from_account_id: 'a0000000-0000-0000-0000-000000000001',
      to_account_number: '200022224444',
      to_beneficiary_id: 'b0000000-0000-0000-0000-000000000001',
      amount: 5000.0,
      remarks: 'Semester book allowance',
      status: 'SUCCESS',
      failure_reason: null,
      idempotency_key: 'idemp-seed-001',
      reference_no: 'TXN20261120100001',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 2 + 15000).toISOString(),
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      from_account_id: 'a0000000-0000-0000-0000-000000000001',
      to_account_number: '300033336666',
      to_beneficiary_id: 'b0000000-0000-0000-0000-000000000002',
      amount: 12500.0,
      remarks: 'Laptop shared payment',
      status: 'SUCCESS',
      failure_reason: null,
      idempotency_key: 'idemp-seed-002',
      reference_no: 'TXN20261121110002',
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 1 + 20000).toISOString(),
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      from_account_id: 'a0000000-0000-0000-0000-000000000003', // Priya
      to_account_number: '100011112222',
      to_beneficiary_id: 'b0000000-0000-0000-0000-000000000003',
      amount: 2000.0,
      remarks: 'Dinner split',
      status: 'FAILED',
      failure_reason: 'INSUFFICIENT_BALANCE: Available balance is ₹500.00 but transfer requires ₹2,000.00',
      idempotency_key: 'idemp-seed-003',
      reference_no: 'TXN20261121140003',
      created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
    {
      id: 'c0000000-0000-0000-0000-000000000004',
      from_account_id: 'a0000000-0000-0000-0000-000000000001',
      to_account_number: '200022224444',
      to_beneficiary_id: 'b0000000-0000-0000-0000-000000000001',
      amount: 1500.0,
      remarks: 'Stationery bill',
      status: 'FAILED',
      failure_reason: 'OTP_ATTEMPTS_EXCEEDED: Incorrect OTP entered 3 times.',
      idempotency_key: 'idemp-seed-004',
      reference_no: 'TXN20261121160004',
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 12 + 120000).toISOString(),
    },
    {
      id: 'c0000000-0000-0000-0000-000000000005',
      from_account_id: 'a0000000-0000-0000-0000-000000000001',
      to_account_number: '200022224444',
      to_beneficiary_id: 'b0000000-0000-0000-0000-000000000001',
      amount: 350.0,
      remarks: 'Coffee and snacks',
      status: 'CANCELLED',
      failure_reason: 'TRANSFER_CANCELLED_BY_USER',
      idempotency_key: 'idemp-seed-006',
      reference_no: 'TXN20261122100006',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 4 + 60000).toISOString(),
    },
  ],
  challenges: [],
  audit_logs: [
    {
      id: 'log-001',
      user_id: '00000000-0000-0000-0000-000000000001',
      action: 'SYSTEM_BOOT',
      details: { environment: 'local_demo', version: '1.0.0' },
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
    {
      id: 'log-002',
      user_id: '00000000-0000-0000-0000-000000000002',
      action: 'TRANSFER_SUCCESS',
      details: { reference_no: 'TXN20261120100001', amount: 5000.0 },
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
};

class MockDatabase {
  private state: MockState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): MockState {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse mock state from localStorage', e);
        }
      }
    }
    return JSON.parse(JSON.stringify(INITIAL_MOCK_STATE));
  }

  private saveState() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('Failed to save mock state to localStorage', e);
      }
    }
  }

  public resetState() {
    this.state = JSON.parse(JSON.stringify(INITIAL_MOCK_STATE));
    this.saveState();
  }

  public getCurrentUser(): Profile | null {
    return this.state.currentUser;
  }

  public setCurrentUser(user: Profile | null) {
    this.state.currentUser = user;
    this.saveState();
  }

  public getProfiles(): Profile[] {
    return this.state.profiles;
  }

  // RLS-guarded accounts query
  public getAccounts(ownerId?: string): Account[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    if (user.role === 'admin') {
      return this.state.accounts.map((a) => ({
        ...a,
        owner: this.state.profiles.find((p) => p.id === a.owner_id),
      }));
    }
    return this.state.accounts
      .filter((a) => a.owner_id === user.id)
      .map((a) => ({
        ...a,
        owner: user,
      }));
  }

  // RLS-guarded beneficiaries query
  public getBeneficiaries(): Beneficiary[] {
    const user = this.getCurrentUser();
    if (!user) return [];
    if (user.role === 'admin') return this.state.beneficiaries;
    return this.state.beneficiaries.filter((b) => b.owner_id === user.id);
  }

  public addBeneficiary(ben: Omit<Beneficiary, 'id' | 'created_at'>): Beneficiary {
    const newBen: Beneficiary = {
      ...ben,
      id: 'ben-' + Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
    };
    this.state.beneficiaries.push(newBen);
    this.saveState();
    return newBen;
  }

  public updateBeneficiaryNickname(id: string, nickname: string) {
    const ben = this.state.beneficiaries.find((b) => b.id === id);
    if (ben) {
      ben.nickname = nickname;
      this.saveState();
    }
  }

  public deleteBeneficiary(id: string) {
    this.state.beneficiaries = this.state.beneficiaries.filter((b) => b.id !== id);
    this.saveState();
  }

  // RLS-guarded transactions query
  public getTransactions(): Transaction[] {
    const user = this.getCurrentUser();
    if (!user) return [];

    const accounts = this.state.accounts.filter((a) => a.owner_id === user.id);
    const accountIds = accounts.map((a) => a.id);
    const accountNumbers = accounts.map((a) => a.account_number);

    let txns = this.state.transactions;
    if (user.role !== 'admin') {
      txns = txns.filter(
        (t) => accountIds.includes(t.from_account_id) || accountNumbers.includes(t.to_account_number)
      );
    }

    return txns.map((t) => ({
      ...t,
      beneficiary: this.state.beneficiaries.find((b) => b.id === t.to_beneficiary_id),
      from_account: this.state.accounts.find((a) => a.id === t.from_account_id),
    }));
  }

  public getAuditLogs(): AuditLog[] {
    return this.state.audit_logs.map((l) => ({
      ...l,
      user: this.state.profiles.find((p) => p.id === l.user_id),
    }));
  }

  // Exact RPC: initiate_transfer
  public initiateTransfer(params: {
    from_account_id: string;
    to_account_number: string;
    amount: number;
    remarks: string;
    idempotency_key: string;
  }) {
    const user = this.getCurrentUser();
    if (!user) {
      return { success: false, error_code: 'AUTH_REQUIRED', message: 'User must be authenticated.' };
    }

    // 1. Idempotency Check
    const existing = this.state.transactions.find((t) => t.idempotency_key === params.idempotency_key);
    if (existing) {
      return {
        success: true,
        is_duplicate_replay: true,
        transaction_id: existing.id,
        reference_no: existing.reference_no,
        status: existing.status,
        amount: existing.amount,
        message: 'Retrieved existing transaction for this idempotency key.',
      };
    }

    const refNo = 'TXN' + new Date().toISOString().replace(/\D/g, '').slice(0, 8) + Math.floor(100000 + Math.random() * 900000);

    // 2. Amount boundary checks
    if (!params.amount || params.amount <= 0) {
      return { success: false, error_code: 'INVALID_AMOUNT', message: 'Amount must be greater than zero.' };
    }
    if (params.amount < 1.0) {
      return { success: false, error_code: 'INVALID_AMOUNT', message: 'Minimum transfer amount is ₹1.00.' };
    }
    if (params.amount > 100000.0) {
      return { success: false, error_code: 'INVALID_AMOUNT', message: 'Maximum transfer amount per transaction is ₹1,00,000.00.' };
    }
    if (params.amount !== Number(params.amount.toFixed(2))) {
      return { success: false, error_code: 'INVALID_AMOUNT', message: 'Amount cannot have more than 2 decimal places.' };
    }

    // 3. Source Account Validation
    const fromAcc = this.state.accounts.find((a) => a.id === params.from_account_id && a.owner_id === user.id);
    if (!fromAcc) {
      return { success: false, error_code: 'SOURCE_ACCOUNT_INVALID', message: 'Source account not found or unauthorized.' };
    }
    if (fromAcc.status === 'FROZEN') {
      this.recordFailedTxn(params, fromAcc.id, 'ACCOUNT_FROZEN: Source account is frozen. Outward transfers locked.', refNo);
      return { success: false, error_code: 'ACCOUNT_FROZEN', message: 'Source account is frozen. Transactions disabled.' };
    }

    // 4. Duplicate window check (60s)
    const recentDuplicate = this.state.transactions.find(
      (t) =>
        t.from_account_id === params.from_account_id &&
        t.to_account_number === params.to_account_number &&
        t.amount === params.amount &&
        (t.status === 'PENDING_OTP' || t.status === 'SUCCESS') &&
        Date.now() - new Date(t.created_at).getTime() < 60000
    );
    if (recentDuplicate) {
      this.recordFailedTxn(params, fromAcc.id, 'DUPLICATE_SUBMISSION: Identical transfer within 60 seconds.', refNo);
      return {
        success: false,
        error_code: 'DUPLICATE_SUBMISSION',
        message: 'Duplicate submission detected: identical transfer within 60 seconds. Please wait before retrying.',
      };
    }

    // 5. Destination Account Validation
    if (fromAcc.account_number === params.to_account_number) {
      return { success: false, error_code: 'SELF_TRANSFER_INVALID', message: 'Source and destination accounts cannot be identical.' };
    }

    const toAcc = this.state.accounts.find((a) => a.account_number === params.to_account_number);
    if (!toAcc) {
      this.recordFailedTxn(params, fromAcc.id, 'DESTINATION_ACCOUNT_NOT_FOUND: Account does not exist.', refNo);
      return { success: false, error_code: 'DESTINATION_ACCOUNT_NOT_FOUND', message: 'Destination account does not exist in the system.' };
    }

    // 6. Beneficiary validation
    const ben = this.state.beneficiaries.find((b) => b.owner_id === user.id && b.account_number === params.to_account_number);
    if (!ben) {
      this.recordFailedTxn(params, fromAcc.id, 'BENEFICIARY_NOT_FOUND: Destination not in beneficiaries.', refNo);
      return { success: false, error_code: 'BENEFICIARY_NOT_FOUND', message: 'Destination account must be added to your beneficiaries first.' };
    }

    // 7. Balance Check
    if (fromAcc.balance < params.amount) {
      this.recordFailedTxn(params, fromAcc.id, `INSUFFICIENT_BALANCE: Available balance is ₹${fromAcc.balance.toFixed(2)} but transfer requires ₹${params.amount.toFixed(2)}`, refNo);
      return {
        success: false,
        error_code: 'INSUFFICIENT_BALANCE',
        available_balance: fromAcc.balance,
        message: `Insufficient balance. Available: ₹${fromAcc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}, Requested: ₹${params.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      };
    }

    // 8. Daily Limit (200,000.00)
    const past24hTxns = this.state.transactions.filter(
      (t) =>
        t.from_account_id === fromAcc.id &&
        (t.status === 'SUCCESS' || t.status === 'PENDING_OTP') &&
        Date.now() - new Date(t.created_at).getTime() < 86400000
    );
    const dailyTotal = past24hTxns.reduce((sum, t) => sum + t.amount, 0);
    if (dailyTotal + params.amount > 200000.0) {
      this.recordFailedTxn(params, fromAcc.id, `DAILY_LIMIT_EXCEEDED: Exceeds 24h limit of ₹2,00,000.00 (Current 24h usage: ₹${dailyTotal})`, refNo);
      return { success: false, error_code: 'DAILY_LIMIT_EXCEEDED', message: 'Daily transfer limit exceeded (Maximum ₹2,00,000.00 per 24 hours).' };
    }

    // 9. Create Transaction
    const txnId = 'txn-' + Math.random().toString(36).substring(2, 10);
    const newTxn: Transaction = {
      id: txnId,
      from_account_id: fromAcc.id,
      to_account_number: params.to_account_number,
      to_beneficiary_id: ben.id,
      amount: params.amount,
      remarks: params.remarks,
      status: 'PENDING_OTP',
      failure_reason: null,
      idempotency_key: params.idempotency_key,
      reference_no: refNo,
      created_at: new Date().toISOString(),
      completed_at: null,
    };
    this.state.transactions.unshift(newTxn);

    // 10. Generate 6-digit OTP challenge
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 300000).toISOString(); // 5 minutes

    this.state.challenges.push({
      id: 'ch-' + Math.random().toString(36).substring(2, 8),
      transaction_id: txnId,
      user_id: user.id,
      otp_code: otpCode,
      otp_hash: 'hash_' + otpCode,
      expires_at: expiresAt,
      attempts: 0,
      max_attempts: 3,
      consumed: false,
    });

    this.saveState();

    return {
      success: true,
      transaction_id: txnId,
      reference_no: refNo,
      amount: params.amount,
      beneficiary_name: ben.beneficiary_name,
      simulated_otp: otpCode,
      expires_at: expiresAt,
      max_attempts: 3,
    };
  }

  // Exact RPC: confirm_transfer
  public confirmTransfer(transactionId: string, enteredOtp: string) {
    const user = this.getCurrentUser();
    if (!user) return { success: false, message: 'Authentication required' };

    const txn = this.state.transactions.find((t) => t.id === transactionId);
    if (!txn || txn.status !== 'PENDING_OTP') {
      return { success: false, message: 'Transaction session is invalid or already resolved.' };
    }

    const challenge = this.state.challenges.find((c) => c.transaction_id === transactionId && !c.consumed);
    if (!challenge) {
      txn.status = 'FAILED';
      txn.failure_reason = 'OTP_EXPIRED: No active OTP challenge found.';
      txn.completed_at = new Date().toISOString();
      this.saveState();
      return { success: false, error_code: 'OTP_EXPIRED', message: 'Verification session expired.' };
    }

    // Check expiry
    if (Date.now() > new Date(challenge.expires_at).getTime()) {
      challenge.consumed = true;
      txn.status = 'FAILED';
      txn.failure_reason = 'OTP_EXPIRED: The OTP has expired after 5 minutes.';
      txn.completed_at = new Date().toISOString();
      this.saveState();
      return { success: false, error_code: 'OTP_EXPIRED', message: 'The OTP has expired after 5 minutes. Transfer failed.' };
    }

    // Check OTP Match
    if (challenge.otp_code !== enteredOtp.trim()) {
      challenge.attempts += 1;
      if (challenge.attempts >= challenge.max_attempts) {
        challenge.consumed = true;
        txn.status = 'FAILED';
        txn.failure_reason = 'OTP_ATTEMPTS_EXCEEDED: Incorrect OTP entered 3 times.';
        txn.completed_at = new Date().toISOString();
        this.saveState();
        return {
          success: false,
          error_code: 'OTP_ATTEMPTS_EXCEEDED',
          attempts_left: 0,
          message: 'Maximum 3 attempts exceeded. Transaction marked as FAILED.',
        };
      } else {
        this.saveState();
        const left = challenge.max_attempts - challenge.attempts;
        return {
          success: false,
          error_code: 'INVALID_OTP',
          attempts_left: left,
          message: `Incorrect OTP. ${left} attempt(s) remaining.`,
        };
      }
    }

    // OTP Valid! ATOMIC TRANSFER EXECUTION (SELECT FOR UPDATE)
    const sourceAcc = this.state.accounts.find((a) => a.id === txn.from_account_id);
    const destAcc = this.state.accounts.find((a) => a.account_number === txn.to_account_number);

    if (!sourceAcc || !destAcc) {
      txn.status = 'FAILED';
      txn.failure_reason = 'ACCOUNT_NOT_FOUND';
      challenge.consumed = true;
      this.saveState();
      return { success: false, message: 'Account error during settlement.' };
    }

    if (sourceAcc.status === 'FROZEN') {
      txn.status = 'FAILED';
      txn.failure_reason = 'ACCOUNT_FROZEN: Source account was frozen prior to confirmation.';
      challenge.consumed = true;
      this.saveState();
      return { success: false, error_code: 'ACCOUNT_FROZEN', message: 'Source account is frozen. Transfer halted.' };
    }

    if (sourceAcc.balance < txn.amount) {
      txn.status = 'FAILED';
      txn.failure_reason = 'INSUFFICIENT_BALANCE: Balance insufficient at confirmation.';
      challenge.consumed = true;
      this.saveState();
      return { success: false, error_code: 'INSUFFICIENT_BALANCE', message: 'Insufficient balance.' };
    }

    // Atomic debit & credit
    sourceAcc.balance -= txn.amount;
    sourceAcc.updated_at = new Date().toISOString();

    destAcc.balance += txn.amount;
    destAcc.updated_at = new Date().toISOString();

    challenge.consumed = true;
    txn.status = 'SUCCESS';
    txn.completed_at = new Date().toISOString();

    this.state.audit_logs.unshift({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      action: 'TRANSFER_SUCCESS',
      details: {
        reference_no: txn.reference_no,
        amount: txn.amount,
        from_account: sourceAcc.account_number,
        to_account: destAcc.account_number,
        source_new_balance: sourceAcc.balance,
      },
      created_at: new Date().toISOString(),
    });

    this.saveState();

    return {
      success: true,
      transaction_id: txn.id,
      reference_no: txn.reference_no,
      amount: txn.amount,
      from_account_number: sourceAcc.account_number,
      to_account_number: destAcc.account_number,
      status: 'SUCCESS',
      message: 'Transfer completed successfully.',
    };
  }

  // Exact RPC: cancel_transfer
  public cancelTransfer(transactionId: string) {
    const txn = this.state.transactions.find((t) => t.id === transactionId);
    if (txn && txn.status === 'PENDING_OTP') {
      txn.status = 'CANCELLED';
      txn.failure_reason = 'TRANSFER_CANCELLED_BY_USER';
      txn.completed_at = new Date().toISOString();
      const challenge = this.state.challenges.find((c) => c.transaction_id === transactionId);
      if (challenge) challenge.consumed = true;
      this.saveState();
      return { success: true, message: 'Transfer cancelled.' };
    }
    return { success: false, message: 'Transaction not found or not pending.' };
  }

  // Exact RPC: resend_transfer_otp
  public resendTransferOtp(transactionId: string) {
    const txn = this.state.transactions.find((t) => t.id === transactionId);
    if (!txn || txn.status !== 'PENDING_OTP') {
      return { success: false, message: 'Cannot resend OTP for inactive transaction.' };
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 300000).toISOString();

    const existingChallenge = this.state.challenges.find((c) => c.transaction_id === transactionId && !c.consumed);
    if (existingChallenge) {
      existingChallenge.consumed = true;
    }

    this.state.challenges.push({
      id: 'ch-' + Math.random().toString(36).substring(2, 8),
      transaction_id: transactionId,
      user_id: txn.from_account_id,
      otp_code: newOtp,
      otp_hash: 'hash_' + newOtp,
      expires_at: expiresAt,
      attempts: 0,
      max_attempts: 3,
      consumed: false,
    });

    this.saveState();

    return {
      success: true,
      transaction_id: transactionId,
      simulated_otp: newOtp,
      expires_at: expiresAt,
      message: 'A new simulated OTP has been generated.',
    };
  }

  // Exact RPC: admin_freeze_account
  public adminFreezeAccount(accountId: string, reason: string) {
    const acc = this.state.accounts.find((a) => a.id === accountId);
    if (!acc) return { success: false, message: 'Account not found.' };

    acc.status = 'FROZEN';
    acc.updated_at = new Date().toISOString();

    const user = this.getCurrentUser();
    this.state.audit_logs.unshift({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      user_id: user?.id || null,
      action: 'ACCOUNT_FROZEN',
      details: { account_number: acc.account_number, reason },
      created_at: new Date().toISOString(),
    });

    this.saveState();
    return { success: true, status: 'FROZEN', message: `Account ${acc.account_number} frozen.` };
  }

  // Exact RPC: admin_unfreeze_account
  public adminUnfreezeAccount(accountId: string, reason: string) {
    const acc = this.state.accounts.find((a) => a.id === accountId);
    if (!acc) return { success: false, message: 'Account not found.' };

    acc.status = 'ACTIVE';
    acc.updated_at = new Date().toISOString();

    const user = this.getCurrentUser();
    this.state.audit_logs.unshift({
      id: 'log-' + Math.random().toString(36).substring(2, 9),
      user_id: user?.id || null,
      action: 'ACCOUNT_UNFROZEN',
      details: { account_number: acc.account_number, reason },
      created_at: new Date().toISOString(),
    });

    this.saveState();
    return { success: true, status: 'ACTIVE', message: `Account ${acc.account_number} reactivated.` };
  }

  // Record failed transaction for ledger history
  private recordFailedTxn(
    params: { from_account_id: string; to_account_number: string; amount: number; remarks: string; idempotency_key: string },
    fromAccId: string,
    reason: string,
    refNo: string
  ) {
    this.state.transactions.unshift({
      id: 'txn-' + Math.random().toString(36).substring(2, 10),
      from_account_id: fromAccId,
      to_account_number: params.to_account_number,
      to_beneficiary_id: null,
      amount: params.amount || 0,
      remarks: params.remarks || '',
      status: 'FAILED',
      failure_reason: reason,
      idempotency_key: params.idempotency_key,
      reference_no: refNo,
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });
    this.saveState();
  }
}

export const mockDb = new MockDatabase();
