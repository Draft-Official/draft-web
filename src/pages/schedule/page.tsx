'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MatchManagementView } from '@/features/schedule/ui/match-management-view';
import { useAuth } from '@/shared/session';
import { Spinner } from '@/shared/ui/shadcn/spinner';

export default function SchedulePage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=/schedule');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return <MatchManagementView />;
}
