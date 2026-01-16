/**
 * Supabase Middleware Client
 * Next.js 미들웨어에서 세션 관리 및 인증 확인용
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/shared/types/database.types';

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

/**
 * Supabase anon key 가져오기
 */
function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
         process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
         '';
}

/**
 * Supabase 환경변수 설정 여부 확인
 */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabaseAnonKey();
  return !!(url && key);
}

/**
 * 미들웨어에서 Supabase 세션 업데이트
 * 쿠키 기반 세션 갱신 및 사용자 정보 반환
 *
 * @returns supabaseResponse: 쿠키가 설정된 NextResponse
 * @returns user: 현재 로그인한 사용자 (없으면 null)
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Supabase 미설정 시 인증 없이 통과
  if (!isSupabaseConfigured()) {
    return { supabaseResponse, user: null };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = getSupabaseAnonKey();

  const supabase = createServerClient<Database>(
    url || PLACEHOLDER_URL,
    anonKey || PLACEHOLDER_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 요청 쿠키에 설정
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 새 응답 생성
          supabaseResponse = NextResponse.next({
            request,
          });
          // 응답 쿠키에도 설정
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: getUser()를 사용해야 함 (getSession은 JWT만 검증하므로 불안전)
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
