'use client';

import { useState, useRef } from 'react';
import { Calendar, Clock, MapPin, Navigation, Users, Shield, Trophy, Copy, Check } from 'lucide-react';
import { Badge } from '@/shared/ui/base/badge';
import { Button } from '@/shared/ui/base/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/base/popover';
import { PaymentConfirmDialog } from './payment-confirm-dialog';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import type { ManagedMatch } from '../../model/types';
import type { ClientNotification } from '@/features/notification/model/types';
import { NOTIFICATION_TYPE_DESCRIPTIONS } from '@/shared/config/constants';
import {
  MATCH_TYPE_LABELS,
  MATCH_TYPE_COLORS,
  MATCH_STATUS_LABELS,
  MATCH_STATUS_COLORS,
  PAST_MATCH_STATUSES,
} from '../../config/constants';

interface MatchCardProps {
  match: ManagedMatch;
  notifications?: ClientNotification[];
  onClick: (matchId: string) => void;
  onConfirmPayment?: (applicationId: string, matchId: string) => void;
}

export function MatchCard({ match, notifications, onClick, onConfirmPayment }: MatchCardProps) {
  const isPastMatch = PAST_MATCH_STATUSES.includes(match.status);
  const [copied, setCopied] = useState(false);
  const [isPaymentConfirmOpen, setIsPaymentConfirmOpen] = useState(false);
  const dialogClosedAt = useRef(0);

  const handlePaymentDialogChange = (open: boolean) => {
    if (!open) dialogClosedAt.current = Date.now();
    setIsPaymentConfirmOpen(open);
  };

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
      onClick={() => {
        if (Date.now() - dialogClosedAt.current < 300) return;
        onClick(match.id);
      }}
      className={cn(
        'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all cursor-pointer hover:shadow-md',
        isPastMatch && 'opacity-50 grayscale'
      )}
    >
      {/* Notification Badge */}
      {!isPastMatch && notifications && notifications.length > 0 && (
        <div className="bg-orange-50 px-4 py-2 flex items-center gap-2">
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
      )}

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
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-slate-900 text-lg">
                {match.totalCost?.toLocaleString()}원
              </span>
              {match.companionCount != null && match.perCost != null && (
                <span className="text-xs text-slate-400">
                  (인당:{match.perCost.toLocaleString()}원)
                </span>
              )}
            </div>
            {match.bankInfo && match.status === 'payment_waiting' ? (
              // 입금대기 상태: 송금 하기 + 송금 완료 버튼
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium border-slate-200 text-slate-600 hover:text-slate-900"
                    >
                      송금 하기
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-3 bg-white"
                    align="end"
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
                <Button
                  size="sm"
                  className="h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-white"
                  onClick={() => setIsPaymentConfirmOpen(true)}
                >
                  송금 완료
                </Button>
              </div>
            ) : match.bankInfo && match.status !== 'pending' && match.status !== 'waiting' && match.status !== 'cancelled' && match.status !== 'rejected' ? (
              // 승인 이후 상태: 송금 정보 팝오버
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
            ) : null}
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

      <PaymentConfirmDialog
        open={isPaymentConfirmOpen}
        onOpenChange={handlePaymentDialogChange}
        onConfirm={() => {
          if (match.applicationId && onConfirmPayment) {
            onConfirmPayment(match.applicationId, match.id);
          }
        }}
      />
    </div>
  );
}
