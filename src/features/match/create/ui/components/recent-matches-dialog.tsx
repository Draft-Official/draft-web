'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { X, MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

// DB에서 가져온 match row 타입 (gym, team join 포함)
export interface MatchWithRelations {
  id: string;
  team_id: string | null;
  manual_team_name: string;
  start_time: string;
  end_time: string;
  cost_amount: number;
  cost_type: string;
  provides_beverage: boolean;
  match_type: string;
  gender_rule: string;
  level_limit: string;
  recruitment_setup: any;
  match_options: any;
  requirements: string[];
  account_bank: string;
  account_number: string;
  account_holder: string;
  contact_type: string;
  contact_content: string;
  host_notice: string;
  gym: {
    id: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    kakao_place_id: string;
    facilities: any;
  } | null;
  team: {
    name: string;
  } | null;
}

interface RecentMatchesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matches: MatchWithRelations[];
  isLoading: boolean;
  onSelect: (match: MatchWithRelations) => void;
}

// 날짜 포맷 (YYYY-MM-DD → MM/DD (요일))
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[date.getDay()];
  return `${month}/${day} (${weekday})`;
}

// 가격 포맷
function formatPrice(amount: number, costType: string): string {
  if (costType === 'FREE') return '무료';
  if (costType === 'BEVERAGE') return `음료 ${amount}병`;
  return `${amount.toLocaleString()}원`;
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
                const teamName = match.team?.name || match.manual_team_name;
                const isTeam = !!match.team_id;
                const gymName = match.gym?.name || '장소 미정';
                const date = formatDate(match.start_time);
                const price = formatPrice(match.cost_amount, match.cost_type);

                return (
                  <button
                    key={match.id}
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
                        isTeam
                          ? "bg-orange-50 text-orange-700"
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {isTeam ? '🏀' : '🙋‍♂️'} {isTeam ? teamName : '개인'}
                      </span>
                      <span className="text-sm text-slate-500">{date}</span>
                    </div>

                    {/* Bottom Row: Gym Name + Price */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-sm text-slate-500">
                        <MapPin className="w-3.5 h-3.5" />
                        {gymName}
                      </span>
                      <span className="text-sm font-medium text-slate-700">{price}</span>
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
