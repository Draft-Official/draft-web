'use client';

import { MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';

const KAKAO_CHANNEL_URL = 'https://pf.kakao.com/_xnxlxnxl/chat';

export function ContactView() {
  return (
    <div className="flex flex-col items-center text-center px-4 py-16">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
        <MessageSquare className="h-8 w-8 text-primary" />
      </div>

      <h2 className="text-lg font-bold text-foreground mb-2">
        무엇이든 물어보세요
      </h2>
      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        서비스 이용 중 궁금한 점이나
        <br />
        불편한 점이 있다면 편하게 문의해 주세요.
      </p>

      <Button
        className="w-full max-w-[280px] gap-2"
        onClick={() => window.open(KAKAO_CHANNEL_URL, '_blank')}
      >
        카카오톡으로 문의하기
        <ExternalLink className="h-4 w-4" />
      </Button>

      <p className="text-xs text-muted-foreground mt-4">
        운영시간: 평일 10:00 - 18:00
      </p>
    </div>
  );
}
