'use client';

import { useState, useEffect } from 'react';

const MOBILE_UA_REGEX =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(MOBILE_UA_REGEX.test(navigator.userAgent));
  }, []);

  return isMobile;
}
