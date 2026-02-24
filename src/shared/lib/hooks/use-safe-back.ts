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
    // window.history.length > 1: 이전 페이지가 있으면 back
    // 1이면 직접 진입(딥링크) → fallback으로 이동
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallbackPath);
    }
  }, [router, fallbackPath]);
}
