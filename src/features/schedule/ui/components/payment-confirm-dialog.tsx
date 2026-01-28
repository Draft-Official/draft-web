'use client';

import { Button } from '@/shared/ui/base/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/base/dialog';
import { Loader2 } from 'lucide-react';

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

export function PaymentConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
}: PaymentConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm mx-4 rounded-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>송금을 완료하셨나요?</DialogTitle>
          <DialogDescription className="text-slate-600 pt-2">
            실제로 송금하지 않고 완료 버튼을 누르면 호스트에게 확인되지 않아
            참가가 취소될 수 있습니다. 반드시 송금 후 눌러주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 pt-4">
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
