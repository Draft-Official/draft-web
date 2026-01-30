'use client';

import { Button } from '@/shared/ui/base/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/base/dialog';

interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>참가 취소 확인</DialogTitle>
          <DialogDescription className="text-slate-600 pt-2">
            참가자의 동의 없는 일방적인 취소는 법적 불이익을 당할 수 있습니다. 정말
            취소하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold"
          >
            취소
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl font-bold"
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
