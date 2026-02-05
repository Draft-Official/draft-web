'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/base/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/base/dialog';
import { Loader2, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  bankInfo?: {
    bank: string;
    account: string;
    holder: string;
  };
}

export function PaymentConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  bankInfo,
}: PaymentConfirmDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyBankInfo = () => {
    if (!bankInfo) return;
    const text = `${bankInfo.bank} ${bankInfo.account}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('계좌 정보가 복사되었습니다');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm mx-4 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>송금을 완료하셨나요?</DialogTitle>
          <DialogDescription className="text-red-600 pt-2 font-medium">
            입금 없이 허위로 &apos;송금 완료&apos; 버튼을 누를 경우,
            즉시 서비스 정지 및 법적 처벌을 받을 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 계좌 정보 */}
        {bankInfo && (
          <div className="bg-slate-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-slate-700">입금 계좌</p>
            <button
              onClick={handleCopyBankInfo}
              className="flex items-center gap-2 text-sm text-slate-900 hover:text-slate-700"
            >
              <span>
                {bankInfo.bank} {bankInfo.account} ({bankInfo.holder})
              </span>
              {copied ? (
                <Check className="w-4 h-4 text-green-500 shrink-0" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400 shrink-0" />
              )}
            </button>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold"
          >
            돌아가기
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            disabled={isPending}
            className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '네, 송금했습니다'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
