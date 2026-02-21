/**
 * React Query 클라이언트 설정
 *
 * 기본 옵션:
 * - staleTime: 1분 (데이터가 fresh 상태로 유지되는 시간)
 * - gcTime: 5분 (사용하지 않는 캐시가 메모리에서 유지되는 시간)
 * - retry: 1 (실패 시 1회 재시도)
 * - refetchOnWindowFocus: false (윈도우 포커스 시 자동 refetch 비활성화)
 */
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from '@/shared/ui/shadcn/sonner';
import { AuthError, AppError, NotFoundError } from '@/shared/lib/errors';

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // 인증 에러는 별도 처리 (AuthProvider에서 처리)
        if (error instanceof AuthError) {
          window.dispatchEvent(new CustomEvent('auth:error'));
          return;
        }

        // 404는 조용히 처리 (UI에서 빈 상태 표시)
        if (error instanceof NotFoundError) {
          return;
        }

        // meta.showError가 false면 토스트 표시 안함
        if (query.meta?.showError === false) {
          return;
        }

        // 사용자에게 에러 표시
        const message =
          error instanceof AppError
            ? error.message
            : '오류가 발생했습니다. 다시 시도해주세요.';
        toast.error(message);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        // 개별 mutation에 onError가 있으면 글로벌 토스트 생략 (중복 방지)
        if (mutation.options.onError) return;

        const message =
          error instanceof AppError
            ? error.message
            : '작업 중 오류가 발생했습니다.';
        toast.error(message);
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        gcTime: 5 * 60 * 1000, // 5분 (v5에서 cacheTime -> gcTime)
        retry: (failureCount, error) => {
          // 인증 에러나 404는 재시도 안함
          if (error instanceof AuthError) return false;
          if (error instanceof NotFoundError) return false;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

// 클라이언트 사이드 싱글톤
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Query Client 가져오기
 * - 서버: 매번 새 인스턴스 생성
 * - 클라이언트: 싱글톤 사용
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // 서버: 항상 새 QueryClient 생성
    return makeQueryClient();
  } else {
    // 브라우저: 싱글톤 사용
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
