'use client';

import { useFormContext } from 'react-hook-form';
import { FileText, Phone, MessageCircle } from 'lucide-react';

import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Switch } from '@/shared/ui/base/switch';
import { BankCombobox } from '@/shared/ui/base/bank-combobox';
import { cn } from '@/shared/lib/utils';

import { StepHeader } from './step-header';

interface TeamCreateStepOperationsProps {
  contactType: 'PHONE' | 'KAKAO_OPEN_CHAT';
}

export function TeamCreateStepOperations({ contactType }: TeamCreateStepOperationsProps) {
  const { register, watch, setValue } = useFormContext();

  return (
    <div className="space-y-6">
      <StepHeader step={4} title="운영 정보" icon={FileText} />

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
        <p className="text-sm text-blue-700">
          💡 운영 정보는 나중에 설정할 수 있어요. 지금 건너뛰어도 됩니다.
        </p>
      </div>

      {/* 계좌 정보 */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">팀 계좌 정보</Label>
        <div className="flex gap-2">
          <Input
            {...register('accountHolder')}
            placeholder="예금주"
            className="w-[90px] h-11"
            onChange={(e) => {
              const value = e.target.value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, '').slice(0, 10);
              setValue('accountHolder', value);
            }}
          />
          <BankCombobox
            value={watch('bankName')}
            onValueChange={(value) => setValue('bankName', value)}
            className="w-[100px] h-11"
          />
          <Input
            {...register('accountNumber')}
            placeholder="계좌번호"
            className="flex-1 h-11"
            inputMode="numeric"
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 16);
              setValue('accountNumber', value);
            }}
          />
        </div>
        <p className="text-xs text-slate-400">
          예금주: 한글 2-10자 / 계좌번호: 숫자 10-16자리
        </p>
      </div>

      {/* 연락처 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-bold text-slate-700">문의 연락처</Label>
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-bold", contactType === 'PHONE' ? 'text-[#FF6600]' : 'text-slate-400')}>
              <Phone className="w-3 h-3 inline mr-0.5" />
              전화
            </span>
            <Switch
              checked={contactType === 'KAKAO_OPEN_CHAT'}
              onCheckedChange={(checked) =>
                setValue('contactType', checked ? 'KAKAO_OPEN_CHAT' : 'PHONE')
              }
              className="data-[state=checked]:bg-[#FF6600]"
            />
            <span className={cn("text-xs font-bold", contactType === 'KAKAO_OPEN_CHAT' ? 'text-[#FF6600]' : 'text-slate-400')}>
              <MessageCircle className="w-3 h-3 inline mr-0.5" />
              오픈채팅
            </span>
          </div>
        </div>
        <div className="relative">
          {contactType === 'PHONE' ? (
            <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          ) : (
            <MessageCircle className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          )}
          {contactType === 'PHONE' ? (
            <Input
              {...register('phoneNumber')}
              placeholder="010-1234-5678"
              inputMode="tel"
              className="pl-9 h-11"
              onChange={(e) => {
                const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
                let formatted = digits;
                if (digits.length > 3 && digits.length <= 7) {
                  formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                } else if (digits.length > 7) {
                  formatted = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
                }
                setValue('phoneNumber', formatted);
              }}
            />
          ) : (
            <Input
              {...register('kakaoLink')}
              placeholder="카카오톡 오픈채팅 링크"
              className="pl-9 h-11"
            />
          )}
        </div>
      </div>
    </div>
  );
}
