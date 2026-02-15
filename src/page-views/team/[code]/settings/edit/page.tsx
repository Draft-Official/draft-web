import { TeamProfileEditView } from '@/features/team/ui/components/detail/team-profile-edit-view';

interface PageProps {
  params: Promise<{ code: string }>;
}

export default async function TeamProfileEditPage({ params }: PageProps) {
  const { code } = await params;
  return <TeamProfileEditView code={code} />;
}
