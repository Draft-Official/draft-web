/**
 * 애플리케이션 에러 타입 정의
 *
 * 사용법:
 * - 서비스 레이어에서 구체적인 에러 throw
 * - React Query에서 에러 타입별 처리
 * - UI에서 사용자 친화적 메시지 표시
 */

/**
 * 기본 애플리케이션 에러
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 인증 필요 에러
 * 로그인이 필요한 작업 시 발생
 */
export class AuthError extends AppError {
  constructor(message: string = '로그인이 필요합니다') {
    super(message, 'AUTH_REQUIRED', 401);
    this.name = 'AuthError';
  }
}

/**
 * 리소스 없음 에러
 * 존재하지 않는 매치, 프로필 등 조회 시 발생
 */
export class NotFoundError extends AppError {
  constructor(resource: string = '리소스') {
    super(`${resource}를 찾을 수 없습니다`, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 유효성 검증 에러
 * 잘못된 입력값 등
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * 권한 없음 에러
 * 다른 사용자의 리소스 접근 시 발생
 */
export class PermissionError extends AppError {
  constructor(message: string = '권한이 없습니다') {
    super(message, 'PERMISSION_DENIED', 403);
    this.name = 'PermissionError';
  }
}

/**
 * 네트워크 에러
 * Supabase 연결 실패 등
 */
export class NetworkError extends AppError {
  constructor(message: string = '네트워크 오류가 발생했습니다') {
    super(message, 'NETWORK_ERROR', 503);
    this.name = 'NetworkError';
  }
}

/**
 * Supabase PostgrestError를 앱 에러로 변환
 */
export function handleSupabaseError(error: { code: string; message: string }, resource?: string): never {
  switch (error.code) {
    case 'PGRST116': // Row not found
      throw new NotFoundError(resource);
    case '42501': // RLS policy violation
      throw new PermissionError('해당 작업을 수행할 권한이 없습니다');
    case '23505': // Unique violation
      throw new ValidationError('이미 존재하는 데이터입니다');
    case '23503': // Foreign key violation
      throw new ValidationError('참조하는 데이터가 존재하지 않습니다');
    default:
      throw new AppError(error.message, error.code, 500);
  }
}
