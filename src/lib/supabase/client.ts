import { createBrowserClient } from '@supabase/ssr';
import { mockDb } from '@/lib/mockDatabase';

const isLiveSupabaseConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder');

export function createClient() {
  if (isLiveSupabaseConfigured) {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  // Seamless Mock/Offline Driver for Zero-Dependency Localhost Execution
  return {
    auth: {
      async getUser() {
        const user = mockDb.getCurrentUser();
        if (!user) return { data: { user: null }, error: null };
        return {
          data: {
            user: {
              id: user.id,
              email: `${user.full_name.toLowerCase().replace(/\s+/g, '')}@demo.bank`,
              user_metadata: {
                full_name: user.full_name,
                role: user.role,
              },
            },
          },
          error: null,
        };
      },
      async signInWithPassword({ email }: { email: string }) {
        const cleanEmail = email.toLowerCase().trim();
        const profiles = mockDb.getProfiles();
        let matched = profiles.find((p) => {
          const expected = p.role === 'admin' ? 'admin@demo.bank' : `${p.full_name.split(' ')[0].toLowerCase()}@demo.bank`;
          return expected === cleanEmail;
        });

        if (!matched && cleanEmail.includes('admin')) {
          matched = profiles.find((p) => p.role === 'admin');
        } else if (!matched && cleanEmail.includes('priya')) {
          matched = profiles.find((p) => p.full_name.includes('Priya'));
        } else if (!matched && cleanEmail.includes('amit')) {
          matched = profiles.find((p) => p.full_name.includes('Amit'));
        } else if (!matched) {
          matched = profiles[1]; // Rahul
        }

        if (matched) {
          mockDb.setCurrentUser(matched);
          return {
            data: {
              user: {
                id: matched.id,
                email: cleanEmail,
                user_metadata: {
                  full_name: matched.full_name,
                  role: matched.role,
                },
              },
            },
            error: null,
          };
        }

        return { data: { user: null }, error: { message: 'Invalid credentials.' } };
      },
      async signUp({ email, options }: { email: string; options?: any }) {
        const fullName = options?.data?.full_name || 'New Customer';
        const role = options?.data?.role || 'customer';
        const newId = 'usr-' + Math.random().toString(36).substring(2, 9);

        const newProfile = {
          id: newId,
          full_name: fullName,
          role,
          phone_masked: '+91 98*** **' + Math.floor(100 + Math.random() * 900),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        mockDb.setCurrentUser(newProfile);

        // Auto-provision 1 SAVINGS account with 50,000.00
        const newAccNum = '4000' + Math.floor(10000000 + Math.random() * 90000000).toString();
        const accounts = mockDb.getAccounts();
        accounts.push({
          id: 'acc-' + Math.random().toString(36).substring(2, 9),
          owner_id: newId,
          account_number: newAccNum,
          account_type: 'SAVINGS',
          balance: 50000.0,
          status: 'ACTIVE',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        return {
          data: {
            user: {
              id: newId,
              email,
              user_metadata: { full_name: fullName, role },
            },
          },
          error: null,
        };
      },
      async signOut() {
        mockDb.setCurrentUser(null);
        return { error: null };
      },
      onAuthStateChange(callback: (event: string, session: any) => void) {
        return {
          data: {
            subscription: {
              unsubscribe() {},
            },
          },
        };
      },
    },

    from(table: string) {
      const query: any = {
        _table: table,
        _filters: [] as any[],
        _order: null as any,
        _limit: null as number | null,

        select(fields?: string) {
          return query;
        },
        eq(col: string, val: any) {
          query._filters.push({ col, val, op: 'eq' });
          return query;
        },
        in(col: string, vals: any[]) {
          query._filters.push({ col, vals, op: 'in' });
          return query;
        },
        or(expr: string) {
          return query;
        },
        order(col: string, opts?: { ascending?: boolean }) {
          query._order = { col, asc: opts?.ascending ?? true };
          return query;
        },
        limit(num: number) {
          query._limit = num;
          return query;
        },
        async single() {
          const res = await query._execute();
          return { data: res.data ? res.data[0] || null : null, error: res.error };
        },
        async insert(payload: any) {
          if (table === 'beneficiaries') {
            const ben = mockDb.addBeneficiary(payload);
            return { data: ben, error: null };
          }
          return { data: payload, error: null };
        },
        async update(payload: any) {
          if (table === 'beneficiaries' && payload.nickname) {
            const targetId = query._filters.find((f: any) => f.col === 'id')?.val;
            if (targetId) mockDb.updateBeneficiaryNickname(targetId, payload.nickname);
          }
          return { data: payload, error: null };
        },
        async delete() {
          if (table === 'beneficiaries') {
            const targetId = query._filters.find((f: any) => f.col === 'id')?.val;
            if (targetId) mockDb.deleteBeneficiary(targetId);
          }
          return { data: null, error: null };
        },
        then(resolve: (val: any) => void) {
          return query._execute().then(resolve);
        },
        async _execute() {
          let rows: any[] = [];
          if (table === 'profiles') {
            const currentUser = mockDb.getCurrentUser();
            rows = currentUser ? [currentUser] : [];
          } else if (table === 'accounts') {
            rows = mockDb.getAccounts();
          } else if (table === 'beneficiaries') {
            rows = mockDb.getBeneficiaries();
          } else if (table === 'transactions') {
            rows = mockDb.getTransactions();
          } else if (table === 'audit_log') {
            rows = mockDb.getAuditLogs();
          }

          // Apply filters
          for (const f of query._filters) {
            if (f.op === 'eq') {
              rows = rows.filter((r) => r[f.col] === f.val);
            }
          }

          if (query._limit) {
            rows = rows.slice(0, query._limit);
          }

          return { data: rows, error: null };
        },
      };

      return query;
    },

    async rpc(funcName: string, params: any) {
      if (funcName === 'initiate_transfer') {
        const res = mockDb.initiateTransfer({
          from_account_id: params.p_from_account_id,
          to_account_number: params.p_to_account_number,
          amount: params.p_amount,
          remarks: params.p_remarks || '',
          idempotency_key: params.p_idempotency_key,
        });
        return { data: res, error: null };
      }

      if (funcName === 'confirm_transfer') {
        const res = mockDb.confirmTransfer(params.p_transaction_id, params.p_otp);
        return { data: res, error: null };
      }

      if (funcName === 'cancel_transfer') {
        const res = mockDb.cancelTransfer(params.p_transaction_id);
        return { data: res, error: null };
      }

      if (funcName === 'resend_transfer_otp') {
        const res = mockDb.resendTransferOtp(params.p_transaction_id);
        return { data: res, error: null };
      }

      if (funcName === 'admin_freeze_account') {
        const res = mockDb.adminFreezeAccount(params.p_account_id, params.p_reason);
        return { data: res, error: null };
      }

      if (funcName === 'admin_unfreeze_account') {
        const res = mockDb.adminUnfreezeAccount(params.p_account_id, params.p_reason);
        return { data: res, error: null };
      }

      return { data: null, error: { message: `Unknown RPC function ${funcName}` } };
    },
  };
}
