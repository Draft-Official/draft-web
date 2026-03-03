'use client';

import { useState } from 'react';
import Image from 'next/image';
import { toast } from '@/shared/ui/shadcn/sonner';
import { cn } from '@/shared/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/shadcn/alert-dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { useTransferLeadership } from '@/features/team/api/membership/mutations';
import type { TeamMember } from '@/features/team/model/types';

interface DelegateLeaderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId: string;
  currentLeaderId: string;
  members: TeamMember[];
  onSuccess?: () => void;
}

export function DelegateLeaderDialog({
  open,
  onOpenChange,
  teamId,
  currentLeaderId,
  members,
  onSuccess,
}: DelegateLeaderDialogProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const transferMutation = useTransferLeadership();

  // 본인 제외, ACCEPTED 상태인 멤버만
  const eligibleMembers = members.filter(
    (m) => m.userId !== currentLeaderId && m.status === 'ACCEPTED'
  );

  const selectedMember = eligibleMembers.find((m) => m.userId === selectedMemberId);

  const handleConfirm = () => {
    if (!selectedMemberId) return;

    transferMutation.mutate(
      { teamId, currentLeaderId, newLeaderId: selectedMemberId },
      {
        onSuccess: () => {
          toast.success('팀장 권한이 위임되었습니다');
          setShowConfirm(false);
          onOpenChange(false);
          onSuccess?.();
        },
        onError: () => {
          toast.error('권한 위임에 실패했습니다');
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>팀 소유자 위임</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-slate-500 mb-4">
              팀장 권한을 위임할 멤버를 선택하세요.
            </p>

            {eligibleMembers.length === 0 ? (
              <p className="text-center text-slate-400 py-8">
                위임 가능한 멤버가 없습니다
              </p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {eligibleMembers.map((member) => {
                  const isSelected = selectedMemberId === member.userId;
                  const avatarChar = member.user?.nickname?.charAt(0) || '?';

                  return (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMemberId(member.userId)}
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg border transition-colors',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-slate-200 hover:border-slate-300'
                      )}
                    >
                      {member.user?.avatarUrl ? (
                        <Image
                          src={member.user.avatarUrl}
                          alt=""
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                          {avatarChar}
                        </div>
                      )}
                      <span className="font-medium text-slate-900">
                        {member.user?.nickname || '알 수 없음'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1 h-12 rounded-xl font-bold" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl font-bold"
              disabled={!selectedMemberId}
              onClick={() => setShowConfirm(true)}
            >
              위임
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>팀장 권한을 위임하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedMember?.user?.nickname}님에게 팀장 권한을 위임하면
              본인은 일반 멤버가 됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="flex-1 h-12 rounded-xl font-bold">취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="flex-1 h-12 rounded-xl font-bold"
              disabled={transferMutation.isPending}
            >
              {transferMutation.isPending ? '위임 중...' : '확인'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
