import { useState, useEffect } from 'react';

/**
 * Hook to detect scroll direction with hysteresis
 * Returns true if scrolled down (should hide elements)
 * Returns false if scrolled up (should show elements)
 */
export const useScrollDirection = () => {
  const [isScrolledDown, setIsScrolledDown] = useState(false);

  useEffect(() => {
    // Thresholds to prevent flickering
    const SCROLL_DOWN_THRESHOLD = 60; // Scrolling down past this hides header/nav
    const SCROLL_UP_THRESHOLD = 20;   // Scrolling up below this shows header/nav
    let lastScrollY = window.scrollY;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;
      const direction = scrollY > lastScrollY ? 'down' : 'up';

      // Only update state if significantly changed to avoid jitter
      if (!isScrolledDown && scrollY > SCROLL_DOWN_THRESHOLD && direction === 'down') {
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
  }, [isScrolledDown]);

  return isScrolledDown;
};
