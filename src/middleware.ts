/**
 * Next.js Middleware
 * 인증이 필요한 라우트 보호 및 세션 갱신
 */
import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/shared/api/supabase/middleware';

// 인증이 필요한 라우트
const PROTECTED_ROUTES = [
  '/matches/create',
  '/schedule',
  '/my',
  '/team',
  '/signup/verify',
];

// 인증 관련 라우트 (이미 로그인했으면 리다이렉트)
const AUTH_ROUTES = [
  '/auth/login',
  '/auth/signup',
];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // 보호된 라우트 체크
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // 인증 라우트 체크
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // 미인증 유저가 보호된 라우트 접근 시
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 이미 인증된 유저가 인증 라우트 접근 시
  if (isAuthRoute && user) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * 아래 경로 제외:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화)
     * - favicon.ico
     * - public 폴더의 정적 파일
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
