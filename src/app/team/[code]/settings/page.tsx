'use client';

import { use } from 'react';
import { TeamSettingsView } from '@/features/team/ui/components/detail/team-settings-view';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function TeamSettingsPage({ params }: PageProps) {
  const { code } = use(params);

  return <TeamSettingsView code={code} />;
}
