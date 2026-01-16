# Troubleshooting

## Supabase 쿼리가 실행되지 않는 문제 (2024-01)

### 증상
- Supabase 클라이언트 생성은 성공 (`supabase client: true`)
- 쿼리 실행 시 Promise가 영원히 pending 상태
- Network 탭에 Supabase 요청이 나타나지 않음
- 콘솔에 에러 없음

### 원인
`@supabase/ssr` 패키지가 Next.js 16 (canary)과 호환되지 않음

### 환경
- Next.js: 16.1.1
- @supabase/ssr: 0.8.0
- @supabase/supabase-js: 2.90.1

### 해결 방법
`@supabase/ssr`의 `createBrowserClient` 대신 `@supabase/supabase-js`의 `createClient`를 직접 사용

**변경 전 (src/lib/supabase/client.ts):**
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient<Database>(url, anonKey);
}
```

**변경 후:**
```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createClient() {
  return createSupabaseClient<Database>(url, anonKey);
}
```

### 참고
- `@supabase/ssr`은 SSR/SSG 환경에서 쿠키 기반 인증을 쉽게 처리하기 위한 래퍼
- 클라이언트 사이드에서는 `@supabase/supabase-js`를 직접 사용해도 문제없음
- Next.js stable 버전에서는 `@supabase/ssr`이 정상 작동할 수 있음
