import type { Metadata } from 'next';
import { createIndexedMetadata } from '../metadata-config';

export const metadata: Metadata = createIndexedMetadata({
  title: '농구 게스트 모집',
  description:
    '지역·날짜·포지션 필터로 원하는 농구 경기를 찾아 신청하세요. DRAFT Match에서 모집 중인 게스트 경기를 한눈에 확인할 수 있습니다.',
  canonical: '/',
});

export { default } from '@/pages/home/page';
