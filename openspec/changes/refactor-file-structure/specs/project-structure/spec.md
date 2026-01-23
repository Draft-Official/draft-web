# Project Structure Specification

## ADDED Requirements

### Requirement: Three-Folder Architecture

프로젝트는 반드시 3개의 최상위 폴더만 가져야 한다. `src/` 하위에는 `app/`, `features/`, `shared/` 폴더만 존재해야 하며(SHALL), `services/`, `widgets/`, `components/`, `entities/`, `lib/` 폴더는 존재하면 안 된다(MUST NOT).

#### Scenario: Top-level structure
- **GIVEN** src/ 디렉토리
- **WHEN** 최상위 폴더를 확인할 때
- **THEN** `app/`, `features/`, `shared/` 폴더만 존재해야 한다
- **AND** `services/`, `widgets/`, `components/`, `entities/`, `lib/` 폴더는 존재하지 않아야 한다

### Requirement: App Layer Routing Only

`app/` 폴더는 오직 라우팅과 페이지 껍데기만 포함해야 한다(SHALL). 비즈니스 로직은 포함하면 안 된다(MUST NOT). 동일한 기능을 가리키는 중복 라우트는 하나로 통합해야 한다(MUST).

#### Scenario: App folder contents
- **GIVEN** `src/app/` 디렉토리
- **WHEN** 파일을 확인할 때
- **THEN** `page.tsx`, `layout.tsx`, `providers.tsx`, `globals.css`만 포함해야 한다
- **AND** 비즈니스 로직은 포함하지 않아야 한다

#### Scenario: Route structure
- **GIVEN** URL 경로 `/matches/[id]`
- **WHEN** 해당 라우트를 찾을 때
- **THEN** `src/app/matches/[id]/page.tsx`에 위치해야 한다

#### Scenario: Feature naming consistency
- **GIVEN** Feature 이름과 URL이 불일치 (`match-management` feature와 `/schedule` URL)
- **WHEN** 구조를 정리할 때
- **THEN** Feature 이름을 URL과 일치하도록 변경해야 한다
- **AND** 관련된 모든 import 경로를 업데이트해야 한다

### Requirement: Feature Module Structure

각 Feature는 독립된 도메인 로직을 캡슐화해야 하며(SHALL), 표준 하위 폴더 구조를 따라야 한다(MUST). Feature 간 직접 import는 금지된다(MUST NOT).

#### Scenario: Feature folder structure
- **GIVEN** "match" feature
- **WHEN** 폴더 구조를 확인할 때
- **THEN** `src/features/match/` 하위에 존재해야 한다
- **AND** `api/`, `model/`, `ui/` 폴더를 포함할 수 있다
- **AND** 선택적으로 `lib/`, `config/` 폴더를 포함할 수 있다

#### Scenario: Feature isolation
- **GIVEN** "auth"와 "match" 두 개의 feature
- **WHEN** match feature에서 공유 로직이 필요할 때
- **THEN** 해당 로직은 `src/shared/`로 추출해야 한다
- **AND** `src/features/auth/`를 직접 import하면 안 된다

### Requirement: API Folder Internal Structure (Option C)

Feature의 `api/` 폴더는 hooks와 data-access를 분리하여 구조화해야 한다(SHALL). React Query hooks는 `hooks/` 하위 폴더에, Supabase 클라이언트는 `{feature}-api.ts` 파일에 위치해야 한다(MUST). 파일명은 kebab-case를 따라야 한다(SHALL).

#### Scenario: API folder structure
- **GIVEN** match feature의 api 폴더
- **WHEN** 내부 구조를 확인할 때
- **THEN** 다음 구조를 따라야 한다:
  ```
  features/match/api/
  ├── hooks/              # React Query hooks
  │   ├── queries.ts
  │   ├── mutations.ts
  │   └── keys.ts
  ├── match-api.ts        # Supabase data access (kebab-case)
  ├── match-mapper.ts     # Type conversion (kebab-case)
  └── index.ts            # Barrel export
  ```

#### Scenario: Hook to API flow
- **GIVEN** `useMatchList()` hook
- **WHEN** 데이터를 가져올 때
- **THEN** `hooks/queries.ts`에서 정의되어야 한다
- **AND** 내부적으로 `match-api.ts`의 함수를 호출해야 한다

### Requirement: Shared Layer Structure

