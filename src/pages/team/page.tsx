'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TeamPageTabs } from '@/features/team';
import { useAuth } from '@/shared/session';
import { Spinner } from '@/shared/ui/shadcn/spinner';

export default function TeamPage() {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login?redirect=/team');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Spinner className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return <TeamPageTabs />;
}
