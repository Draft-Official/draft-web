import type { Metadata } from 'next';
import { createNoindexMetadata } from '../../../metadata-config';

export const metadata: Metadata = createNoindexMetadata({
  title: '서비스 이용약관',
  description:
    'DRAFT Match 서비스 이용약관입니다. 회원의 권리·의무, 서비스 이용 조건, 취소·환불 정책을 확인하세요.',
  canonical: '/my/terms',
});

export { default } from '@/pages/my/terms/page';
