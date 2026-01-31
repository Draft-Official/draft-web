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
import { RadioGroup, RadioGroupItem } from '@/shared/ui/base/radio-group';
import { Label } from '@/shared/ui/base/label';
import {
  CANCEL_TYPE_VALUES,
  CANCEL_TYPE_LABELS,
  CANCEL_TYPE_DESCRIPTIONS,
  type CancelTypeValue,
} from '@/shared/config/constants';

interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cancelType: CancelTypeValue) => void;
}

export function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: CancelConfirmDialogProps) {
  const [selectedType, setSelectedType] = useState<CancelTypeValue>('USER_REQUEST');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedType('USER_REQUEST');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>참가 취소</DialogTitle>
          <DialogDescription className="text-slate-600 pt-2">
            취소 사유를 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as CancelTypeValue)}
          className="space-y-3 pt-2"
        >
          {CANCEL_TYPE_VALUES.map((type) => (
            <div key={type} className="flex items-start space-x-3">
              <RadioGroupItem value={type} id={type} className="mt-0.5" />
              <Label htmlFor={type} className="flex flex-col cursor-pointer">
                <span className="text-sm font-medium">{CANCEL_TYPE_LABELS[type]}</span>
                <span className="text-xs text-slate-500">{CANCEL_TYPE_DESCRIPTIONS[type]}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>

        {selectedType === 'FRAUDULENT_PAYMENT' && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 mt-1">
            <p className="text-xs text-red-600 font-medium">
              해당 유저는 허위 송금으로 신고되며, 운영진에게 통보됩니다.
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => handleOpenChange(false)}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold"
          >
            닫기
          </Button>
          <Button
            onClick={() => {
              onConfirm(selectedType);
              handleOpenChange(false);
            }}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl font-bold"
          >
            취소하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
