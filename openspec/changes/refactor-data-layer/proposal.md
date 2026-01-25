# Change: Data Layer Refactoring - Schema & Interface Unification

## Why

현재 데이터베이스 스키마와 TypeScript 인터페이스가 분산되어 SSOT가 부재하고, "이 타입 어디있지?"라는 질문에 즉답이 불가능합니다.

**핵심 문제:**
1. **SSOT 부재**: 같은 데이터에 대해 여러 인터페이스 존재
2. **필드명 불일치**: DB `real_name` vs 클라이언트 `nickname`
3. **불필요한 중복**: `account_bank/number/holder`가 3개 테이블에 반복
4. **타입 안전성 부족**: role, status 등이 string으로 관리

## What Changes

### 1. Database Schema 변경

**JSONB 필드 통일:**
```
users.operation_info      ← (기존: host_info 제안 → operation_info로 통일)
teams.operation_info      ← (기존 유지)
matches.operation_info    ← (기존: host_info → operation_info로 통일)
```

**Users**
- `real_name` → `full_name`
- `avatar_url` → `profile_url`
- `positions[]` → `position` (단일 값)
- 계좌 → `account_info` JSONB
- `contact_type`, `kakao_url`, `host_notice` → `operation_info` JSONB

**Teams**
- `region_depth1/2` → `region`
- `regular_schedule` → `regular_schedules` (JSONB Array)
- 계좌 → `account_info` JSONB
- `contact_link`, `host_notice` → `operation_info` JSONB

**Matches**
- `contact_type`, `contact_content`, `host_notice` → `operation_info` JSONB
- `match_options` → `match_rule` (필드명 + 내용 유지)
- `current_players_count` → `recruitment_count` JSONB
- `gym_*` 비정규화 필드 삭제
- `match_format` enum 추가

**Applications**
- Status: `CANCELED` 삭제 → `NOT_ATTENDING`
- 추가: `PAYMENT_PENDING`, `LATE`, `NOT_ATTENDING`
- `team_id`, `approved_at` 삭제

### 2. TypeScript Interface 구조화

```
shared/types/
├── database.types.ts  # Supabase CLI 자동생성
└── jsonb.types.ts     # JSONB 필드 인터페이스 (OperationInfo, AccountInfo 등)

shared/config/
└── constants.ts       # Enum 값, 라벨, 스타일 (SSOT)

features/{feature}/model/
└── types.ts           # Feature UI 전용 타입 (DB 타입 확장)
```

### 3. 필드 매핑 정리

| DB (snake_case) | Client (camelCase) | 비고 |
|-----------------|-------------------|------|
| `operation_info` | `operationInfo` | 모든 테이블 동일 |
| `match_rule` | `matchRule` | 기존 `match_options` → `matchOptions` |
| `recruitment_count` | `recruitmentCount` | 기존 `current_recruitment_status` |
| `account_info` | `accountInfo` | 모든 테이블 동일 |

## Impact Analysis

### 영향받는 파일 수: ~45개

**Core Type Files (5개)**
- `shared/types/database.types.ts` - 전면 재작성
- `shared/types/match.ts` - 삭제
- `shared/config/match-constants.ts` → `constants.ts`
- `features/match/model/types.ts` - 재작성
- `features/match-create/model/types.ts` - 재작성

**Mapper Files (3개) - High Priority**
- `features/match-create/api/match-create-mapper.ts` - Form → DB
- `features/match/api/match-mapper.ts` - DB → UI
- `features/schedule/lib/mappers.ts`

**Match Create Feature (8개)**
- `match-create-api.ts`, `match-create-view.tsx`
- `match-create-operations.tsx` (hostNotice, contactType 사용)
- `match-create-game-format.tsx`, `match-create-specs.tsx`
- `schema.ts`, `use-recent-match-prefill.ts`
- `match-to-prefill-mapper.ts`

**Match Display Feature (10개)**
- `match-detail-view.tsx`, `match-api.ts`, `queries.ts`
- `match-rule-section.tsx` (matchOptions → matchRule)
- `host-section.tsx` (hostNotice → operationInfo.notice)
- `recruitment-status.tsx`, `match-info-section.tsx`
- `facility-section.tsx`, `bottom-bar.tsx`, `hero-section.tsx`

**Auth/User Feature (4개)**
- `auth-api.ts` (default_contact_type → operation_info)
- `mutations.ts`, `auth-context.tsx`, `types.ts`

**Schedule/Application Feature (6개)**
- `schedule/mutations.ts`, `host-match-detail-view.tsx`
- `application-api.ts`, `apply-modal.tsx`, `mutations.ts`

**Team Feature (2개)**
- `team-api.ts`, `team/model/types.ts`

**Page Routes (3개)**
- `matches/[id]/page.tsx`, `page.tsx`, `my/page.tsx`

## Migration Strategy

### Phase 1: Type Foundation (DB 변경 없이)
1. `shared/types/jsonb.types.ts` 생성 (OperationInfo, AccountInfo 등)
2. `shared/config/constants.ts` 통합
3. `database.types.ts` 새 스키마 반영 (아직 DB는 안 바꿈)

### Phase 2: Mapper & API Layer
1. Mapper 함수들 새 타입 사용
2. 필드명 변환 로직 추가 (하위 호환)
3. API 함수 시그니처 업데이트

### Phase 3: UI Components
1. Match Create UI (operation_info 사용)
2. Match Detail UI (matchRule 사용)
3. Auth/Profile UI (operation_info 사용)

### Phase 4: Database Migration
1. 새 스키마로 테이블 변경
2. 데이터 마이그레이션 (JSONB 통합)
3. 하위 호환 로직 제거

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| 대규모 변경 | High | Phase 분리, 점진적 적용 |
| 타입 불일치 | Medium | TypeScript 컴파일러가 검출 |
| 런타임 에러 | Medium | 각 Phase 완료 후 수동 테스트 |
