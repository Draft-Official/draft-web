'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/shared/ui/base/dialog';
import { X, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { RecentMatchListItemDTO } from '@/features/match-create/model/types';

interface RecentMatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: RecentMatchListItemDTO[];
  isLoading: boolean;
  onSelect: (match: RecentMatchListItemDTO) => void;
}

export function RecentMatchesDialog({
  open,
  onOpenChange,
  matches,
  isLoading,
  onSelect,
}: RecentMatchesDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-[480px] p-0 gap-0 rounded-2xl">
        <DialogHeader className="px-5 py-4 border-b border-slate-100">
          <DialogTitle className="text-lg font-bold text-slate-900">
            최근 경기 불러오기
          </DialogTitle>
        </DialogHeader>
        <DialogClose className="absolute right-4 top-4 opacity-70 hover:opacity-100 transition-opacity">
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </DialogClose>

        <div className="py-2 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <p className="text-sm">최근 개설한 경기가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {matches.map((match) => {
                return (
                  <button
                    key={match.matchId}
                    type="button"
                    onClick={() => onSelect(match)}
                    className={cn(
                      "w-full px-5 py-3 text-left transition-colors",
                      "hover:bg-slate-50 active:bg-slate-100"
                    )}
                  >
                    {/* Top Row: Badge + Date */}
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                        match.isTeamHost
                          ? "bg-orange-50 text-orange-700"
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {match.isTeamHost ? '🏀' : '🙋‍♂️'} {match.hostLabel}
                      </span>
                      <span className="text-sm text-slate-500">{match.dateLabel}</span>
                    </div>

                    {/* Bottom Row: Gym Name + Price */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {match.gymLabel}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{match.priceLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
