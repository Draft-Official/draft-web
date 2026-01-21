'use client';

import { createContext, useContext } from 'react';

// 캐시 복원 상태 Context
export const CacheRestoredContext = createContext(false);

export function useCacheRestored() {
  return useContext(CacheRestoredContext);
}
