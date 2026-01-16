/**
 * Supabase Browser Client
 * 클라이언트 컴포넌트에서 사용하는 Supabase 클라이언트
 */
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database.types';

/**
 * Supabase 환경변수 설정 여부 확인
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  return !!(url && key);
}

/**
 * Supabase anon key 가져오기
 */
function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
         process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
         '';
}

/**
 * 브라우저용 Supabase 클라이언트 생성
 * 매 호출마다 새 인스턴스 생성 (SSR 안전)
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    console.warn(
      '[Supabase] 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.\n' +
        'NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY가 필요합니다.'
    );
    // 개발 환경에서 빈 URL로 진행 (에러 방지)
    return createSupabaseClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }

  return createSupabaseClient<Database>(url, anonKey);
}

// 클라이언트 사이드 싱글톤
let browserClient: ReturnType<typeof createClient> | null = null;

/**
 * 브라우저용 Supabase 클라이언트 싱글톤
 * 클라이언트 컴포넌트에서 재사용
 */
export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseBrowserClient는 클라이언트에서만 사용 가능합니다');
  }

  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}
