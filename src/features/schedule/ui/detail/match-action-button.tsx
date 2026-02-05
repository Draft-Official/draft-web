'use client';

import { Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/base/button';

interface MatchActionButtonProps {
  isRecruiting: boolean;
  isClosed: boolean;
  isConfirmed: boolean;
  isEnded: boolean;
  isMatchCanceled: boolean;
  isPending: boolean;
  onCloseRecruiting: () => void;
  onConfirmMatch: () => void;
}

export function MatchActionButton({
  isRecruiting,
  isClosed,
  isConfirmed,
  isEnded,
  isMatchCanceled,
  isPending,
  onCloseRecruiting,
  onConfirmMatch,
}: MatchActionButtonProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none md:pl-[240px]">
      <div className="max-w-[760px] mx-auto bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {/* 모집 중: 모집 마감하기 */}
        {isRecruiting && (
          <Button
            onClick={onCloseRecruiting}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold text-lg"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '모집 마감하기'
            )}
          </Button>
        )}

        {/* 모집 마감: 경기 확정하기 */}
        {isClosed && (
          <Button
            onClick={onConfirmMatch}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold text-lg"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '경기 확정하기'
            )}
          </Button>
        )}

        {/* 경기 확정 이후: 확정 완료 (비활성화) */}
        {isConfirmed && (
          <Button
            disabled
            className="w-full bg-slate-200 text-slate-500 h-12 rounded-xl font-bold text-lg cursor-not-allowed"
          >
            확정 완료
          </Button>
        )}

        {/* 종료/취소 */}
        {isEnded && (
          <Button
            disabled
            className="w-full bg-slate-200 text-slate-500 h-12 rounded-xl font-bold text-lg cursor-not-allowed"
          >
            {isMatchCanceled ? '취소된 경기입니다' : '종료된 경기입니다'}
          </Button>
        )}
      </div>
    </div>
  );
}
