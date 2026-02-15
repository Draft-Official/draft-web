'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Navigation, Shield, User, Users, AlertCircle, Copy, Check } from 'lucide-react';
import { Button } from '@/shared/ui/base/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/base/dialog';
import { Badge } from '@/shared/ui/base/badge';
import { cn } from '@/shared/lib/utils';
import { formatMatchDate, formatMatchTime } from '@/shared/lib/date';
import { toast } from 'sonner';
import type { ScheduleMatchListItemDTO } from '../../model/types';
import {
  MATCH_STATUS_LABELS,
  MATCH_STATUS_COLORS,
} from '../../config/constants';

interface ApplicationInfoDialogProps {
  match: ScheduleMatchListItemDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetail: (matchId: string) => void;
  onConfirmPayment?: (applicationId: string, matchId: string) => void;
  onCancelApplication?: (applicationId: string, matchId: string) => void;
}

export function ApplicationInfoDialog({
  match,
  open,
  onOpenChange,
  onViewDetail,
  onConfirmPayment,
  onCancelApplication,
}: ApplicationInfoDialogProps) {
  const [copied, setCopied] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  if (!match) return null;

  const isCancelled = match.status === 'cancelled' || match.status === 'rejected';
  const isPaymentWaiting = match.status === 'payment_waiting';
  const isPending = match.status === 'waiting' || match.status === 'pending';
  const canCancel = isPending || isPaymentWaiting;

  const handleCopyBankInfo = () => {
    if (!match.bankInfo) return;
    const text = `${match.bankInfo.bank} ${match.bankInfo.account}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('계좌 정보가 복사되었습니다');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelConfirm = () => {
    if (match.applicationId && onCancelApplication) {
      onCancelApplication(match.applicationId, match.id);
      setIsCancelDialogOpen(false);
      onOpenChange(false);
    }
  };

  const handlePaymentConfirm = () => {
    if (match.applicationId && onConfirmPayment) {
      onConfirmPayment(match.applicationId, match.id);
      setIsPaymentDialogOpen(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-5 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="text-left pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold">내 신청 정보</DialogTitle>
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
            <DialogDescription className="sr-only">
              경기 신청 상세 정보
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* 경기 정보 요약 */}
            <section className="space-y-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-base">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-bold text-slate-900">{match.date}</span>
                <Clock className="w-4 h-4 text-slate-400 ml-2" />
                <span className="font-bold text-slate-900">{match.time}</span>
              </div>
              <div className="flex items-center gap-2 text-base">
                <MapPin className="w-4 h-4 text-slate-400" />
                <button
                  onClick={() => match.locationUrl && window.open(match.locationUrl, '_blank')}
                  className="text-slate-700 hover:text-primary flex items-center gap-1"
                >
                  <span>{match.location}</span>
                  {match.locationUrl && <Navigation className="w-3 h-3" />}
                </button>
              </div>
              <div className="flex items-center gap-2 text-base text-slate-500">
                <Shield className="w-4 h-4" />
                <span>{match.teamName}</span>
              </div>
            </section>

            {/* 신청 정보 */}
            <section className="space-y-3">
              <h3 className="text-sm font-bold text-slate-700">신청 내역</h3>

              <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                {/* 포지션 */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">신청 포지션</span>
                  <span className="text-sm font-medium text-slate-900">
                    {match.applicationInfo?.position || '-'}
                  </span>
                </div>

                {/* 신청 시간 */}
                {match.applicationInfo?.appliedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">신청 시간</span>
                    <span className="text-sm font-medium text-slate-900">
                      {formatMatchDate(match.applicationInfo.appliedAt)} {formatMatchTime(match.applicationInfo.appliedAt)}
                    </span>
                  </div>
                )}

                {/* 참가비 */}
                {match.totalCost != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">참가비</span>
                    <span className="text-sm font-medium text-slate-900">
                      {match.totalCost.toLocaleString()}원
                      {match.perCost != null && match.companionCount != null && (
                        <span className="text-slate-400 ml-1">
                          (인당 {match.perCost.toLocaleString()}원)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* 동반인 */}
              {match.applicationInfo?.companions && match.applicationInfo.companions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      동반인 ({match.applicationInfo.companions.length}명)
                    </span>
                  </div>
                  <div className="space-y-2 ml-6">
                    {match.applicationInfo.companions.map((companion, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2"
                      >
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-slate-900">{companion.name}</span>
                        <span className="text-xs text-slate-500">{companion.position}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 취소/거절 사유 */}
            {isCancelled && match.applicationInfo?.cancelReason && (
              <section className="bg-red-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">취소 사유</p>
                    <p className="text-sm text-red-600 mt-1">{match.applicationInfo.cancelReason}</p>
                  </div>
                </div>
              </section>
            )}

            {/* 입금 정보 (입금대기 상태) */}
            {isPaymentWaiting && match.bankInfo && (
              <section className="bg-orange-50 rounded-xl p-4 border border-orange-100 space-y-3">
                <p className="text-sm font-medium text-orange-700">입금 계좌</p>
                <button
                  onClick={handleCopyBankInfo}
                  className="flex items-center gap-2 text-sm text-orange-900 hover:text-orange-700"
                >
                  <span>
                    {match.bankInfo.bank} {match.bankInfo.account} ({match.bankInfo.holder})
                  </span>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <Copy className="w-4 h-4 shrink-0" />
                  )}
                </button>
                <p className="text-xs text-orange-600">
                  입금 후 아래 &apos;송금 완료&apos; 버튼을 누르면 호스트에게 알림이 전송됩니다.
                </p>
              </section>
            )}

            {/* 송금 완료 버튼 (입금대기 상태) */}
            {isPaymentWaiting && match.bankInfo && onConfirmPayment && (
              <Button
                onClick={() => setIsPaymentDialogOpen(true)}
                className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white"
              >
                송금 완료
              </Button>
            )}

            {/* 경기 상세 버튼 */}
            <Button
              variant={isPaymentWaiting ? 'outline' : 'default'}
              onClick={() => {
                onOpenChange(false);
                onViewDetail(match.id);
              }}
              className={cn(
                'w-full h-12 rounded-xl font-bold',
                isPaymentWaiting
                  ? 'border-slate-200'
                  : 'bg-primary hover:bg-primary/90 text-white'
              )}
            >
              경기 상세 보기
            </Button>

            {/* 신청 취소 버튼 */}
            {canCancel && onCancelApplication && (
              <button
                onClick={() => setIsCancelDialogOpen(true)}
                className="w-full text-center text-sm text-red-500 border border-red-200 rounded-xl py-3 hover:bg-red-50 transition-colors"
              >
                신청 취소하기
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 송금 확인 다이얼로그 */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>송금을 완료하셨나요?</DialogTitle>
            <DialogDescription className="text-slate-600 pt-2 font-medium">
              호스트에게 송금 완료 알림이 전송됩니다.
              호스트가 입금을 확인하면 참가가 확정됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setIsPaymentDialogOpen(false)}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
            >
              돌아가기
            </Button>
            <Button
              onClick={handlePaymentConfirm}
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 rounded-xl font-bold"
            >
              네, 송금했습니다
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 취소 확인 다이얼로그 */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>신청을 취소하시겠습니까?</DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              취소 후에는 다시 신청해야 합니다.
              {isPaymentWaiting && (
                <span className="block mt-2 text-orange-600">
                  이미 입금하셨다면 호스트에게 환불을 요청해 주세요.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setIsCancelDialogOpen(false)}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
            >
              닫기
            </Button>
            <Button
              onClick={handleCancelConfirm}
              className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl font-bold"
            >
              취소하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
