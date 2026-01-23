'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Navigation, Users, Shield, Trophy, Copy, Check } from 'lucide-react';
import { Badge } from '@/shared/ui/base/badge';
import { Button } from '@/shared/ui/base/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/base/popover';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import type { ManagedMatch } from '../../model/types';
import {
  MATCH_TYPE_LABELS,
  MATCH_TYPE_COLORS,
  MATCH_STATUS_LABELS,
  MATCH_STATUS_COLORS,
  PAST_MATCH_STATUSES,
} from '../../config/constants';

interface MatchCardProps {
  match: ManagedMatch;
  onClick: (matchId: string) => void;
}

export function MatchCard({ match, onClick }: MatchCardProps) {
  const isPastMatch = PAST_MATCH_STATUSES.includes(match.status);
  const [copied, setCopied] = useState(false);

  const handleLocationClick = (e: React.MouseEvent, url?: string) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank');
    }
  };

  const handleCopyBankInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!match.bankInfo) return;

    const text = `${match.bankInfo.bank} ${match.bankInfo.account}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('계좌 정보가 복사되었습니다');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={() => onClick(match.id)}
      className={cn(
        'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md',
        isPastMatch && 'opacity-50 grayscale'
      )}
    >
      <div className="p-4 space-y-3">
        {/* Top Section - Type Badge (Left) + Status Badge (Right) */}
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              'text-xs !font-bold border px-2.5 py-1',
              MATCH_TYPE_COLORS[match.type]
            )}
          >
            {MATCH_TYPE_LABELS[match.type]}
          </Badge>

          <Badge
            variant="outline"
            className={cn(
              'text-xs font-medium border px-2.5 py-1',
              MATCH_STATUS_COLORS[match.status]
            )}
          >
            {MATCH_STATUS_LABELS[match.status]}
          </Badge>
        </div>

        {/* Body Section - Date, Time, Location, Team Name, Tournament Info */}
        <div className="space-y-2">
          {/* Date & Time - Larger and prominent */}
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="font-bold text-xl text-slate-900">{match.date}</span>
            <Clock className="w-5 h-5 text-slate-400 ml-2" />
            <span className="font-bold text-xl text-slate-900">{match.time}</span>
          </div>

          {/* Location with Navigation - Larger */}
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
            <button
              onClick={(e) => handleLocationClick(e, match.locationUrl)}
              className="text-slate-900 hover:text-slate-700 text-left flex items-center gap-1 group text-lg font-medium"
            >
              <span>{match.location}</span>
              <Navigation className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
            </button>
          </div>

          {/* Team Name - Same size as location with Shield icon */}
          <div className="flex items-center gap-1.5 text-lg text-slate-500">
            <Shield className="w-5 h-5" />
            <span>{match.teamName}</span>
          </div>
        </div>

        {/* Bottom Section - Type Specific Info */}
        {match.type === 'guest' && (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">금액</span>
              <span className="font-bold text-slate-900 text-lg">
                {match.amount?.toLocaleString()}원
              </span>
            </div>
            {match.bankInfo && (
              <Popover>
                <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs font-medium border-slate-200 text-slate-600 hover:text-slate-900"
                  >
                    송금 정보
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-3 bg-white"
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-900">계좌 정보</div>
                    <button
                      className="flex items-center gap-2 text-sm text-slate-700 underline underline-offset-2 decoration-slate-300 hover:decoration-slate-500 cursor-pointer"
                      onClick={handleCopyBankInfo}
                    >
                      <span>
                        <span className="font-medium">{match.bankInfo.bank}</span>
                        {' '}
                        {match.bankInfo.account}
                        {' '}
                        <span className="text-slate-500">({match.bankInfo.holder})</span>
                      </span>
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500 shrink-0" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        )}

        {match.type === 'host' && (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-500">신청자</span>
              <span className="font-bold text-primary text-lg">{match.applicants}명</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">빈자리</span>
              <span className="font-bold text-slate-900 text-lg">{match.vacancies}명</span>
            </div>
          </div>
        )}

        {match.type === 'team' && (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <span className="text-sm text-slate-500">참여 인원</span>
            <span className="font-bold text-slate-900 text-lg">{match.participants}명</span>
          </div>
        )}

        {match.type === 'tournament' && (
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2 text-slate-600">
              <Trophy className="w-5 h-5 text-slate-400" />
              <span className="font-medium">{match.tournamentName}</span>
              <span className="text-slate-300">|</span>
              <span>{match.round}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
