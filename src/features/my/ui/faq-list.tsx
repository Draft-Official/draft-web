'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/shadcn/accordion';

const FAQ_ITEMS = [
  {
    question: 'DRAFT는 어떤 서비스인가요?',
    answer: [
      'DRAFT는 농구 용병(게스트)을 쉽고 빠르게 모집하고 참여할 수 있는 플랫폼입니다.',
      '게스트는 지역, 날짜, 포지션, 실력 등 조건으로 원하는 경기를 찾아 신청할 수 있고, 호스트는 경기를 등록하고 신청자를 관리할 수 있어요.',
      '팀을 만들어 멤버를 관리하고 정기 운동 일정을 조율하는 기능도 제공합니다.',
    ],
  },
  {
    question: '게스트로 경기에 참여하려면 어떻게 하나요?',
    answer: [
      '홈 화면에서 날짜, 지역, 포지션, 실력 등 필터로 원하는 경기를 찾아보세요.',
      '경기를 선택하면 시간, 장소, 참가비, 경기 방식 등 상세 정보를 확인할 수 있습니다.',
      '신청 버튼을 누르고 포지션을 선택하면 끝! 호스트가 승인하면 송금 정보가 안내되고, 송금 완료 버튼을 누르면 참여가 확정됩니다.',
    ],
  },
  {
    question: '호스트로 경기를 등록하려면 어떻게 하나요?',
    answer: [
      '매치 등록 페이지에서 날짜, 시간, 장소, 모집 포지션, 참가비 등을 입력하면 바로 게스트 모집을 시작할 수 있습니다.',
      '게스트가 신청하면 신청자 관리 화면에서 수락 또는 거절을 간편하게 처리할 수 있어요.',
      '팀이 있다면 팀 정보가 자동으로 연결되지만, 팀 없이도 경기 등록이 가능합니다.',
    ],
  },
  {
    question: '참가비는 어떻게 결제하나요?',
    answer: [
      '호스트가 신청을 승인하면 송금 안내 정보를 확인할 수 있습니다.',
      '안내된 계좌로 직접 송금한 후, 송금 완료 버튼을 누르면 참여가 확정됩니다.',
      '호스트가 실제 입금을 확인한 후 문제가 있을 경우 취소될 수 있으니 정확한 금액을 입금해 주세요.',
    ],
  },
  {
    question: '신청을 취소할 수 있나요?',
    answer: [
      '승인 대기 중인 신청은 직접 취소할 수 있습니다.',
      '송금 완료 후 확정된 상태에서는 직접 취소가 불가능하며, 호스트에게 취소를 요청해야 합니다.',
      '이 경우 참가비 환불이 어려울 수 있으니 신중하게 신청해 주세요.',
    ],
  },
  {
    question: '문제가 생기면 어떻게 하나요?',
    answer: [
      '허위 송금, 환불 미처리, 경기 정보와 다른 운영 등 문제가 발생한 경우 운영팀에 문의해 주세요.',
      '마이페이지 > 문의하기에서 카카오톡 채널을 통해 상담을 받으실 수 있습니다.',
      '원활한 처리를 위해 관련 매치 정보와 상황을 함께 알려주시면 도움이 됩니다.',
    ],
  },
];

export function FaqList() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {FAQ_ITEMS.map((item, index) => (
        <AccordionItem key={index} value={`faq-${index}`} className="border-border/50">
          <AccordionTrigger className="px-1 text-left text-base font-medium hover:no-underline">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="px-1 text-base text-foreground leading-relaxed">
            {item.answer.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
