'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/shared/ui/base/button';

/**
 * 로그인 필요 안내 페이지
 * Middleware에서 리다이렉트된 사용자에게 로그인이 필요하다는 것을 알리고
 * 실제 로그인 페이지(/login)로 연결하는 다리 역할
 */
export default function AuthLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect') || '/';

  const handleLogin = () => {
    // 실제 로그인 페이지로 이동
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* 아이콘 */}
          <div className="w-16 h-16 bg-brand-weak rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* 제목 */}
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            로그인이 필요합니다
          </h1>

          {/* 설명 */}
          <p className="text-slate-600 mb-6">
            이 기능을 이용하려면 로그인이 필요합니다.
            <br />
            로그인 후 이용해 주세요.
          </p>

          {/* 버튼 */}
          <Button
            onClick={handleLogin}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg"
          >
            로그인하기
          </Button>

          {/* 취소 버튼 */}
          <button
            onClick={() => router.push('/')}
            className="w-full mt-3 text-slate-500 hover:text-slate-700 text-sm py-2"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
