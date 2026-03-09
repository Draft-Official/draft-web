'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Copy, Link2, MessageCircle, NotebookPen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import type { GuestMatchDetailDTO } from '@/features/match/model/types';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { POSITION_LABELS } from '@/shared/config/match-constants';
import { buildDaumCafeRecruitTemplate } from '@/features/match/lib/daum-cafe-template';
import { buildDaumCafeFacilityText } from '@/features/match/lib/daum-cafe-facility-text';

const DAUM_CAFE_WRITE_URL = 'https://m.cafe.daum.net/dongarry/Dilr/new?returnURL=https%3A%2F%2Fm.cafe.daum.net%2Fdongarry%2FDilr%3FboardType%3D';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: GuestMatchDetailDTO;
}

export function ShareModal({
  open,
  onOpenChange,
  match,
}: ShareModalProps) {
  const [isDaumSectionVisible, setIsDaumSectionVisible] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/matches/${match.publicId}`
    : '';

  useEffect(() => {
    if (!open) {
      setIsDaumSectionVisible(false);
    }
  }, [open]);

  const cafeTemplate = useMemo(() => {
    const displayTeamName = match.teamId
      ? (match.teamName || '팀명 미정')
      : (match.manualTeamName || match.teamName || '팀명 미정');

    const recruitmentParts: string[] = [];
    let totalMax = 0;

    if (match.positions.all) {
      totalMax = match.positions.all.max;
      recruitmentParts.push(`포지션 무관 ${match.positions.all.max}명`);
    } else {
      if (match.positions.g) {
        recruitmentParts.push(`${POSITION_LABELS.G.full} ${match.positions.g.max}명`);
        totalMax += match.positions.g.max;
      }
      if (match.positions.f) {
        recruitmentParts.push(`${POSITION_LABELS.F.full} ${match.positions.f.max}명`);
        totalMax += match.positions.f.max;
      }
      if (match.positions.c) {
        recruitmentParts.push(`${POSITION_LABELS.C.full} ${match.positions.c.max}명`);
        totalMax += match.positions.c.max;
      }
      if (match.positions.bigman) {
        recruitmentParts.push(`${POSITION_LABELS.B.full} ${match.positions.bigman.max}명`);
        totalMax += match.positions.bigman.max;
      }
    }

    if (totalMax === 0 && match.recruitmentStatus?.total) {
      totalMax = match.recruitmentStatus.total;
    }

    const recruitmentText = totalMax > 0
      ? (recruitmentParts.length > 0
          ? `총 ${totalMax}명 (${recruitmentParts.join(' / ')})`
          : `총 ${totalMax}명`)
      : '모집 인원 정보 확인';

    const contactText = match.contactValue || 'DRAFT 경기 문의 채팅';

    const facilityText = buildDaumCafeFacilityText({
      facilities: match.facilities,
      providesBeverage: match.providesBeverage,
    });
    const noticeText = match.hostMessage?.trim();
    const notesText = [
      `공지 사항 : ${noticeText || '없음'}`,
      `시설 정보 : ${facilityText}`,
    ].join('\n');

    return buildDaumCafeRecruitTemplate({
      dateISO: match.dateISO,
      startTime: match.startTime,
      endTime: match.endTime,
      placeName: match.location || match.gymName,
      address: match.address,
      teamName: displayTeamName,
      recruitmentText,
      costText: match.price,
      contactText,
      notesText,
      shareUrl,
    });
  }, [match, shareUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('링크가 복사되었습니다.');
      onOpenChange(false);
    } catch {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const handleCopyCafeTitle = async () => {
    try {
      await navigator.clipboard.writeText(cafeTemplate.title);
      toast.success('다음카페 제목이 복사되었습니다.');
    } catch {
      toast.error('다음카페 제목 복사에 실패했습니다.');
    }
  };

  const handleCopyCafeBody = async () => {
    try {
      await navigator.clipboard.writeText(cafeTemplate.body);
      toast.success('다음카페 본문이 복사되었습니다.');
    } catch {
      toast.error('다음카페 본문 복사에 실패했습니다.');
    }
  };

  const handleCopyCafeAll = async () => {
    try {
      await navigator.clipboard.writeText(cafeTemplate.fullText);
      toast.success('다음카페 제목+본문이 복사되었습니다.');
    } catch {
      toast.error('다음카페 복사에 실패했습니다.');
    }
  };

  const handleOpenDaumCafeWritePage = () => {
    if (typeof window === 'undefined') return;

    // 브라우저 기본 "새 탭/새 창" 동작을 따르도록 feature 옵션 없이 연다.
    // (사용자 브라우저 설정에 따라 탭 또는 새 창으로 열림)
    const nextTab = window.open(DAUM_CAFE_WRITE_URL, '_blank');
    if (nextTab) {
      nextTab.opener = null;
    }
  };

  const handleOpenDaumCafeGenerator = () => {
    setIsDaumSectionVisible(true);
    handleOpenDaumCafeWritePage();
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
          title: match.title,
          text: `${match.title} - ${match.dateISO} @ ${match.location}`,
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
      <DialogContent size="xl" className="rounded-2xl max-h-[85vh] overflow-y-auto">
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

          <Button
            variant="outline"
            className="h-14 justify-start gap-4 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
            onClick={handleOpenDaumCafeGenerator}
          >
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <NotebookPen className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-sm font-medium text-slate-900">BDR 카페 글 생성</span>
          </Button>
        </div>

        {isDaumSectionVisible && (
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <Button
              variant="outline"
              className="h-12 justify-start gap-3 px-4 rounded-xl border-slate-200 hover:bg-slate-50"
              onClick={handleCopyCafeAll}
            >
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <Copy className="w-4 h-4 text-slate-600" />
              </div>
              <span className="text-sm font-medium text-slate-900">제목 + 본문 한 번에 복사</span>
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="h-10 rounded-xl border-slate-200" onClick={handleCopyCafeTitle}>
                제목 복사
              </Button>
              <Button variant="outline" className="h-10 rounded-xl border-slate-200" onClick={handleCopyCafeBody}>
                본문 복사
              </Button>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">제목 미리보기</p>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 break-all">
                {cafeTemplate.title}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">본문 미리보기</p>
              <Textarea
                value={cafeTemplate.body}
                readOnly
                className="min-h-[220px] resize-none bg-slate-50 border-slate-200 text-sm text-slate-800"
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
