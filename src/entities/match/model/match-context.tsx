'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Match, MOCK_MATCHES } from '@/features/match/model/mock-data';

interface MatchContextType {
  matches: Match[];
  addMatch: (match: Match) => void;
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

export function MatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);

  const addMatch = (match: Match) => {
    setMatches((prev) => [match, ...prev]);
  };

  return (
    <MatchContext.Provider value={{ matches, addMatch }}>
      {children}
    </MatchContext.Provider>
  );
}

export function useMatches() {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatches must be used within a MatchProvider');
  }
  return context;
}
