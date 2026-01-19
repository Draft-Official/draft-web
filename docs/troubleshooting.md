# Troubleshooting

## Supabase 쿼리가 실행되지 않는 문제 (2024-01)

### 증상
- Supabase 클라이언트 생성은 성공 (`supabase client: true`)
- 쿼리 실행 시 Promise가 영원히 pending 상태
- Network 탭에 Supabase 요청이 나타나지 않음
- 콘솔에 에러 없음

### 원인
`@supabase/ssr` 패키지가 Next.js 16 (canary)과 호환되지 않음

### 환경 (문제 발생 시)
- Next.js: 16.1.1
- @supabase/ssr: 0.8.0
- @supabase/supabase-js: 2.90.1

### 해결 방법
Next.js 15.5.9로 다운그레이드 (CVE-2025-66478 보안 패치 적용 버전)

```bash
npm install next@15.5.9 eslint-config-next@15.5.9
```

### 현재 안정 환경
- Next.js: **15.5.9**
- React: 19.2.3
- @supabase/ssr: 0.8.0
- @supabase/supabase-js: 2.90.1

### 참고
- Next.js 16.x는 아직 canary 버전으로 일부 패키지와 호환성 문제가 있음
- Next.js 15.5.9는 CVE-2025-66478 (RCE 취약점) 패치가 적용된 최신 안정 버전
- `@supabase/ssr`은 Next.js 15.x에서 정상 작동

---

## 중복 쿠키로 인한 인증 오류

### 증상
- 쿼리가 pending 상태로 멈춤
- 콘솔에 `AbortError: signal is aborted without reason` 에러
- Network 탭에 Supabase 요청이 없음

### 원인
브라우저에 동일한 이름의 Supabase 인증 쿠키가 중복 저장됨

### 해결 방법
1. 개발자 도구 → Application → Cookies → localhost
2. Supabase 관련 쿠키 모두 삭제 (특히 중복된 쿠키)
3. 페이지 새로고침 (Cmd+Shift+R / Ctrl+Shift+R)
