'use client';

import { use } from 'react';
import { TeamDetailView } from '@/features/team/ui/team-detail-view';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function TeamDetailPage({ params }: PageProps) {
  const { code } = use(params);

  return <TeamDetailView code={code} />;
}
