import type { Metadata } from 'next';
import { createIndexedMetadata } from '../../../metadata-config';

interface MatchDetailPageMetadataProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: MatchDetailPageMetadataProps): Promise<Metadata> {
  const { id } = await params;

  return createIndexedMetadata({
    title: '농구 경기 상세',
    description:
      '경기 시간, 장소, 참가비, 모집 포지션, 신청 현황을 확인하고 게스트로 신청하세요.',
    canonical: `/matches/${id}`,
  });
}

export { default } from '@/pages/matches/[id]/page';
