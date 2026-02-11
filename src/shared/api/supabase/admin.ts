/**
 * Supabase Admin Client (Service Role)
 * 서버 전용 — RLS 우회, auth.admin API 호출용
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database.types';

export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
