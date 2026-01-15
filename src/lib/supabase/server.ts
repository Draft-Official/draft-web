/**
 * Supabase Server Client
 * 서버 컴포넌트, API Routes, Server Actions에서 사용
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/shared/types/database.types';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

/**
 * Supabase 환경변수 설정 여부 확인
 */
function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * 서버용 Supabase 클라이언트 생성
 * Server Components, API Routes, Server Actions에서 사용
 *
 * @example
 * // Server Component
 * const supabase = await createServerSupabaseClient();
 * const { data } = await supabase.from('matches').select();
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured()) {
    console.warn(
      '[Supabase] 환경변수가 설정되지 않았습니다. .env.local 파일을 확인하세요.'
    );
  }

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || PLACEHOLDER_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || PLACEHOLDER_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 쿠키 설정 불가 - 무시
            // 이는 예상된 동작이며 미들웨어에서 세션 갱신 처리됨
          }
        },
      },
    }
  );
}
