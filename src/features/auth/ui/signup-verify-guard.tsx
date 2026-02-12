'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../model/auth-context';

const EXCLUDED_PATHS = ['/signup/verify', '/auth', '/login'];

export function SignupVerifyGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isExcluded = EXCLUDED_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isLoading || isExcluded) return;

    if (isAuthenticated && profile && (!profile.real_name || !profile.phone_verified)) {
      router.replace('/signup/verify');
    }
  }, [isLoading, isAuthenticated, profile, isExcluded, router]);

  return <>{children}</>;
}
