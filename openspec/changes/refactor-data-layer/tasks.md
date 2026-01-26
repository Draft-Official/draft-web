# Tasks: Data Layer Refactoring

## Phase 1: Type Foundation

### 1.1 JSONB 타입 파일 생성
- [ ] Create `shared/types/jsonb.types.ts`
  - `OperationInfo` (users, teams, matches 공통)
  - `AccountInfo` (users, teams, matches 공통)
  - `RecruitmentSetup` (matches)
  - `MatchRule` (matches) ← 기존 `MatchOptionsUI`
  - `RecruitmentCount` (matches)
  - `GymFacilities` (gyms)
  - `Participant` (applications)
  - `RegularSchedule` (teams)
  - `Requirements` (matches)

### 1.2 Constants 통합
- [ ] Rename `shared/config/match-constants.ts` → `constants.ts`
- [ ] Add enums from `shared/types/match.ts`:
  - `MATCH_TYPE_VALUES` + `MATCH_TYPE_LABELS` (MatchType enum)
  - `MATCH_STATUS_VALUES` + `MATCH_STATUS_LABELS` (MatchStatus enum)
  - `APPLICATION_STATUS_VALUES` + `APPLICATION_STATUS_LABELS` (새 status)

### 1.3 shared/types/match.ts 마이그레이션
- [ ] Move `MatchType` enum → `constants.ts` as VALUES/LABELS
- [ ] Move `MatchStatus` enum → `constants.ts` as VALUES/LABELS
- [ ] Move `ApplicantStatus` enum → `constants.ts` as VALUES/LABELS (새 값으로 변경)
- [ ] Move `MatchOptionsUI` → `jsonb.types.ts` as `MatchRule`
- [ ] Move `Location`, `PriceInfo`, `PositionStatus` → `features/match/model/types.ts`
- [ ] Move `BaseMatch`, `GuestListMatch`, `HostDashboardMatch` → `features/match/model/types.ts`
- [ ] Move `Applicant` → `features/application/model/types.ts`
- [ ] Move `Team` → `features/team/model/types.ts`
- [ ] Delete `shared/types/match.ts`

### 1.4 Database Types 업데이트
- [ ] Update `shared/types/database.types.ts`:
  - Users: `full_name`, `profile_url`, `position`, `operation_info`, `account_info`
  - Teams: `region`, `regular_schedules`, `operation_info`, `account_info`
  - Matches: `operation_info`, `account_info`, `match_rule`, `recruitment_count`
  - Applications: 새 status enum, `participants` (기존 `participants_info`)
  - TeamMembers: `team_role_enum`, `team_member_status_enum`

---

## Phase 2: Mapper & API Layer

### 2.1 Match Create Mapper (Form → DB)
- [ ] `features/match-create/api/match-create-mapper.ts`:
  - `contactType` + `hostNotice` → `operation_info`
  - `matchOptions` → `match_rule`
  - Account fields → `account_info`

### 2.2 Match Display Mapper (DB → UI)
- [ ] `features/match/api/match-mapper.ts`:
  - `operation_info` → `operationInfo`
  - `match_rule` → `matchRule`
  - Update all field transformations

### 2.3 Other Mappers
- [ ] `features/match-create/mappers/match-to-prefill-mapper.ts` - 새 필드 구조
- [ ] `features/schedule/lib/mappers.ts` - Match 필드 변경

### 2.4 API Functions
- [ ] `features/match/api/match-api.ts` - 쿼리 필드 변경
- [ ] `features/match-create/api/match-create-api.ts` - Insert 필드 변경
- [ ] `features/auth/api/auth-api.ts` - User 필드 변경 (operation_info)
- [ ] `features/team/api/team-api.ts` - Team 필드 변경 (operation_info)
- [ ] `features/application/api/application-api.ts` - 새 status enum

---

## Phase 3: Feature Types

**규칙: UI 전용 타입은 `TypeNameUI` 형식으로 네이밍**
- DB 타입과 구분하기 위해 UI 타입에는 `UI` suffix 추가
- 예: `GymFacilitiesUI`, `MatchRuleUI`, `MatchOptionsUI`

### 3.1 Match Feature
- [ ] `features/match/model/types.ts`:
  - Import from `database.types.ts` 사용
  - `GuestListMatch` extends `Pick<Match, ...>`
  - `MatchCardData` extends `Pick<Match, ...>`
  - `MatchDetailData` extends `Match`

### 3.2 Match Create Feature
- [ ] `features/match-create/model/types.ts`:
  - `LocationData` 유지 (Kakao API용)
  - `GymFacilities` import from `jsonb.types.ts`
- [ ] `features/match-create/model/schema.ts`:
  - Import VALUES from `constants.ts`
  - Update field names

### 3.3 Auth Feature
- [ ] `features/auth/model/types.ts`:
  - User 타입 변경 반영

### 3.4 Team Feature
- [ ] `features/team/model/types.ts`:
  - Team 타입 변경 반영

### 3.5 Application Feature
- [ ] `features/application/model/types.ts` (생성 필요시):
  - `Applicant` interface 정의

---

## Phase 4: UI Components

### 4.1 Match Create UI (8개 파일)
- [ ] `match-create-view.tsx` - hostNotice, contactType → operationInfo
- [ ] `match-create-operations.tsx` - 필드명 변경
- [ ] `match-create-game-format.tsx` - matchOptions → matchRule
- [ ] `match-create-specs.tsx` - 타입 import 변경
- [ ] `use-recent-match-prefill.ts` - 새 필드 구조

### 4.2 Match Detail UI (10개 파일)
- [ ] `match-detail-view.tsx` - 타입 변경
- [ ] `match-rule-section.tsx` - matchOptions → matchRule
- [ ] `host-section.tsx` - hostNotice → operationInfo.notice
- [ ] `recruitment-status.tsx` - 타입 변경
- [ ] `match-info-section.tsx` - 타입 변경
- [ ] `facility-section.tsx` - 타입 변경
- [ ] `bottom-bar.tsx` - 타입 변경
- [ ] `hero-section.tsx` - 타입 변경
- [ ] `detail-filter-modal.tsx` - 타입 import 변경

### 4.3 Auth/Profile UI (4개 파일)
- [ ] `auth-context.tsx` - User 타입 변경
- [ ] `profile-setup-modal.tsx` - 필드 변경

### 4.4 Schedule UI
- [ ] `host-match-detail-view.tsx` - Match 타입 변경

### 4.5 Application UI
- [ ] `apply-modal.tsx` - 타입 import 변경

---

## Phase 5: Database Migration (Deferred)

### 5.1 SQL Migration
- [ ] Users 테이블 변경
- [ ] Teams 테이블 변경
- [ ] Matches 테이블 변경
- [ ] Applications 테이블 변경

### 5.2 Data Migration
- [ ] 기존 필드 → JSONB 통합 스크립트
- [ ] CANCELED → NOT_ATTENDING 변환

### 5.3 Post-Migration
- [ ] `supabase gen types typescript` 실행
- [ ] RLS 정책 업데이트
- [ ] 하위 호환 코드 제거

---

## Phase 6: Verification

- [ ] `npm run build` - TypeScript 에러 확인
- [ ] Match 리스트 페이지 테스트
- [ ] Match 상세 페이지 테스트
- [ ] Match 생성 플로우 테스트
- [ ] 신청 플로우 테스트
- [ ] 프로필 설정 테스트
