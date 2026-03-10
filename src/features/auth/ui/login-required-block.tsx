'use client';

import Link from 'next/link';
import { Button } from '@/shared/ui/shadcn/button';

interface LoginRequiredBlockProps {
  description?: string;
  redirectTo?: string;
  centered?: boolean;
}

export function LoginRequiredBlock({
  description = '로그인하고 다양한 기능을 이용해보세요.',
  redirectTo,
  centered = true,
}: LoginRequiredBlockProps) {
  const loginHref = redirectTo
    ? `/login?redirect=${encodeURIComponent(redirectTo)}`
    : '/login';

  const card = (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-8 text-center">
      <div className="w-16 h-16 bg-brand-weak rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">로그인이 필요합니다</h1>
      <p className="text-slate-600 mb-6">{description}</p>
      <Link href={loginHref} className="block">
        <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg">
          로그인하기
        </Button>
      </Link>
    </div>
  );

  if (centered) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center p-6">
        {card}
      </div>
    );
  }

  return card;
}
