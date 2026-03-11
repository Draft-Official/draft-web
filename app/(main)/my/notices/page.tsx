import type { Metadata } from 'next';
import { createIndexedMetadata } from '../../../metadata-config';

export const metadata: Metadata = createIndexedMetadata({
  title: '공지사항',
  description: 'DRAFT Match 서비스 점검, 정책 변경, 주요 업데이트 소식을 확인하세요.',
  canonical: '/my/notices',
});

export { default } from '@/pages/my/notices/page';
