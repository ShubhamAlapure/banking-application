import { z } from 'zod';

// Password complexity regex: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
export const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_\-+=<>.,:;])[A-Za-z\d@$!%*?&^#()_\-+=<>.,:;]{8,}$/;

// 12-digit numeric account number regex
export const accountNumberRegex = /^\d{12}$/;

// 6-digit OTP regex
export const otpRegex = /^\d{6}$/;

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(60, 'Full name cannot exceed 60 characters')
    .regex(/^[\p{L}\s.'-]+$/u, 'Full name contains invalid characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special symbol'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const beneficiarySchema = z.object({
  nickname: z
    .string()
    .trim()
    .min(2, 'Nickname must be at least 2 characters')
    .max(30, 'Nickname cannot exceed 30 characters'),
  beneficiaryName: z
    .string()
    .trim()
    .min(2, 'Beneficiary name must be at least 2 characters')
    .max(60, 'Beneficiary name cannot exceed 60 characters'),
  accountNumber: z
    .string()
    .trim()
    .regex(accountNumberRegex, 'Account number must be exactly 12 numeric digits'),
  bankName: z
    .string()
    .trim()
    .min(2, 'Bank name must be at least 2 characters')
    .max(60, 'Bank name cannot exceed 60 characters'),
});

export const transferInitiateSchema = z.object({
  fromAccountId: z.string().min(1, 'Please select a valid source account'),
  toAccountNumber: z
    .string()
    .trim()
    .regex(accountNumberRegex, 'Destination account number must be exactly 12 numeric digits'),
  amount: z
    .coerce
    .number()
    .positive('Transfer amount must be greater than zero')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'Amount cannot have more than 2 decimal places',
    })
    .refine((val) => val >= 1.0, {
      message: 'Minimum transfer amount is ₹1.00',
    })
    .refine((val) => val <= 100000.0, {
      message: 'Maximum transfer amount per transaction is ₹1,00,000.00',
    }),
  remarks: z.string().trim().max(100, 'Remarks cannot exceed 100 characters').optional().default(''),
  idempotencyKey: z.string().min(1, 'Idempotency key is required'),
});

export const otpVerifySchema = z.object({
  transactionId: z.string().min(1, 'Invalid transaction ID'),
  otp: z
    .string()
    .trim()
    .regex(otpRegex, 'OTP must be exactly 6 numeric digits'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BeneficiaryInput = z.infer<typeof beneficiarySchema>;
export type TransferInitiateInput = z.infer<typeof transferInitiateSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;
