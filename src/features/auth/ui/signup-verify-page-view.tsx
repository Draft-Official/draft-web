'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUpdateProfile } from '@/shared/session';
import { PhoneVerificationForm } from './phone-verification-form';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';

type Step = 'name' | 'phone';

export function SignupVerifyPageView() {
  const router = useRouter();
  const { user, profile, isLoading, isAuthenticated, refreshProfile } = useAuth();
  const updateProfile = useUpdateProfile();

  const hasName = !!profile?.real_name;
  const hasPhone = !!profile?.phone_verified;

  const [step, setStep] = useState<Step>(hasName ? 'phone' : 'name');
  const [name, setName] = useState('');

  // 이미 인증 완료된 유저는 홈으로
  useEffect(() => {
    if (!isLoading && isAuthenticated && hasName && hasPhone) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, hasName, hasPhone, router]);

  // real_name이 이미 있으면 phone 단계로
  useEffect(() => {
    if (hasName) {
      setStep('phone');
    }
  }, [hasName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleNameSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      await updateProfile.mutateAsync({
        userId: user.id,
        updates: { real_name: trimmed },
      });
      await refreshProfile();
      setStep('phone');
    } catch {
      // toast is handled by useUpdateProfile
    }
  };

  const handlePhoneComplete = async () => {
    await refreshProfile();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Progress */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex gap-2">
          <div className={`h-1 flex-1 rounded-full ${step === 'name' ? 'bg-primary' : 'bg-primary'}`} />
          <div className={`h-1 flex-1 rounded-full ${step === 'phone' ? 'bg-primary' : 'bg-slate-200'}`} />
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {step === 'name' ? '1/2' : '2/2'}
        </p>
      </div>

      {step === 'name' && (
        <div className="flex-1 flex flex-col px-4 pt-8">
          <h1 className="text-2xl font-bold mb-2">이름을 알려주세요</h1>
          <p className="text-sm text-slate-500 mb-8">
            경기 참가 시 본인 확인에 사용됩니다.
          </p>

          <div className="space-y-2 mb-8">
            <Label htmlFor="real-name">이름</Label>
            <Input
              id="real-name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && name.trim()) {
                  handleNameSubmit();
                }
              }}
            />
          </div>

          <div className="mt-auto pb-8">
            <Button
              className="w-full"
              onClick={handleNameSubmit}
              disabled={!name.trim() || updateProfile.isPending}
            >
              {updateProfile.isPending ? '저장 중...' : '다음'}
            </Button>
          </div>
        </div>
      )}

      {step === 'phone' && (
        <div className="flex-1 flex flex-col pt-8">
          <div className="px-4 mb-4">
            <h1 className="text-2xl font-bold mb-2">전화번호를 인증해주세요</h1>
            <p className="text-sm text-slate-500">
              경기 매칭 및 알림 수신에 사용됩니다.
            </p>
          </div>

          <PhoneVerificationForm onComplete={handlePhoneComplete} />
        </div>
      )}
    </div>
  );
}
