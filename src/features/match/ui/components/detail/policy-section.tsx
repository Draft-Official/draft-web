'use client';

import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/shadcn/accordion';
import { Alert, AlertDescription } from '@/shared/ui/shadcn/alert';
import { Info } from 'lucide-react';

export function PolicySection() {
  return (
    <section className="px-5 py-6 space-y-6">
      {/* Cancellation & Refund Policy */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="cancellation-policy">
          <AccordionTrigger className="text-base font-bold text-slate-900">
            취소 및 환불 규정
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
              <li><strong>경기 전일(24시간 전)까지:</strong> 취소 시 100% 환불</li>
              <li><strong>경기 당일(24시간 이내):</strong> <strong>환불 불가</strong> (대관료 및 인원 확정 문제로 인한 위약금 발생)</li>
              <li><strong>호스트 사유 취소:</strong> 호스트의 귀책(일정 변경 등)으로 취소 시 100% 전액 환불해야합니다.</li>
              <li><strong>인원 미달 취소:</strong> 최소 인원이 모이지 않아 경기가 무산될 경우, 호스트가 계좌이체를 통해 전액 환불해야 합니다.</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Separator */}
      <div className="h-px bg-slate-200" />

      {/* Payment & Fake Deposit Caution */}
      <Alert variant="destructive" className="bg-red-50 border-red-200">
        <Info className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-sm text-red-900">
          <strong>결제 및 허위 입금 주의</strong>
                  <p className="mt-1">
            입금 없이 <strong>허위로 '입금 완료' 버튼을 누를 경우</strong>, 즉시 서비스 정지 및 법적 처벌을 받을 수 있습니다.
          </p>
        </AlertDescription>
      </Alert>
    </section>
  );
}
