'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import { useAuth, useProfile, useUpdateProfile } from '@/features/auth';
import { BankCombobox } from '@/shared/ui/base/bank-combobox';
import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Button } from '@/shared/ui/base/button';
import type { AccountInfo } from '@/shared/types/jsonb.types';
import type { Json } from '@/shared/types/database.types';

export function BankAccountForm() {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const updateProfile = useUpdateProfile();

  const [bank, setBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // 프로필 데이터로 초기화
  useEffect(() => {
    if (profile?.account_info) {
      const accountInfo = profile.account_info as unknown as AccountInfo;
      setBank(accountInfo.bank || '');
      setAccountNumber(accountInfo.number || '');
      setAccountHolder(accountInfo.holder || '');
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('로그인이 필요합니다');
      return;
    }

    if (!bank || !accountNumber || !accountHolder) {
      toast.error('모든 항목을 입력해주세요');
      return;
    }

    const accountInfo: AccountInfo = {
      bank,
      number: accountNumber,
      holder: accountHolder,
    };

    updateProfile.mutate(
      {
        userId: user.id,
        updates: {
          account_info: accountInfo as unknown as Json,
        },
      },
      {
        onSuccess: () => {
          toast.success('계좌 정보가 저장되었습니다');
        },
        onError: () => {
          toast.error('저장에 실패했습니다');
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg">
        <Info className="h-4 w-4 text-slate-500 mt-0.5 shrink-0" />
        <p className="text-sm text-slate-600">
          게스트 활동 시 참가비 환불 계좌로 사용됩니다.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bank">은행</Label>
          <BankCombobox
            value={bank}
            onValueChange={setBank}
            placeholder="은행 선택"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNumber">계좌번호</Label>
          <Input
            id="accountNumber"
            type="text"
            inputMode="numeric"
            placeholder="- 없이 숫자만 입력"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountHolder">예금주</Label>
          <Input
            id="accountHolder"
            type="text"
            placeholder="예금주명 입력 (한글만 가능)"
            value={accountHolder}
            onChange={(e) => {
              // 한글, 공백만 허용
              const value = e.target.value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, '');
              setAccountHolder(value);
            }}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={updateProfile.isPending}
      >
        {updateProfile.isPending ? '저장 중...' : '저장하기'}
      </Button>
    </form>
  );
}
