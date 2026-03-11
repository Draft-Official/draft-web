'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { QueryClientProvider } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { getQueryClient } from '@/shared/api/query-client';
import { CacheRestoredContext } from '@/shared/lib/cache-restored-context';
import { AuthProvider } from '@/shared/session';

const ReactQueryDevtools =
  process.env.NODE_ENV === 'development'
    ? dynamic(() =>
      import('@tanstack/react-query-devtools').then((module) => module.ReactQueryDevtools)
    )
    : (() => null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient());
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
      key: 'draft-query-cache',
    });

    const [unsubscribe, promise] = persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24, // 24시간
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          const queryKey = query.queryKey as string[];
          return queryKey[0] === 'auth' || queryKey[0] === 'profile';
        },
      },
    });

    promise.then(() => setIsRestored(true));

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <CacheRestoredContext.Provider value={isRestored}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </CacheRestoredContext.Provider>
      {process.env.NODE_ENV === 'development' ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
