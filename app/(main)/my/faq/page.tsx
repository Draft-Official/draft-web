import type { Metadata } from 'next';
import { createIndexedMetadata } from '../../../metadata-config';

export const metadata: Metadata = createIndexedMetadata({
  title: '자주 묻는 질문',
  description:
    '로그인, 경기 신청, 모집 등록, 결제·취소 등 DRAFT Match 이용 중 자주 묻는 질문을 확인하세요.',
  canonical: '/my/faq',
});

export { default } from '@/pages/my/faq/page';
