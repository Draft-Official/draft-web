import React from 'react';
import { notFound } from 'next/navigation';
import { MatchDetailView } from '@/features/match/ui/match-detail-view';
import { MOCK_MATCHES } from '@/features/match/model/mock-data';

export default function GuestMatchDetailPage({ params }: { params: { id: string } }) {
  // Find match by ID
  const match = MOCK_MATCHES.find(m => m.id === params.id);

  if (!match) {
    notFound(); 
  }

  return <MatchDetailView match={match} />;
}
