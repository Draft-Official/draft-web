import { notFound } from 'next/navigation';
import { MatchDetailView } from '../../../src/features/match/ui/match-detail-view';

// Next.js 15+ Page Component: params is a Promise
export default async function GuestMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Await params for Next.js 15+ compatibility
  const { id } = await params;

  // Pass ID to Client Component which will look it up in MatchContext
  return <MatchDetailView matchId={id} />;
}
