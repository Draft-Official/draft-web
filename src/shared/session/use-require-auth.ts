'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './auth-context';

interface UseRequireAuthOptions {
  redirectTo?: string;
  title?: string;
  description?: string;
}

interface UseRequireAuthReturn {
  requireAuth: () => boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  modalProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    redirectTo?: string;
    title?: string;
    description?: string;
  };
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}): UseRequireAuthReturn {
  const { redirectTo, title, description } = options;
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const requireAuth = useCallback(() => {
    if (isLoading) return false;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return false;
    }

    return true;
  }, [isAuthenticated, isLoading]);

  return {
    requireAuth,
    showLoginModal,
    setShowLoginModal,
    modalProps: {
      open: showLoginModal,
      onOpenChange: setShowLoginModal,
      redirectTo,
      title,
      description,
    },
    isLoading,
    isAuthenticated,
  };
}
