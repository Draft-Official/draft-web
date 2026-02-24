'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 폼 이탈 방지 guard hook.
 * isDirty가 true일 때 뒤로가기(버튼 클릭 + 브라우저/모바일 back) 시
 * 확인 다이얼로그를 표시하고, false면 즉시 이동한다.
 */
export function useLeaveGuard(isDirty: boolean) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const isDirtyRef = useRef(isDirty);
  const isLeavingRef = useRef(false);
  const hasDummyRef = useRef(false);

  isDirtyRef.current = isDirty;

  // 브라우저 뒤로가기(popstate) 가로채기
  useEffect(() => {
    if (!isDirty) return;

    // dummy history entry를 push해서 뒤로가기 시 popstate를 잡을 수 있게 함
    window.history.pushState({ leaveGuard: true }, '');
    hasDummyRef.current = true;

    const handlePopState = () => {
      // confirmLeave에서 나가는 중이면 무시
      if (isLeavingRef.current) return;

      if (isDirtyRef.current) {
        // dummy를 다시 push해서 현재 페이지에 머물게 함
        window.history.pushState({ leaveGuard: true }, '');
        hasDummyRef.current = true;
        setShowDialog(true);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty]);

  // X 버튼 등 UI에서 호출
  const requestLeave = useCallback(() => {
    if (isDirtyRef.current) {
      setShowDialog(true);
    } else {
      router.back();
    }
  }, [router]);

  // 다이얼로그에서 "나가기" 확인
  const confirmLeave = useCallback(() => {
    setShowDialog(false);
    isLeavingRef.current = true;

    if (hasDummyRef.current) {
      // dummy state가 있으므로 2번 back (dummy + 현재 페이지)
      window.history.go(-2);
    } else {
      router.back();
    }
  }, [router]);

  /**
   * 폼 저장 완료 등 "정상 이탈" 시 사용.
   * leaveGuard dummy history가 있으면 먼저 1칸 정리한 뒤 목적지 이동을 실행한다.
   */
  const bypassNavigation = useCallback((navigate: () => void) => {
    setShowDialog(false);
    isLeavingRef.current = true;

    if (!hasDummyRef.current) {
      navigate();
      return;
    }

    const handleBypassPopState = () => {
      window.removeEventListener('popstate', handleBypassPopState);
      hasDummyRef.current = false;
      navigate();
    };

    window.addEventListener('popstate', handleBypassPopState, { once: true });
    window.history.go(-1);
  }, []);

  // 다이얼로그에서 "취소"
  const cancelLeave = useCallback(() => {
    setShowDialog(false);
  }, []);

  return { showDialog, requestLeave, confirmLeave, cancelLeave, bypassNavigation };
}
