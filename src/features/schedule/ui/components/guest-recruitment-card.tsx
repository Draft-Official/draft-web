'use client';

import { useRef, useState } from 'react';
import { Users } from 'lucide-react';
import { Badge } from '@/shared/ui/shadcn/badge';
import { Button } from '@/shared/ui/shadcn/button';
import { MatchCardLayout } from '@/shared/ui/composite/match-card-layout';
import { cn } from '@/shared/lib/utils';
import { DESKTOP_SPLIT_ACTIVE_CARD_CLASS } from '@/shared/ui/layout';
import type { ScheduleMatchListItemDTO } from '../../model/types';
import type { UnreadMatchNotificationDTO } from '@/features/notification';
import { NOTIFICATION_TYPE_DESCRIPTIONS } from '@/shared/config/match-constants';
import { PaymentConfirmDialog } from './payment-confirm-dialog';
import {
  MANAGEMENT_TYPE_COLORS,
  MANAGEMENT_TYPE_LABELS,
  MATCH_STATUS_COLORS,
  MATCH_STATUS_LABELS,
  PAST_MATCH_STATUSES,
} from '../../config/constants';

interface GuestRecruitmentCardProps {
  match: ScheduleMatchListItemDTO;
  notifications?: UnreadMatchNotificationDTO[];
  onClick: (matchId: string) => void;
  onConfirmPayment?: (applicationId: string, matchId: string) => void;
  isActive?: boolean;
}

export function GuestRecruitmentCard({
  match,
  notifications,
  onClick,
  onConfirmPayment,
  isActive = false,
}: GuestRecruitmentCardProps) {
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const dialogClosedAt = useRef(0);
  const isPastMatch = PAST_MATCH_STATUSES.includes(match.status);

  const handlePaymentDialogChange = (open: boolean) => {
    if (!open) dialogClosedAt.current = Date.now();
    setIsPaymentConfirmOpen(open);
  };

  const handleLocationClick = () => {
    if (match.locationUrl) {
      window.open(match.locationUrl, '_blank');
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
        className={cn(
          isActive && DESKTOP_SPLIT_ACTIVE_CARD_CLASS
        )}
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
                MANAGEMENT_TYPE_COLORS[match.managementType]
              )}
            >
              {MANAGEMENT_TYPE_LABELS[match.managementType]}
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
        bottomSlot={
          match.matchType === 'host' ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-500">대기자</span>
                <span className="font-bold text-primary text-base">{match.applicants}명</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-500">빈자리</span>
                <span className="font-bold text-slate-900 text-base">{match.vacancies}명</span>
              </div>
            </div>
          ) : (
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
          )
        }
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
