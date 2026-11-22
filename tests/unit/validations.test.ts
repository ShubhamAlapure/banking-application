import { describe, it, expect } from 'vitest';
import {
  transferInitiateSchema,
  beneficiarySchema,
  registerSchema,
  otpVerifySchema,
  accountNumberRegex,
  otpRegex,
} from '@/lib/validations';

describe('Zod Validation Schemas & Business Rules', () => {
  describe('Account Number & OTP Patterns', () => {
    it('TC05: rejects non-numeric or invalid length account numbers', () => {
      expect(accountNumberRegex.test('12345')).toBe(false); // too short
      expect(accountNumberRegex.test('1234567890123')).toBe(false); // 13 digits (too long)
      expect(accountNumberRegex.test('12345678901a')).toBe(false); // letters
      expect(accountNumberRegex.test('1234-5678-9012')).toBe(false); // hyphens
      expect(accountNumberRegex.test('100011112222')).toBe(true); // valid 12 digits
    });

    it('validates 6-digit OTP codes strictly', () => {
      expect(otpRegex.test('12345')).toBe(false); // 5 digits
      expect(otpRegex.test('1234567')).toBe(false); // 7 digits
      expect(otpRegex.test('12a456')).toBe(false); // alphanumeric
      expect(otpRegex.test('982341')).toBe(true); // valid 6 digits
    });
  });

  describe('Transfer Amount Boundary Validation (TC06, TC10, TC11)', () => {
    const validBase = {
      fromAccountId: '11111111-1111-1111-1111-111111111111',
      toAccountNumber: '200022224444',
      remarks: 'Test transfer',
      idempotencyKey: 'idemp-test-key-123',
    };

    it('TC06: rejects zero, negative amounts, and text', () => {
      expect(transferInitiateSchema.safeParse({ ...validBase, amount: 0 }).success).toBe(false);
      expect(transferInitiateSchema.safeParse({ ...validBase, amount: -50 }).success).toBe(false);
      expect(transferInitiateSchema.safeParse({ ...validBase, amount: 'abc' }).success).toBe(false);
    });

    it('TC06: rejects more than 2 decimal places (e.g. 3 decimals)', () => {
      const res = transferInitiateSchema.safeParse({ ...validBase, amount: 100.555 });
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0].message).toContain('more than 2 decimal places');
      }
    });

    it('TC11: accepts exactly 1.00 (min boundary) and 100000.00 (max boundary)', () => {
      const minRes = transferInitiateSchema.safeParse({ ...validBase, amount: 1.0 });
      expect(minRes.success).toBe(true);

      const maxRes = transferInitiateSchema.safeParse({ ...validBase, amount: 100000.0 });
      expect(maxRes.success).toBe(true);
    });

    it('TC11: rejects 0.99 (below min) and 100000.01 (above max)', () => {
      const underMin = transferInitiateSchema.safeParse({ ...validBase, amount: 0.99 });
      expect(underMin.success).toBe(false);
      if (!underMin.success) {
        expect(underMin.error.issues[0].message).toContain('Minimum transfer amount is ₹1.00');
      }

      const overMax = transferInitiateSchema.safeParse({ ...validBase, amount: 100000.01 });
      expect(overMax.success).toBe(false);
      if (!overMax.success) {
        expect(overMax.error.issues[0].message).toContain('Maximum transfer amount');
      }
    });
  });

  describe('Beneficiary Validation (TC03)', () => {
    it('TC03: accepts valid beneficiary data', () => {
      const res = beneficiarySchema.safeParse({
        nickname: 'Priya Savings',
        beneficiaryName: 'Priya Deshmukh',
        accountNumber: '200022224444',
        bankName: 'Demo Bank of Pune',
      });
      expect(res.success).toBe(true);
    });

    it('rejects short nicknames or invalid account numbers', () => {
      const resShort = beneficiarySchema.safeParse({
        nickname: 'P',
        beneficiaryName: 'Priya Deshmukh',
        accountNumber: '200022224444',
        bankName: 'Demo Bank of Pune',
      });
      expect(resShort.success).toBe(false);

      const resBadAcc = beneficiarySchema.safeParse({
        nickname: 'Priya',
        beneficiaryName: 'Priya Deshmukh',
        accountNumber: '1234',
        bankName: 'Demo Bank of Pune',
      });
      expect(resBadAcc.success).toBe(false);
    });
  });

  describe('Registration & Password Complexity', () => {
    it('validates strong password criteria (upper, lower, digit, symbol)', () => {
      const valid = registerSchema.safeParse({
        fullName: 'Rahul Sharma',
        email: 'rahul@demo.bank',
        password: 'DemoPassword@123',
        confirmPassword: 'DemoPassword@123',
      });
      expect(valid.success).toBe(true);

      const missingSpecial = registerSchema.safeParse({
        fullName: 'Rahul Sharma',
        email: 'rahul@demo.bank',
        password: 'DemoPassword123',
        confirmPassword: 'DemoPassword123',
      });
      expect(missingSpecial.success).toBe(false);

      const mismatched = registerSchema.safeParse({
        fullName: 'Rahul Sharma',
        email: 'rahul@demo.bank',
        password: 'DemoPassword@123',
        confirmPassword: 'DifferentPassword@123',
      });
      expect(mismatched.success).toBe(false);
    });
  });

  describe('OTP Verification Schema (TC08, TC12)', () => {
    it('validates transactionId UUID and 6-digit OTP code', () => {
      const valid = otpVerifySchema.safeParse({
        transactionId: '11111111-1111-1111-1111-111111111111',
        otp: '489201',
      });
      expect(valid.success).toBe(true);

      const badOtp = otpVerifySchema.safeParse({
        transactionId: '11111111-1111-1111-1111-111111111111',
        otp: '48920', // only 5 digits
      });
      expect(badOtp.success).toBe(false);
    });
  });
});
