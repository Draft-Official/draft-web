'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { getQueryClient } from '@/shared/lib/query-client';
import { MatchProvider } from '../src/entities/match/model/match-context';
import { AuthProvider } from '@/features/auth/model/auth-context';


export function Providers({ children }: { children: React.ReactNode }) {
  // NOTE: useState로 queryClient를 관리하지 않음
  // getQueryClient()가 클라이언트에서 싱글톤을 반환하기 때문
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MatchProvider>
          {children}
        </MatchProvider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
