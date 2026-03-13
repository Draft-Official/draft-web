import type { Metadata } from 'next';
import { createNoindexMetadata } from '../../../metadata-config';

export const metadata: Metadata = createNoindexMetadata({
  title: '개인정보 처리방침',
  description:
    'DRAFT Match 개인정보 처리방침입니다. 수집 항목, 이용 목적, 보관 기간, 이용자 권리를 안내합니다.',
  canonical: '/my/privacy',
});

export { default } from '@/pages/my/privacy/page';
