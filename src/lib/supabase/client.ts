/**
 * Supabase Browser Client (통합 버전)
 *
 * @supabase/ssr의 createBrowserClient 사용
 * - OAuth/PKCE 지원
 * - 쿠키 기반 세션 관리
 * - 싱글톤 패턴으로 인스턴스 중복 방지
 */
import { createBrowserClient } from '@supabase/ssr';
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

// 모듈 레벨 싱글톤 (window 대신 모듈 스코프 사용)
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

/**
 * 브라우저용 Supabase 클라이언트 생성
 * 싱글톤 패턴 - 최초 1회만 생성
 */
function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    console.warn(
      '[Supabase] 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
    );
    return createBrowserClient<Database>(
      'https://placeholder.supabase.co',
      'placeholder-key'
    );
  }

  return createBrowserClient<Database>(url, anonKey, {
    // Restoring raw encoding as removing it caused hangs
    cookieEncoding: 'raw', 
  });
}

/**
 * 브라우저용 Supabase 클라이언트 싱글톤
 * 인증 + 데이터 조회 모두 이 클라이언트 사용
 */
export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    // 서버 환경에서는 브라우저 클라이언트를 생성하지 않음
    return null as unknown as ReturnType<typeof createBrowserClient<Database>>;
  }

  if (!browserClient) {
    console.log('[Supabase] Creating unified browser client...');
    browserClient = createClient();
  }
  return browserClient;
}

/**
 * 인증용 클라이언트 (하위 호환성)
 * getSupabaseBrowserClient와 동일한 인스턴스 반환
 */
export function getSupabaseAuthClient() {
  return getSupabaseBrowserClient();
}
