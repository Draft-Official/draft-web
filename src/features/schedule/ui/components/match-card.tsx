'use client';

import { useState, useRef } from 'react';
import { Users, Trophy } from 'lucide-react';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { MatchCardLayout } from '@/shared/ui/composite/match-card-layout';
import { PaymentConfirmDialog } from './payment-confirm-dialog';
import { cn } from '@/shared/lib/utils';
import type { ScheduleMatchListItemDTO } from '../../model/types';
import type { UnreadMatchNotificationDTO } from '@/features/notification';
import { NOTIFICATION_TYPE_DESCRIPTIONS } from '@/shared/config/match-constants';
import {
  MATCH_TYPE_LABELS,
  MATCH_TYPE_COLORS,
  MATCH_STATUS_LABELS,
  MATCH_STATUS_COLORS,
  PAST_MATCH_STATUSES,
} from '../../config/constants';

interface MatchCardProps {
  match: ScheduleMatchListItemDTO;
  notifications?: UnreadMatchNotificationDTO[];
  onClick: (matchId: string) => void;
  onConfirmPayment?: (applicationId: string, matchId: string) => void;
}

export function MatchCard({ match, notifications, onClick, onConfirmPayment }: MatchCardProps) {
  const isPastMatch = PAST_MATCH_STATUSES.includes(match.status);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const dialogClosedAt = useRef(0);

  const handlePaymentDialogChange = (open: boolean) => {
    if (!open) dialogClosedAt.current = Date.now();
    setIsPaymentConfirmOpen(open);
  };

  const handleLocationClick = () => {
    if (match.locationUrl) {
      window.open(match.locationUrl, '_blank');
    }
  };

  const renderBottomSlot = () => {
    switch (match.matchType) {
      case 'guest':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="font-bold text-slate-900 text-base">
                {match.totalCost?.toLocaleString()}원
              </span>
              {match.companionCount != null && match.perCost != null && (
                <span className="text-xs text-slate-400">
                  (인당:{match.perCost.toLocaleString()}원)
                </span>
              )}
            </div>
            {match.bankInfo && match.status === 'payment_waiting' && (
              <Button
                size="sm"
                className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPaymentConfirmOpen(true);
                }}
              >
                송금하기
              </Button>
            )}
          </div>
        );
      case 'host':
        return (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-500">신청자</span>
              <span className="font-bold text-primary text-base">{match.applicants}명</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-slate-500">빈자리</span>
              <span className="font-bold text-slate-900 text-base">{match.vacancies}명</span>
            </div>
          </div>
        );
      case 'team':
        return (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-500">참여 인원</span>
            <span className="font-bold text-slate-900 text-base">{match.participants}명</span>
          </div>
        );
      case 'tournament':
        return (
          <div className="flex items-center gap-1 text-slate-600">
            <Trophy className="w-4 h-4 text-slate-400" />
            <span className="font-medium">{match.tournamentName}</span>
            <span className="text-slate-300">|</span>
            <span>{match.round}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <MatchCardLayout
        date={match.date}
        time={match.time}
        gymName={match.location}
        gymAddress={match.locationUrl}
        teamName={match.teamName}
        onClick={() => {
          if (Date.now() - dialogClosedAt.current < 300) return;
          onClick(match.id);
        }}
        onLocationClick={handleLocationClick}
        isPast={isPastMatch}
        headerSlot={
          !isPastMatch && notifications && notifications.length > 0 ? (
            <div className="bg-brand-weak px-4 py-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold text-white bg-primary rounded leading-none shrink-0">
                new
              </span>
              <span className="text-xs font-medium text-slate-600 truncate">
                {NOTIFICATION_TYPE_DESCRIPTIONS[notifications[0].type]}
              </span>
              {notifications.length > 1 && (
                <span className="text-xs text-slate-400 shrink-0">외 {notifications.length - 1}건</span>
              )}
            </div>
          ) : undefined
        }
        topSlot={
          <>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium border px-2.5 py-1',
                MATCH_TYPE_COLORS[match.matchType]
              )}
            >
              {MATCH_TYPE_LABELS[match.matchType]}
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
          </>
        }
        bottomSlot={renderBottomSlot()}
      />

      <PaymentConfirmDialog
        open={isPaymentConfirmOpen}
        onOpenChange={handlePaymentDialogChange}
        bankInfo={match.bankInfo}
        onConfirm={() => {
          if (match.applicationId && onConfirmPayment) {
            onConfirmPayment(match.applicationId, match.id);
          }
        }}
      />
    </>
  );
}
