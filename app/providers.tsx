'use client';

import React from 'react';
import { MatchProvider } from '../src/entities/match/model/match-context';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MatchProvider>
      {children}
    </MatchProvider>
  );
}
