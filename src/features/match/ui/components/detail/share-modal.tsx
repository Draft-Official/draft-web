'use client';

import React from 'react';
import { toast } from 'sonner';
import { Link2, MessageCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  matchTitle: string;
  matchDate: string;
  location: string;
}

export function ShareModal({
  open,
  onOpenChange,
  matchId,
  matchTitle,
  matchDate,
  location,
}: ShareModalProps) {
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/matches/${matchId}`
    : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('링크가 복사되었습니다.');
      onOpenChange(false);
    } catch {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const handleKakaoShare = () => {
    // 카카오톡 공유는 Kakao SDK가 필요하므로 링크 공유로 대체
    // 카카오톡 앱이 설치되어 있으면 카카오톡 공유 URL 스킴 사용
    // 간단한 링크 공유 방식으로 대체
    // 실제 Kakao SDK 연동 시 Kakao.Share.sendDefault() 사용 권장
    try {
      // navigator.share가 지원되면 사용 (모바일)
      if (navigator.share) {
        navigator.share({
          title: matchTitle,
          text: `${matchTitle} - ${matchDate} @ ${location}`,
          url: shareUrl,
        }).then(() => {
          onOpenChange(false);
        }).catch(() => {
          // 사용자가 취소한 경우 무시
        });
      } else {
        // 웹에서는 링크 복사로 대체
        handleCopyLink();
      }
    } catch {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">공유하기</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <Button
            variant="outline"
            className="h-14 justify-start gap-4 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
            onClick={handleKakaoShare}
          >
            <div className="w-10 h-10 bg-kakao rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-kakao-foreground" />
            </div>
            <span className="text-sm font-medium text-slate-900">카카오톡 공유</span>
          </Button>

          <Button
            variant="outline"
            className="h-14 justify-start gap-4 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
            onClick={handleCopyLink}
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Link2 className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-900">링크 복사</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
