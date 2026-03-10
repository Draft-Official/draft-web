'use client';

import { MatchManagementView } from '@/features/schedule/ui/match-management-view';
import { LoginRequiredBlock } from '@/features/auth';
import { useAuth } from '@/shared/session';
import { Spinner } from '@/shared/ui/shadcn/spinner';

export default function SchedulePage() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginRequiredBlock description="로그인하고 다양한 기능을 이용해보세요." redirectTo="/schedule" />;
  }

  return <MatchManagementView />;
}
