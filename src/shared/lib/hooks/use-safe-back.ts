'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Safe back navigation hook with fallback route
 *
 * Checks if browser history exists before navigating back.
 * If no history (e.g., deep link from external source), navigates to fallback route.
 *
 * @param fallbackPath - Route to navigate to if no history exists
 * @returns Function to trigger safe back navigation
 *
 * @example
 * ```tsx
 * const handleBack = useSafeBack('/team');
 * <button onClick={handleBack}>Back</button>
 * ```
 */
export function useSafeBack(fallbackPath: string): () => void {
  const router = useRouter();

  return useCallback(() => {
    // Check if browser history exists
    // Next.js uses window.history.state.idx to track history index
    const hasHistory = window.history.state?.idx > 0;

    if (hasHistory) {
      // Has history: use browser back
      router.back();
    } else {
      // No history (deep link): navigate to fallback
      // Use replace to avoid adding to history
      router.replace(fallbackPath);
    }
  }, [router, fallbackPath]);
}
