'use client';

/**
 * AuthGuard
 * 인증이 필요한 컴포넌트를 감싸는 래퍼
 */
import React from 'react';
import { useAuth } from '@/shared/session';

interface AuthGuardProps {
  children: React.ReactNode;
  /** 로딩 중 표시할 컴포넌트 */
  fallback?: React.ReactNode;
  /** 미인증 시 표시할 컴포넌트 */
  unauthenticated?: React.ReactNode;
}

/**
 * 인증 상태에 따라 자식 컴포넌트 렌더링 제어
 *
 * @example
 * <AuthGuard fallback={<Spinner />} unauthenticated={<LoginPrompt />}>
 *   <ProtectedContent />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  fallback = null,
  unauthenticated = null,
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!isAuthenticated) {
    return <>{unauthenticated}</>;
  }

  return <>{children}</>;
}
