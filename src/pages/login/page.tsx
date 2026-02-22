'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient, getSupabaseAuthClient } from '@/shared/api/supabase/client';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { toast } from '@/shared/ui/shadcn/sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    // OAuth는 PKCE를 지원하는 AuthClient 사용
    const supabase = getSupabaseAuthClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
        console.error(error);
        toast.error('카카오 로그인 실패: ' + error.message);
        setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error('로그인 실패: ' + error.message);
    } else {
      toast.success('로그인 성공!');
      router.push('/');
    }
  };

  // Quick Sign Up for Dev
  const handleSignUp = async () => {
    setIsLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    setIsLoading(false);

    if (error) {
        toast.error('회원가입 실패: ' + error.message);
    } else {
        toast.success('가입 확인 메일을 확인해주세요 (또는 Supabase 대시보드에서 이메일 컨펌 처리)');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4">
      <div className="w-full max-w-sm bg-white p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6">개발용 로그인</h1>
        
        {/* Kakao Login */}
        <Button 
            onClick={handleKakaoLogin}
            disabled={isLoading}
            className="w-full bg-kakao hover:bg-kakao/90 text-kakao-foreground font-bold mb-4"
        >
            카카오로 시작하기
        </Button>

        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or Email</span>
            </div>
        </div>

        {/* Email Login Form */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
                <Input 
                    type="email" 
                    placeholder="example@test.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div>
                <Input 
                    type="password" 
                    placeholder="Password (6+ chars)" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>
            <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                    로그인
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={handleSignUp} disabled={isLoading}>
                    회원가입 (Test)
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
