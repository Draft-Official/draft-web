# Changelog

> 주요 마일스톤만 기록합니다. 전체 커밋 이력은 `git log` 참조

---

## [2026-01-10] Phase 2 준비 완료

### 보안 강화
- **Kakao API 키 서버사이드 마이그레이션**
  - 파일: `app/api/search-places/route.ts` (신규)
  - 변경: `NEXT_PUBLIC_KAKAO_REST_API_KEY` → `KAKAO_REST_API_KEY` (클라이언트 노출 방지)
  - 클라이언트: `src/shared/api/kakao-map.ts`에서 `/api/search-places` 호출

- **보안 헤더 설정**
  - 파일: `next.config.ts`
  - 추가: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, X-XSS-Protection

### 입력 검증 (Zod)
- **Match Create 폼 검증**
  - 파일: `src/features/match/create/model/schema.ts` (신규)
  - 13개 검증 규칙: 날짜, 시간, 장소, 가격, 포지션, 매치 타입, 성별, 레벨 등
  - 통합: `match-create-view.tsx`에서 `safeParse()` 사용 (비침습적 방식)

### 타입 시스템 통합 (Phase 2 확장성 준수)
- **공통 타입 파일 생성**
  - 파일: `src/shared/types/match.ts` (신규)
  - Enum: `MatchType`, `MatchStatus`, `ApplicantStatus`
  - 인터페이스:
    - `Location` (latitude, longitude 포함 - 카풀/검색용)
    - `PriceInfo` (base + modifiers 구조 - 가격 옵션 확장 가능)
    - `BaseMatch`, `HostDashboardMatch`, `GuestListMatch`
  - 설계 원칙: JSONB 스타일 facilities 필드 (하드코딩 제거)

- **타입 마이그레이션 완료**
  - Host Feature: `src/features/host/model/types.ts`에서 공통 타입 import
  - Match Feature: `parking`, `shower` 개별 필드 → `facilities: { parking: 'free', shower: true }` 형식으로 변경
  - 모든 모크 데이터 업데이트 완료

### 커밋 이력
총 9개 커밋 (기능 6개 + 보안/검증 3개):
1. 추가(ui): shadcn/ui 컴포넌트 4개 추가
2. 기능(host): Host Dashboard 타입 및 인터페이스 정의
3. 기능(host): Host Dashboard 테스트용 모크 데이터 추가
4. 기능(host): Host Dashboard 종합 UI 구현 (신청자 관리 포함)
5. 기능(pages): Schedule, Team 페이지 라우트 추가
6. 문서(docs): Figma-to-Code 구현 가이드 추가
7. 보안(api): Kakao API 키 서버사이드 마이그레이션 + 보안 헤더 설정
8. 기능(validation): Match Create 폼에 Zod 검증 추가
9. 리팩터링(types): 공통 타입 시스템으로 마이그레이션 (Phase 2 확장성 준수)

### 아키텍처 평가

**종합 점수: 8.9/10** (보안 강화 후)

| 영역 | 점수 | 평가 |
|-----|------|------|
| 확장성 | 8.5/10 | FSD 구조 탁월, API 레이어 Phase 2에 추가 예정 |
| 유지보수성 | 8.5/10 | 타입 통합 완료, 문서화 우수, 테스트 인프라 부재 |
| 성능 | 8.0/10 | 현재 최적, 스케일 대비 페이지네이션 필요 |
| 보안 | 9.5/10 | API 키 보호 ✓, 보안 헤더 ✓, 입력 검증 ✓ |

**강점:**
- Feature-Sliced Design 올바르게 구현
- TypeScript strict mode, `any` 타입 0개
- 탁월한 문서화 (ARCHITECTURE.md, CLAUDE.md, FIGMA_TO_CODE.md)
- Phase 2 확장성 준비 완료

**개선 권장사항:**
- Phase 2: Supabase + React Query 통합
- 테스트 인프라 구축 (Vitest + React Testing Library)
- API 레이어 스켈레톤 추가 (`src/features/*/api/`)

### 주요 파일 위치

**타입 정의:**
- 공통 타입: `src/shared/types/match.ts`
- Host Feature: `src/features/host/model/types.ts`
- Match Feature: `src/features/match/model/mock-data.ts`

**검증 스키마:**
- Match Create: `src/features/match/create/model/schema.ts`

**API 관련:**
- Kakao Maps: `app/api/search-places/route.ts` (서버), `src/shared/api/kakao-map.ts` (클라이언트)

**모크 데이터:**
- Host Dashboard: `src/features/host/model/mock-data.ts`
- Match List: `src/features/match/model/mock-data.ts`

**주요 UI:**
- Host Dashboard: `src/features/host/ui/host-dashboard-view.tsx` (547줄)
- Match Create: `src/features/match/create/ui/match-create-view.tsx`

### 팀 확장 준비도

**1명 → 2-3명:** ✅ 즉시 가능 (Feature 단위 분업)
**1명 → 5명+:** ⚠️ 테스트 + CI/CD 필요

**확장 경로:**
- 1K 사용자: 현재 아키텍처로 충분
- 10K 사용자: React Query + Supabase
- 100K 사용자: DB 최적화 + CDN + Edge Functions

---

**Last Updated**: 2026-01-14
**Maintainer**: @beom
**Project**: Draft - 농구 용병 모집 플랫폼
