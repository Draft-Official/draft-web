/**
 * Supabase 클라이언트 Re-exports
 *
 * 사용법:
 * - 클라이언트 컴포넌트: getSupabaseBrowserClient()
 * - 서버 컴포넌트/API: createServerSupabaseClient()
 * - 미들웨어: updateSession()
 */

export { getSupabaseBrowserClient } from './client';
export { createServerSupabaseClient } from './server';
export { updateSession } from './middleware';