`shared/` 폴더는 도메인 무관한 공용 자원을 포함해야 하며(SHALL), `api/`, `ui/`, `lib/` 하위 구조를 따라야 한다(MUST).

#### Scenario: Shared folder structure
- **GIVEN** `src/shared/` 디렉토리
- **WHEN** 하위 폴더를 확인할 때
- **THEN** 다음 구조를 따라야 한다:
  ```
  shared/
  ├── api/           # Network (supabase, query-client)
  ├── ui/            # Design System
  │   ├── base/      # Atoms (Button, Input)
  │   └── layout/    # Organisms (Header, BottomNav)
  └── lib/           # Utils (utils.ts, errors.ts)
  ```

#### Scenario: Supabase client location
- **GIVEN** Supabase 클라이언트 import가 필요할 때
- **WHEN** import 경로를 작성할 때
- **THEN** `@/shared/api/supabase/client`를 사용해야 한다

#### Scenario: Domain-agnostic API location
- **GIVEN** 체육관 검색 API (도메인 무관한 공용 API)
- **WHEN** 파일 위치를 결정할 때
- **THEN** `src/shared/api/gym-api.ts`에 있어야 한다
- **AND** 특정 feature 폴더에 있으면 안 된다

#### Scenario: UI component categorization
- **GIVEN** Button 컴포넌트 (shadcn)
- **WHEN** 위치를 확인할 때
- **THEN** `src/shared/ui/base/button.tsx`에 있어야 한다

- **GIVEN** Header 컴포넌트 (레이아웃)
- **WHEN** 위치를 확인할 때
- **THEN** `src/shared/ui/layout/header.tsx`에 있어야 한다

### Requirement: Kebab-Case File Naming

모든 파일명은 kebab-case를 사용해야 한다(SHALL). PascalCase 파일명은 금지된다(MUST NOT). 단, export되는 함수/컴포넌트 이름은 PascalCase를 사용해야 한다(MUST).

#### Scenario: File naming convention
- **GIVEN** React 컴포넌트 파일
- **WHEN** 파일명을 지정할 때
- **THEN** `match-list-item.tsx`처럼 kebab-case를 사용해야 한다
- **AND** `MatchListItem.tsx`처럼 PascalCase를 사용하면 안 된다

#### Scenario: API file naming
- **GIVEN** Supabase data access 파일
- **WHEN** 파일명을 지정할 때
- **THEN** `match-api.ts`처럼 kebab-case를 사용해야 한다
- **AND** `match.api.ts`처럼 dot notation을 사용하면 안 된다

#### Scenario: Export naming
- **GIVEN** `match-list-item.tsx` 파일
- **WHEN** 컴포넌트를 export할 때
- **THEN** `export function MatchListItem()`처럼 PascalCase 함수명을 사용해야 한다

### Requirement: No Abandoned Layers

프로젝트에 사용되지 않는 아키텍처 레이어가 존재하면 안 된다(MUST NOT). 미사용 코드와 빈 폴더는 반드시 제거해야 한다(SHALL).

#### Scenario: Dead code prevention
- **GIVEN** 정의되었지만 호출되지 않는 context provider
- **WHEN** 코드베이스를 감사할 때
- **THEN** 해당 provider는 제거해야 한다
- **AND** 빈 폴더도 함께 삭제해야 한다

#### Scenario: Feature renaming
- **GIVEN** 의미가 불명확하거나 URL과 불일치하는 feature 이름
- **WHEN** 코드베이스를 정리할 때
- **THEN** Feature 폴더 이름을 변경해야 한다
- **AND** 모든 import 경로를 업데이트해야 한다
- **EXAMPLE**: `features/match-management/` → `features/schedule/`
- **EXAMPLE**: `features/host/` → `features/team/`

### Requirement: Documentation Accuracy

프로젝트 문서는 현재 파일 구조를 정확하게 반영해야 한다(SHALL). 구조 변경 시 관련 문서를 반드시 업데이트해야 한다(MUST).

#### Scenario: Documentation sync
- **GIVEN** 파일 구조 변경이 발생했을 때
- **WHEN** 변경이 완료된 후
- **THEN** `ARCHITECTURE.md`, `CLAUDE.md`, `openspec/project.md`가 업데이트되어야 한다
- **AND** 문서의 경로가 실제 파일 구조와 일치해야 한다
