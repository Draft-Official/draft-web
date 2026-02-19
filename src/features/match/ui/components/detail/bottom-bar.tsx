'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { GuestMatchDetailDTO } from '@/features/match/model/types';
import { Button } from '@/shared/ui/base/button';
import { cn } from '@/shared/lib/utils';

interface BottomBarProps {
  match: GuestMatchDetailDTO;
  onApply: () => void;
  hasApplied?: boolean;
  canCancel?: boolean;
  onCancel?: () => void;
  isLoading?: boolean;
  isCanceling?: boolean;
  statusText?: string;
  isMatchEnded?: boolean;
  isHost?: boolean;
  onManage?: () => void;
}

export function MatchDetailBottomBar({
  match,
  onApply,
  hasApplied = false,
  canCancel = false,
  onCancel,
  isLoading = false,
  isCanceling = false,
  statusText,
  isMatchEnded = false,
  isHost = false,
  onManage,
}: BottomBarProps) {
  const isClosed = match.isClosed || match.positions.all?.status === 'closed';

  // 호스트인 경우 - 경기 관리하기
  if (isHost) {
    return (
      <div className="app-overlay-shell app-overlay-shell--with-sidebar">
        <div className="app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            size="lg"
            className="w-full text-lg font-bold h-12 rounded-xl bg-primary hover:bg-primary/90 text-white"
            onClick={onManage}
          >
            경기 관리하기
          </Button>
        </div>
      </div>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className="app-overlay-shell app-overlay-shell--with-sidebar">
        <div className="app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button disabled className="w-full text-lg font-bold h-12 rounded-xl">
            <Loader2 className="w-5 h-5 animate-spin" />
          </Button>
        </div>
      </div>
    );
  }

  // 종료된 경기
  if (isMatchEnded) {
    return (
      <div className="app-overlay-shell app-overlay-shell--with-sidebar">
        <div className="app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            size="lg"
            className="w-full text-lg font-bold h-12 rounded-xl bg-slate-200 text-slate-500"
            disabled
          >
            종료된 경기입니다
          </Button>
        </div>
      </div>
    );
  }

  // 이미 신청한 경우 - 취소하기 버튼
  if (hasApplied && canCancel) {
    return (
      <div className="app-overlay-shell app-overlay-shell--with-sidebar">
        <div className="app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            size="lg"
            className="w-full text-lg font-bold h-12 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 border border-red-200"
            onClick={onCancel}
            disabled={isCanceling}
          >
            {isCanceling ? <Loader2 className="w-5 h-5 animate-spin" /> : '신청 취소하기'}
          </Button>
        </div>
      </div>
    );
  }

  // 신청했지만 취소 불가 (확정/거절/취소됨)
  if (hasApplied && !canCancel) {
    const isConfirmed = statusText === '확정된 경기입니다';
    return (
      <div className="app-overlay-shell app-overlay-shell--with-sidebar">
        <div className="app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <Button
            size="lg"
            className={cn(
              "w-full text-lg font-bold h-12 rounded-xl",
              isConfirmed
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-slate-200 text-slate-500"
            )}
            disabled
          >
            {statusText || '신청 완료'}
          </Button>
        </div>
      </div>
    );
  }

  // 기본: 신청하기 버튼
  return (
    <div className="app-overlay-shell app-overlay-shell--with-sidebar">
      <div className="app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button
          size="lg"
          className={cn(
            "w-full text-lg font-bold h-12 rounded-xl",
            isClosed ? "bg-slate-200 text-slate-500 hover:bg-slate-200" : "bg-primary hover:bg-primary/90 text-white"
          )}
          disabled={isClosed}
          onClick={onApply}
        >
          {isClosed ? "모집 마감" : "경기 신청하기"}
        </Button>
      </div>
    </div>
  );
}
