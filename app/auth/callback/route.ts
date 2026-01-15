/**
 * OAuth Callback Route
 * Supabase OAuth 인증 후 리다이렉트 처리
 */
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const redirect = requestUrl.searchParams.get('redirect') || '/';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // OAuth 에러 처리
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    const errorUrl = new URL('/auth/login', requestUrl.origin);
    errorUrl.searchParams.set('error', errorDescription || error);
    return NextResponse.redirect(errorUrl);
  }

  // Authorization code로 세션 교환
  if (code) {
    try {
      const supabase = await createServerSupabaseClient();
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        console.error('Code exchange error:', exchangeError);
        const errorUrl = new URL('/auth/login', requestUrl.origin);
        errorUrl.searchParams.set('error', '인증에 실패했습니다. 다시 시도해주세요.');
        return NextResponse.redirect(errorUrl);
      }
    } catch (err) {
      console.error('Unexpected error during code exchange:', err);
      const errorUrl = new URL('/auth/login', requestUrl.origin);
      errorUrl.searchParams.set('error', '인증 중 오류가 발생했습니다.');
      return NextResponse.redirect(errorUrl);
    }
  }

  // 성공 시 원래 페이지로 리다이렉트
  return NextResponse.redirect(new URL(redirect, requestUrl.origin));
}
