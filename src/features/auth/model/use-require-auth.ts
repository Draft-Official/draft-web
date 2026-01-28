'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './auth-context';

interface UseRequireAuthOptions {
  /** 로그인 후 리다이렉트할 경로 */
  redirectTo?: string;
  /** 모달 제목 */
  title?: string;
  /** 모달 설명 */
  description?: string;
}

interface UseRequireAuthReturn {
  /** 로그인 여부 확인 후 모달 표시. 로그인 되어있으면 true, 아니면 false 반환 */
  requireAuth: () => boolean;
  /** 모달 표시 여부 */
  showLoginModal: boolean;
  /** 모달 표시 여부 변경 */
  setShowLoginModal: (show: boolean) => void;
  /** 모달에 전달할 props */
  modalProps: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    redirectTo?: string;
    title?: string;
    description?: string;
  };
  /** 인증 상태 로딩 중 */
  isLoading: boolean;
  /** 로그인 되어있는지 */
  isAuthenticated: boolean;
}

/**
 * 로그인이 필요한 기능에서 사용하는 훅
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { requireAuth, modalProps } = useRequireAuth({
 *     redirectTo: '/my-page',
 *     description: '이 기능을 사용하려면 로그인이 필요합니다.',
 *   });
 *
 *   const handleClick = () => {
 *     if (!requireAuth()) return;
 *     // 로그인된 경우 실행할 코드
 *   };
 *
 *   return (
 *     <>
 *       <button onClick={handleClick}>버튼</button>
 *       <LoginRequiredModal {...modalProps} />
 *     </>
 *   );
 * }
 * ```
 */
export function useRequireAuth(options: UseRequireAuthOptions = {}): UseRequireAuthReturn {
  const { redirectTo, title, description } = options;
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const requireAuth = useCallback(() => {
    if (isLoading) {
      return false;
    }

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
