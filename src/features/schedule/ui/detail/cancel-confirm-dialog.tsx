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
  type CancelTypeValue
} from "@/src/shared/config/application-constants";

interface CancelConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cancelType: CancelTypeValue) => void;
  guestName?: string;
  guestAccountInfo?: {
    bank?: string;
    number?: string;
    holder?: string;
  };
}

export function CancelConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  guestName,
  guestAccountInfo,
}: CancelConfirmDialogProps) {
  const [selectedType, setSelectedType] = useState<CancelTypeValue>('USER_REQUEST');
  const [settlementAcknowledged, setSettlementAcknowledged] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedType('USER_REQUEST');
      setSettlementAcknowledged(false);
    }
    onOpenChange(isOpen);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value as CancelTypeValue);
    setSettlementAcknowledged(false);
  };

  const isUserRequest = selectedType === 'USER_REQUEST';
  const hasAccount = guestAccountInfo?.bank && guestAccountInfo?.number;
  const isConfirmDisabled = isUserRequest && !settlementAcknowledged;

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
          onValueChange={handleTypeChange}
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

        {/* USER_REQUEST 선택 시 계좌 정보 + 정산 체크박스 */}
        {isUserRequest && (
          <div className="space-y-3 mt-1">
            {/* 게스트 계좌 정보 */}
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">
                {guestName || '게스트'} 계좌 정보
              </p>
              {hasAccount ? (
                <p className="text-xs text-slate-500 mt-1">
                  {guestAccountInfo!.bank} {guestAccountInfo!.number}
                  {guestAccountInfo!.holder && ` (${guestAccountInfo!.holder})`}
                </p>
              ) : (
                <p className="text-xs text-slate-400 mt-1">계좌 미등록</p>
              )}
            </div>

            {/* 정산 확인 체크박스 */}
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
              <input
                type="checkbox"
                checked={settlementAcknowledged}
                onChange={(e) => setSettlementAcknowledged(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-primary flex-shrink-0"
              />
              <span className="text-sm text-slate-700 font-medium leading-snug">
                참가비 정산을 완료했습니다.
              </span>
            </label>
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
            disabled={isConfirmDisabled}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl font-bold"
          >
            취소하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
