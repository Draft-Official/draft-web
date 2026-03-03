'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/shadcn/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/dialog';
import type { MatchApplicantDTO } from '../../model/types';

const MAX_LENGTH = 1000;

interface MatchCancelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settlementGuests: MatchApplicantDTO[];
  onConfirm: (message: string) => void;
}

export function MatchCancelDialog({
  open,
  onOpenChange,
  settlementGuests,
  onConfirm,
}: MatchCancelDialogProps) {
  const [message, setMessage] = useState('');
  const [settlementAcknowledged, setSettlementAcknowledged] = useState(false);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setMessage('');
      setSettlementAcknowledged(false);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="base" className="rounded-2xl p-6" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>경기를 취소하시겠습니까?</DialogTitle>
          <DialogDescription className="sr-only">
            경기 취소 확인 및 취소 공지 작성
          </DialogDescription>
        </DialogHeader>

        {/* 경고 배너 */}
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 space-y-2">
          <p className="text-sm text-red-700 font-bold">
            현재 정산 확인이 필요한 신청자 {settlementGuests.length}명이 있습니다.
          </p>
          <p className="text-xs text-red-600 leading-relaxed">
            확정자와 입금 대기 신청자에 대한 환불/정산 확인 책임이 호스트에게 있습니다.
            정산 확인 없는 경기 취소 시 제재를 받을 수 있습니다.
          </p>
        </div>

        {/* 정산 대상 계좌 목록 */}
        {settlementGuests.length > 0 && (
          <div className="max-h-[200px] overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
            {settlementGuests.map((guest) => {
              const hasAccount = guest.accountInfo?.bank && guest.accountInfo?.number;
              return (
                <div key={guest.id} className="px-3 py-2.5 text-sm">
                  <p className="font-medium text-slate-900">
                    {guest.name}
                    <span className="ml-1 text-xs font-normal text-slate-500">
                      ({guest.status === 'payment_waiting' ? '입금 대기' : '확정'})
                    </span>
                  </p>
                  {hasAccount ? (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {guest.accountInfo!.bank} {guest.accountInfo!.number}
                      {guest.accountInfo!.holder && ` (${guest.accountInfo!.holder})`}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-0.5">계좌 미등록</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 정산 확인 체크박스 */}
        <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-slate-200 p-3 hover:bg-slate-50 transition-colors">
          <input
            type="checkbox"
            checked={settlementAcknowledged}
            onChange={(e) => setSettlementAcknowledged(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-primary flex-shrink-0"
          />
          <span className="text-sm text-slate-700 font-medium leading-snug">
            모든 확정자/입금 대기 신청자에 대한 환불 또는 정산 확인을 완료했습니다.
          </span>
        </label>

        {/* 취소 사유 입력 */}
        <div className="space-y-2 pt-1">
          <textarea
            value={message}
            onChange={(e) => {
              if (e.target.value.length <= MAX_LENGTH) {
                setMessage(e.target.value);
              }
            }}
            placeholder="취소 사유를 입력해 주세요."
            className="w-full min-h-[120px] rounded-xl border border-slate-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <p className="text-xs text-slate-400 text-right">
            {message.length}/{MAX_LENGTH}
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => handleOpenChange(false)}
            variant="outline"
            className="flex-1 h-12 rounded-xl font-bold"
          >
            닫기
          </Button>
          <Button
            onClick={() => {
              onConfirm(message.trim());
              handleOpenChange(false);
            }}
            disabled={!settlementAcknowledged || message.trim().length === 0}
            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl font-bold"
          >
            취소하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
