/**
 * API Logger - REST API 요청/응답 로깅 유틸리티
 *
 * 개발 환경에서만 동작하며, Kakao API 관련 요청은 제외합니다.
 */

const isDev = process.env.NODE_ENV === 'development';

// 제외할 API 패턴
const EXCLUDED_PATTERNS = [
  /kakao/i,
  /dapi\.kakao\.com/i,
];

function shouldLog(context: string): boolean {
  if (!isDev) return false;
  return !EXCLUDED_PATTERNS.some(pattern => pattern.test(context));
}

function formatData(data: unknown): string {
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

/**
 * API 요청 로깅
 */
export function logRequest(
  service: string,
  method: string,
  data?: unknown
): void {
  if (!shouldLog(service)) return;

  console.group(`🔵 [${service}] ${method}`);
  if (data !== undefined) {
    console.log('📤 Request:', formatData(data));
  }
  console.groupEnd();
}

/**
 * API 응답 로깅
 */
export function logResponse(
  service: string,
  method: string,
  data?: unknown,
  error?: unknown
): void {
  if (!shouldLog(service)) return;

  if (error) {
    console.group(`🔴 [${service}] ${method} - ERROR`);
    console.error('❌ Error:', formatData(error));
    console.groupEnd();
  } else {
    console.group(`🟢 [${service}] ${method} - SUCCESS`);
    if (data !== undefined) {
      console.log('📥 Response:', formatData(data));
    }
    console.groupEnd();
  }
}

/**
 * Supabase 쿼리 로깅 (테이블, 작업, 데이터)
 */
export function logSupabaseQuery(
  table: string,
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'UPSERT',
  data?: unknown,
  filters?: Record<string, unknown>
): void {
  if (!isDev) return;

  console.group(`🗄️ [Supabase] ${operation} ${table}`);
  if (filters && Object.keys(filters).length > 0) {
    console.log('🔍 Filters:', formatData(filters));
  }
  if (data !== undefined) {
    console.log('📦 Data:', formatData(data));
  }
  console.groupEnd();
}

// PGRST116: 결과가 0개일 때 발생 (single() 사용 시)
const NOT_FOUND_ERROR_CODE = 'PGRST116';

function isNotFoundError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code: string }).code === NOT_FOUND_ERROR_CODE;
  }
  return false;
}

/**
 * Supabase 쿼리 결과 로깅
 */
export function logSupabaseResult(
  table: string,
  operation: string,
  result?: unknown,
  error?: unknown
): void {
  if (!isDev) return;

  if (error) {
    // "NOT FOUND"는 정상적인 경우 (upsert에서 기존 레코드 없음)
    if (isNotFoundError(error)) {
      console.log(`⚪ [Supabase] ${operation} ${table} - NOT FOUND`);
    } else {
      console.group(`🔴 [Supabase] ${operation} ${table} - ERROR`);
      console.error('❌ Error:', formatData(error));
      console.groupEnd();
    }
  } else {
    console.group(`🟢 [Supabase] ${operation} ${table} - SUCCESS`);
    if (result !== undefined) {
      console.log('📥 Result:', formatData(result));
    }
    console.groupEnd();
  }
}
