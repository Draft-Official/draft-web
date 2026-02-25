'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Button } from '@/shared/ui/shadcn/button';
import { BankCombobox } from '@/shared/ui/composite/bank-combobox';
import { toast } from '@/shared/ui/shadcn/sonner';
import {
  isValidAccountHolder,
  isValidAccountNumber,
  sanitizeAccountHolderInput,
  sanitizeAccountNumberInput,
} from '@/shared/lib/validation/account';

export interface AccountRegisterFormValue {
  bank: string;
  number: string;
  holder: string;
}

interface AccountRegisterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialValue: AccountRegisterFormValue;
  isPending?: boolean;
  onSubmit: (value: AccountRegisterFormValue) => Promise<void>;
}

export function AccountRegisterModal({
  open,
  onOpenChange,
  title,
  initialValue,
  isPending = false,
  onSubmit,
}: AccountRegisterModalProps) {
  const [bank, setBank] = useState(initialValue.bank);
  const [number, setNumber] = useState(initialValue.number);
  const [holder, setHolder] = useState(initialValue.holder);

  useEffect(() => {
    if (!open) return;
    setBank(initialValue.bank);
    setNumber(initialValue.number);
    setHolder(initialValue.holder);
  }, [open, initialValue.bank, initialValue.number, initialValue.holder]);

  const handleSubmit = async () => {
    if (!bank || !number || !holder) {
      toast.error('계좌 정보를 모두 입력해주세요.');
      return;
    }

    if (!isValidAccountHolder(holder)) {
      toast.error('예금주는 한글 2-10자로 입력해주세요.');
      return;
    }

    if (!isValidAccountNumber(number)) {
      toast.error('계좌번호는 숫자 10-16자리로 입력해주세요.');
      return;
    }

    try {
      await onSubmit({ bank, number, holder });
    } catch {
      // 에러 토스트는 호출 측에서 처리
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="gap-0 p-0">
        <DialogHeader className="px-5 py-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-bold text-slate-900">{title}</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-5 space-y-4">
          <div className="space-y-2">
            <Label>예금주</Label>
            <Input
              value={holder}
              placeholder="예금주 입력 (한글 2-10자)"
              onChange={(e) => setHolder(sanitizeAccountHolderInput(e.target.value))}
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>은행</Label>
            <BankCombobox
              value={bank}
              onValueChange={setBank}
              className="w-full h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>계좌번호</Label>
            <Input
              value={number}
              placeholder="계좌번호 입력 (숫자만)"
              inputMode="numeric"
              onChange={(e) => setNumber(sanitizeAccountNumberInput(e.target.value))}
              className="h-11"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 bg-white border-t border-slate-100 rounded-b-2xl">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-10 px-4 text-sm"
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="h-10 px-4 text-sm bg-primary hover:bg-primary/90"
          >
            {isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
