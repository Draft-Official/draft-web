'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { BankCombobox } from '@/shared/ui/composite/bank-combobox';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamKeys } from '@/features/team/api/keys';
import type { AccountInfo } from '@/shared/types/jsonb.types';
import type { Json } from '@/shared/types/database.types';
import {
  isValidAccountHolder,
  isValidAccountNumber,
  sanitizeAccountHolderInput,
  sanitizeAccountNumberInput,
} from '@/shared/lib/validation/account';

interface AccountEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  currentAccount: AccountInfo | null;
}

export function AccountEditDialog({
  open,
  onOpenChange,
  teamId,
  currentAccount,
}: AccountEditDialogProps) {
  const queryClient = useQueryClient();
  const [bank, setBank] = useState(currentAccount?.bank || '');
  const [number, setNumber] = useState(currentAccount?.number || '');
  const [holder, setHolder] = useState(currentAccount?.holder || '');

  useEffect(() => {
    if (open) {
      setBank(currentAccount?.bank || '');
      setNumber(currentAccount?.number || '');
      setHolder(currentAccount?.holder || '');
    }
  }, [open, currentAccount]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!bank || !number || !holder) {
        throw new Error('계좌 정보를 모두 입력해주세요');
      }
      if (!isValidAccountNumber(number)) {
        throw new Error('계좌번호는 숫자 10-16자리로 입력해주세요');
      }
      if (!isValidAccountHolder(holder)) {
        throw new Error('예금주는 한글 2-10자로 입력해주세요');
      }

      const supabase = getSupabaseBrowserClient();
      const accountInfo: AccountInfo = { bank, number, holder };
      const { error } = await supabase
        .from('teams')
        .update({ account_info: accountInfo as unknown as Json })
        .eq('id', teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('계좌 정보가 수정되었습니다');
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || '계좌 정보 수정에 실패했습니다');
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>환불 계좌 수정</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>은행</Label>
            <BankCombobox
              value={bank}
              onValueChange={setBank}
              className="w-full h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>계좌번호</Label>
            <Input
              value={number}
              onChange={(e) => {
                setNumber(sanitizeAccountNumberInput(e.target.value));
              }}
              placeholder="계좌번호 입력 (숫자만)"
              inputMode="numeric"
            />
          </div>

          <div className="space-y-2">
            <Label>예금주</Label>
            <Input
              value={holder}
              onChange={(e) => {
                setHolder(sanitizeAccountHolderInput(e.target.value));
              }}
              placeholder="예금주 입력 (한글 2-10자)"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
