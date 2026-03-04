'use client';

import { Button } from '@/shared/ui/shadcn/button';
import { Spinner } from '@/shared/ui/shadcn/spinner';

interface MatchActionButtonProps {
  isRecruiting: boolean;
  isClosed: boolean;
  isEnded: boolean;
  isMatchCanceled: boolean;
  isPending: boolean;
  onCloseRecruiting: () => void;
  layoutMode?: 'page' | 'split';
}

export function MatchActionButton({
  isRecruiting,
  isClosed,
  isEnded,
  isMatchCanceled,
  isPending,
  onCloseRecruiting,
  layoutMode = 'page',
}: MatchActionButtonProps) {
  const containerClassName = layoutMode === 'split'
    ? 'sticky bottom-0 z-30 border-t border-slate-100 bg-white/95 px-5 pt-3 pb-4 shadow-[0_-8px_16px_-12px_rgba(15,23,42,0.35)] backdrop-blur'
    : 'app-overlay-shell app-overlay-shell--with-sidebar';

  const contentClassName = layoutMode === 'split'
    ? ''
    : 'app-overlay-content bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]';

  return (
    <div className={containerClassName}>
      <div className={contentClassName}>
        {/* 모집 중: 모집 마감하기 */}
        {isRecruiting && (
          <Button
            onClick={onCloseRecruiting}
            disabled={isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold text-lg"
          >
            {isPending ? (
              <Spinner className="w-5 h-5 " />
            ) : (
              '모집 마감하기'
            )}
          </Button>
        )}

        {/* 모집 마감 완료 */}
        {isClosed && (
          <Button
            disabled
            className="w-full bg-slate-200 text-slate-500 h-12 rounded-xl font-bold text-lg cursor-not-allowed"
          >
            모집 마감
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
