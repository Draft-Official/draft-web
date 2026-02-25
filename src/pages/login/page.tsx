'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { getSupabaseAuthClient } from '@/shared/api/supabase/client';
import { toast } from '@/shared/ui/shadcn/sonner';

const FORCE_KAKAO_REAUTH_KEY = 'force_kakao_reauth';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    const supabase = getSupabaseAuthClient();
    const shouldForceReauth =
      typeof window !== 'undefined' &&
      window.sessionStorage.getItem(FORCE_KAKAO_REAUTH_KEY) === '1';
    const redirect = searchParams?.get('redirect');
    const callbackUrl = redirect
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: callbackUrl,
        ...(shouldForceReauth
          ? {
              queryParams: {
                prompt: 'login',
              },
            }
          : {}),
      },
    });

    if (error) {
      console.error(error);
      toast.error('카카오 로그인 실패: ' + error.message);
      setIsLoading(false);
      return;
    }

    if (shouldForceReauth && typeof window !== 'undefined') {
      window.sessionStorage.removeItem(FORCE_KAKAO_REAUTH_KEY);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-6">
      {/* Logo & Tagline */}
      <div className="flex flex-col items-center gap-6 mb-16">
        <h1 className="text-5xl font-extrabold italic tracking-tighter text-slate-900">
          DRAFT.
        </h1>
        <p className="text-center text-gray-500 text-[15px] leading-relaxed">
          간편하게 로그인하고
          <br />
          다양한 경기에 참여해보세요.
        </p>
      </div>

      {/* Kakao Login Button */}
      <div className="w-full max-w-[320px]">
        <button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="flex items-center justify-center w-full h-[52px] rounded-xl bg-kakao hover:bg-kakao/90 active:bg-kakao/80 transition-colors disabled:opacity-50"
        >
          {/* Kakao speech bubble icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="mr-2"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 2.5C5.306 2.5 1.5 5.412 1.5 9.013c0 2.313 1.523 4.34 3.813 5.498-.168.625-.608 2.263-.696 2.615-.11.44.161.433.339.315.14-.093 2.228-1.512 3.128-2.124.612.088 1.243.134 1.882.134h.034c4.694 0 8.5-2.912 8.5-6.438C18.5 5.412 14.694 2.5 10 2.5Z"
              fill="#3C1E1E"
            />
          </svg>
          <span className="text-kakao-foreground font-semibold text-[15px]">
            카카오 로그인
          </span>
        </button>
      </div>
    </div>
  );
}
