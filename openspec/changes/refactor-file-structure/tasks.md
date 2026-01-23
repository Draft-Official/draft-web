# Tasks: File Structure Refactor

> **원칙**: 이동 → 참조수정 → 빌드확인 → 삭제 (순서 엄수)

## Phase 1: Dead Code 제거 및 Feature Rename (가장 안전)

### 1.1 Dead Code 제거
- [ ] 1.1.1 `src/app/providers.tsx`에서 MatchProvider import 및 사용 제거
- [ ] 1.1.2 `npm run build` 확인
- [ ] 1.1.3 `src/entities/` 폴더 전체 삭제
- [ ] 1.1.4 `grep -r "entities" src/` 잔여 참조 확인
- [ ] 1.1.5 `npm run build` 확인

### 1.2 Feature Rename
- [ ] 1.2.1 `src/features/match-management/` → `src/features/schedule/` 폴더 이름 변경 (VS Code F2)
- [ ] 1.2.2 `cmd+shift+f`로 `match-management` 검색 후 `schedule`로 변경
- [ ] 1.2.3 `npm run build` 확인
- [ ] 1.2.4 `src/features/host/` → `src/features/team/` 폴더 이름 변경 (VS Code F2)
- [ ] 1.2.5 `cmd+shift+f`로 `features/host` 검색 후 `features/team`으로 변경
- [ ] 1.2.6 `npm run build` 확인

## Phase 2: Shared UI 정립

### 2.1 Layout 이동
- [ ] 2.1.1 `src/shared/ui/layout/` 폴더 생성
- [ ] 2.1.2 `src/widgets/header.tsx` → `src/shared/ui/layout/header.tsx` 이동
- [ ] 2.1.3 `src/widgets/navigation/ui/bottom-nav.tsx` → `src/shared/ui/layout/bottom-nav.tsx` 이동
- [ ] 2.1.4 `src/widgets/navigation/ui/sidebar.tsx` → `src/shared/ui/layout/sidebar.tsx` 이동
- [ ] 2.1.5 `cmd+shift+f`로 `@/widgets` 검색 후 `@/shared/ui/layout`으로 변경
- [ ] 2.1.6 `npm run build` 확인
- [ ] 2.1.7 빈 `src/widgets/` 폴더 삭제

### 2.2 Base UI 이동
- [ ] 2.2.1 `src/shared/ui/base/` 폴더 생성
- [ ] 2.2.2 `src/components/ui/*` 전체 → `src/shared/ui/base/` 이동
- [ ] 2.2.3 `cmd+shift+f`로 `@/components/ui` 검색 후 `@/shared/ui/base`으로 변경
- [ ] 2.2.4 `npm run build` 확인
- [ ] 2.2.5 빈 `src/components/` 폴더 삭제

## Phase 3: Infrastructure 통합

- [ ] 3.1 `src/shared/api/supabase/` 폴더 생성
- [ ] 3.2 `src/lib/supabase/*` → `src/shared/api/supabase/` 이동
- [ ] 3.3 `src/shared/lib/query-client.ts` → `src/shared/api/query-client.ts` 이동
- [ ] 3.4 `cmd+shift+f`로 `@/lib/supabase` 검색 후 `@/shared/api/supabase`으로 변경
- [ ] 3.5 `cmd+shift+f`로 `shared/lib/query-client` 검색 후 `shared/api/query-client`으로 변경
- [ ] 3.6 `npm run build` 확인
- [ ] 3.7 빈 `src/lib/` 폴더 삭제

## Phase 4: Services → Features 이동

### 4.1 Auth Service
- [ ] 4.1.1 `src/features/auth/api/hooks/` 폴더 생성
- [ ] 4.1.2 기존 `src/features/auth/api/queries.ts` → `src/features/auth/api/hooks/queries.ts` 이동
- [ ] 4.1.3 기존 `src/features/auth/api/mutations.ts` → `src/features/auth/api/hooks/mutations.ts` 이동
- [ ] 4.1.4 기존 `src/features/auth/api/keys.ts` → `src/features/auth/api/hooks/keys.ts` 이동
- [ ] 4.1.5 `src/services/auth/auth.service.ts` → `src/features/auth/api/auth-api.ts` 이동 및 리네임
- [ ] 4.1.6 import 경로 수정 (`@/services/auth` → `@/features/auth/api`)
- [ ] 4.1.7 `npm run build` 확인

