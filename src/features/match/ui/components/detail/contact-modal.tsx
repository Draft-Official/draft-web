'use client';

import React from 'react';
import { toast } from 'sonner';
import { Phone, MessageCircle, Copy, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import type { ContactTypeValue } from '@/shared/config/match-constants';

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactType: ContactTypeValue;
  contactValue: string;
}

export function ContactModal({
  open,
  onOpenChange,
  contactType,
  contactValue,
}: ContactModalProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(contactValue);
      toast.success(contactType === 'PHONE' ? '전화번호가 복사되었습니다.' : '링크가 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleOpenLink = () => {
    if (contactType === 'KAKAO_OPEN_CHAT') {
      window.open(contactValue, '_blank', 'noopener,noreferrer');
      onOpenChange(false);
    }
  };

  const isPhone = contactType === 'PHONE';
  const isKakao = contactType === 'KAKAO_OPEN_CHAT';

  // 전화번호 포맷팅 (010-1234-5678 형식)
  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">문의하기</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* 연락처 정보 */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              {isPhone ? (
                <Phone className="w-5 h-5 text-slate-600" />
              ) : (
                <MessageCircle className="w-5 h-5 text-kakao-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-slate-500 mb-0.5">
                {isPhone ? '전화번호' : '카카오 오픈채팅'}
              </div>
              <div className="text-sm font-medium text-slate-900 truncate">
                {isPhone ? formatPhoneNumber(contactValue) : contactValue}
              </div>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11 gap-2"
              onClick={handleCopy}
            >
              <Copy className="w-4 h-4" />
              {isPhone ? '번호 복사' : '링크 복사'}
            </Button>

            {isKakao && (
              <Button
                className="flex-1 h-11 gap-2 bg-kakao hover:bg-kakao/90 text-kakao-foreground"
                onClick={handleOpenLink}
              >
                <ExternalLink className="w-4 h-4" />
                열기
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
