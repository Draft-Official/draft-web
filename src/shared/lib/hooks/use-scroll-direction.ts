import { useState, useEffect } from 'react';

interface UseScrollDirectionOptions {
  /** Threshold to trigger hide when scrolling down (default: 60) */
  scrollDownThreshold?: number;
  /** Threshold to trigger show when scrolling up (default: 20) */
  scrollUpThreshold?: number;
}

/**
 * Hook to detect scroll direction with hysteresis
 * Returns true if scrolled down (should hide elements)
 * Returns false if scrolled up (should show elements)
 */
export const useScrollDirection = (options: UseScrollDirectionOptions = {}) => {
  const {
    scrollDownThreshold = 60,
    scrollUpThreshold = 20,
  } = options;

  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      // Only update state if significantly changed to avoid jitter
      if (!isScrolledDown && scrollY > scrollDownThreshold && direction === 'down') {
        setIsScrolledDown(true);
      } else if (isScrolledDown && direction === 'up') {
        // Make showing a bit more sensitive/immediate when scrolling up
        setIsScrolledDown(false);
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    // Throttle slightly if needed, but rAF/passive listener is usually enough
    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [isScrolledDown, scrollDownThreshold, scrollUpThreshold]);

  return isScrolledDown;
};
