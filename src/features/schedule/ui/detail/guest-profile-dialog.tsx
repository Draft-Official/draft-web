'use client';

import { Button } from '@/shared/ui/base/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/base/dialog';
import { formatMatchDate, formatMatchTime } from '@/shared/lib/date';
import type { Guest } from '../../model/types';

interface GuestProfileDialogProps {
  guest: Guest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (guest: Guest) => void;
  onReject: (guest: Guest) => void;
  onConfirmPayment: (guest: Guest) => void;
  onCancel: (guest: Guest) => void;
  isEnded?: boolean;
}

export function GuestProfileDialog({
  guest,
  open,
  onOpenChange,
  onApprove,
  onReject,
  onConfirmPayment,
  onCancel,
  isEnded = false,
}: GuestProfileDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
        {guest && (
          <div className="flex flex-col items-center space-y-6 pt-2">
            {/* 아바타 + 이름 + 팀 */}
            <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-slate-600 font-bold text-3xl">
                {(guest.realName || guest.name).charAt(0)}
              </span>
            </div>

            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-slate-900 text-center">
                {guest.realName || guest.name}
              </DialogTitle>
              {guest.realName && guest.realName !== guest.name && (
                <p className="text-sm text-slate-400 text-center">닉네임: {guest.name}</p>
              )}
              {guest.teamName && (
                <p className="text-sm text-slate-500 text-center">{guest.teamName}</p>
              )}
              <DialogDescription className="sr-only">
                게스트의 상세 정보를 확인하고 승인 또는 거절할 수 있습니다.
              </DialogDescription>
            </DialogHeader>

            {/* 프로필 정보 */}
            <div className="w-full space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">포지션</span>
                <span className="font-medium text-slate-900">{guest.position}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">실력</span>
                <span className="font-medium text-slate-900">{guest.level}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">나이대</span>
                <span className="font-medium text-slate-900">{guest.ageGroup}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">키</span>
                <span className="font-medium text-slate-900">{guest.height}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">팀</span>
                <span className="font-medium text-slate-900">{guest.teamName || '-'}</span>
              </div>
            </div>

            {/* 신청시간 */}
            {guest.appliedAt && (
              <div className="w-full space-y-3 border-t border-b border-slate-100 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">신청시간</span>
                  <span className="font-medium text-slate-900">
                    {formatMatchDate(guest.appliedAt)} {formatMatchTime(guest.appliedAt)}
                  </span>
                </div>
              </div>
            )}

            {/* 동반인 정보 */}
            {guest.companions && guest.companions.length > 0 && (
              <div className="w-full space-y-3">
                <p className="text-sm font-medium text-slate-700">
                  동반인 ({guest.companions.length}명)
                </p>
                <div className="space-y-2">
                  {guest.companions.map((companion, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1"
                    >
                      <span className="font-medium text-slate-900 text-sm">
                        {companion.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <span>{companion.position}</span>
                        {companion.height && <><span className="text-slate-300">·</span><span>{companion.height}</span></>}
                        {companion.age && <><span className="text-slate-300">·</span><span>{companion.age}</span></>}
                        {companion.skillLevel && <><span className="text-slate-300">·</span><span>{companion.skillLevel}</span></>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 경기 이력 */}
            <div className="w-full space-y-3">
              <p className="text-sm font-medium text-slate-700">이 팀과의 경기 이력</p>

              {guest.matchHistory ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-slate-900 font-medium">
                    참여 {guest.matchHistory.count}회
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    마지막 참여: {guest.matchHistory.lastDate}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-slate-900 font-medium">첫 참여입니다</p>
                </div>
              )}
            </div>

            {/* 액션 버튼 - 종료/취소된 경기에서는 숨김 */}
            {!isEnded && (
              <div className="w-full flex gap-2 pt-2">
                {guest.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => onApprove(guest)}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                    >
                      승인
                    </Button>
                    <Button
                      onClick={() => onReject(guest)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl"
                    >
                      거절
                    </Button>
                  </>
                )}

                {guest.status === 'payment_waiting' && (
                  <>
                    <Button
                      onClick={() => onConfirmPayment(guest)}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl"
                    >
                      입금확인
                    </Button>
                    <Button
                      onClick={() => onCancel(guest)}
                      className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl"
                    >
                      취소
                    </Button>
                  </>
                )}

                {guest.status === 'confirmed' && (
                  <Button
                    onClick={() => onCancel(guest)}
                    className="w-full bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-12 rounded-xl"
                  >
                    취소
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
