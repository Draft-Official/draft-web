'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MoreVertical, Pencil, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';

interface KebabMenuProps {
  matchId: string;
  isHost: boolean;
  hasConfirmedGuests: boolean;
  onCancelMatch?: () => void;
}

export function KebabMenu({
  matchId,
  isHost,
  hasConfirmedGuests,
  onCancelMatch,
}: KebabMenuProps) {
  const router = useRouter();
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  // 호스트가 아니면 메뉴 숨김
  if (!isHost) {
    return null;
  }

  const handleEdit = () => {
    if (hasConfirmedGuests) {
      toast.info('확정된 게스트가 있어 가격/포지션만 수정 가능합니다.');
    }
    router.push(`/matches/${matchId}/edit`);
  };

  const handleCancelClick = () => {
    if (hasConfirmedGuests) {
      toast.error('확정된 게스트가 있어 경기를 취소할 수 없습니다.');
      return;
    }
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    onCancelMatch?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 bg-white">
          <DropdownMenuItem
            onClick={handleEdit}
            className="flex items-center gap-2 py-2.5 px-3 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <span>수정</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleCancelClick}
            disabled={hasConfirmedGuests}
            variant={hasConfirmedGuests ? 'default' : 'destructive'}
            className="flex items-center gap-2 py-2.5 px-3 cursor-pointer"
          >
            <XCircle className="w-4 h-4" />
            <span>경기 취소</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 취소 확인 다이얼로그 */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent size="sm" className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>경기 취소</DialogTitle>
            <DialogDescription>
              정말 이 경기를 취소하시겠습니까?
              <br />
              취소한 경기는 복구할 수 없습니다.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowCancelDialog(false)}
            >
              아니오
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleConfirmCancel}
            >
              취소하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
