import { PendingMembersView } from '@/features/team/ui/components/detail/pending-members-view';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function PendingMembersPage({ params }: PageProps) {
  const { code } = await params;
  return <PendingMembersView code={code} />;
}
