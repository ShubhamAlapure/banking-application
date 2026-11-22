export type UserRole = 'customer' | 'admin';

export type AccountType = 'SAVINGS' | 'CURRENT';
export type AccountStatus = 'ACTIVE' | 'FROZEN';

export type TransactionStatus = 'PENDING_OTP' | 'SUCCESS' | 'FAILED' | 'CANCELLED';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  phone_masked: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  owner_id: string;
  account_number: string;
  account_type: AccountType;
  balance: number;
  status: AccountStatus;
  created_at: string;
  updated_at: string;
  owner?: Profile;
}

export interface Beneficiary {
  id: string;
  owner_id: string;
  nickname: string;
  beneficiary_name: string;
  account_number: string;
  bank_name: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
}

export interface Transaction {
  id: string;
  from_account_id: string;
  to_account_number: string;
  to_beneficiary_id: string | null;
  amount: number;
  remarks: string | null;
  status: TransactionStatus;
  failure_reason: string | null;
  idempotency_key: string;
  reference_no: string;
  created_at: string;
  completed_at: string | null;
  from_account?: Account;
  beneficiary?: Beneficiary;
}

export interface OTPChallenge {
  id: string;
  transaction_id: string;
  user_id: string;
  otp_hash: string;
  expires_at: string;
  attempts: number;
  max_attempts: number;
  consumed: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  details: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
  user?: Profile;
}