### 4.2 Match Service
- [ ] 4.2.1 `src/features/match/api/hooks/` 폴더 생성
- [ ] 4.2.2 기존 hooks 파일들 → `src/features/match/api/hooks/` 이동
- [ ] 4.2.3 `src/services/match/match.service.ts` → `src/features/match/api/match-api.ts` 이동 및 리네임
- [ ] 4.2.4 `src/services/match/match.mapper.ts` → `src/features/match/api/match-mapper.ts` 이동 및 리네임
- [ ] 4.2.5 import 경로 수정
- [ ] 4.2.6 `npm run build` 확인

### 4.3 Application Service
- [ ] 4.3.1 `src/features/application/api/hooks/` 폴더 생성
- [ ] 4.3.2 기존 hooks 파일들 → hooks/ 이동
- [ ] 4.3.3 `src/services/application/application.service.ts` → `src/features/application/api/application-api.ts` 이동 및 리네임
- [ ] 4.3.4 import 경로 수정
- [ ] 4.3.5 `npm run build` 확인

### 4.4 Team Service 이동
- [ ] 4.4.1 `src/features/team/api/hooks/` 폴더 생성 (이미 team feature 존재)
- [ ] 4.4.2 `src/services/team/team.service.ts` → `src/features/team/api/team-api.ts` 이동 및 리네임
- [ ] 4.4.3 import 경로 수정
- [ ] 4.4.4 `npm run build` 확인

### 4.5 Schedule Service 이동
- [ ] 4.5.1 `src/features/schedule/api/hooks/` 폴더 생성 (이미 schedule feature 존재)
- [ ] 4.5.2 기존 hooks 파일들 → hooks/ 이동 (있다면)
- [ ] 4.5.3 관련 service 파일이 있다면 `src/features/schedule/api/` 하위로 이동
- [ ] 4.5.4 import 경로 수정
- [ ] 4.5.5 `npm run build` 확인

### 4.6 Gym Service (Shared)
- [ ] 4.6.1 `src/services/gym/gym.service.ts` → `src/shared/api/gym-api.ts` 이동 및 리네임
- [ ] 4.6.2 import 경로 수정
- [ ] 4.6.3 `npm run build` 확인

### 4.7 Services 폴더 정리
- [ ] 4.7.1 `grep -r "@/services" src/` 잔여 참조 확인
- [ ] 4.7.2 `src/services/index.ts` 삭제 또는 이동
- [ ] 4.7.3 빈 `src/services/` 폴더 삭제
- [ ] 4.7.4 `npm run build` 확인

## Phase 5: 파일명 정규화 (kebab-case)

- [ ] 5.1 PascalCase 파일 검색: `find src -name "*.tsx" | grep -E "[A-Z]"`
- [ ] 5.2 각 파일 리네임 (VS Code에서 F2 사용 권장)
  - [ ] `AuthGuard.tsx` → `auth-guard.tsx`
  - [ ] `ApplyModal.tsx` → `apply-modal.tsx`
  - [ ] `MatchCard.tsx` → `match-card.tsx`
  - [ ] `FilterDropdown.tsx` → `filter-dropdown.tsx`
  - [ ] `ProfileCard.tsx` → `profile-card.tsx`
  - [ ] `ProfileSetupModal.tsx` → `profile-setup-modal.tsx`
  - [ ] `SkillSlider.tsx` → `skill-slider.tsx`
  - [ ] (추가 파일들...)
- [ ] 5.3 `npm run build` 확인

## Phase 6: Barrel Export 정리

- [ ] 6.1 각 feature의 `api/index.ts` 업데이트
- [ ] 6.2 각 feature의 `index.ts` 업데이트
- [ ] 6.3 `shared/ui/base/index.ts` 생성
- [ ] 6.4 `shared/ui/layout/index.ts` 생성
- [ ] 6.5 `shared/api/index.ts` 생성

## Phase 7: 문서 업데이트

- [ ] 7.1 `docs/ARCHITECTURE.md` 전체 재작성
- [ ] 7.2 `CLAUDE.md` 업데이트
- [ ] 7.3 `openspec/project.md` 업데이트
- [ ] 7.4 tsconfig.json path alias 확인 (필요시 수정)

## Phase 8: 최종 검증

- [ ] 8.1 `npm run lint`
- [ ] 8.2 `npm run build`
- [ ] 8.3 `npm run dev` 후 브라우저 테스트
- [ ] 8.4 잔여 old path 검색:
  ```bash
  grep -r "entities\|match-management\|features/host\|@/services\|@/widgets\|@/components/ui\|@/lib/supabase" src/
  ```
- [ ] 8.5 Git commit

---

## Notes

- **각 Phase 완료 후 반드시 `npm run build`**
- **VS Code F2 (Rename Symbol)** 사용 시 import 자동 수정
- **수동 검색 필수**: `cmd+shift+f`로 old path 확인
- **Phase 순서 변경 금지**: 의존성 있음
