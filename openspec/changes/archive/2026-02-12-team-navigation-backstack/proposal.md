## Why

Team 탭의 네비게이션 스택 관리에 여러 문제가 있습니다. 외부 링크로 공유된 팀 상세 페이지에서 뒤로가기 시 동작이 불명확하고, 팀 상세 페이지의 탭 상태(홈/일정/멤버)를 URL로 공유할 수 없으며, Bottom Nav에서 같은 탭을 여러 번 클릭하면 히스토리가 불필요하게 쌓이는 문제가 있습니다. 모바일 앱과 같은 직관적인 네비게이션 경험을 제공하기 위해 이를 개선합니다.

## What Changes

- **Safe Back Navigation**: 히스토리가 없을 때 `router.back()`이 상위 경로로 fallback하도록 `useSafeBack` hook 추가
- **Team Detail Tab State in URL**: `/team/[code]` 페이지의 탭 상태를 URL query param(`?view=schedule`)으로 관리하여 공유 및 북마크 가능
- **Smart Bottom Nav**: Bottom Nav에서 현재 활성 탭 클릭 시 스택 초기화 및 스크롤 최상단 이동
- **Share with Tab State**: 팀 상세 페이지에서 현재 탭 상태를 포함한 URL 공유 기능 추가
- **Team List Tab Reset**: `/team` 페이지의 탭은 항상 "나의 팀"을 기본값으로 유지 (현재 동작 유지)

## Capabilities

### New Capabilities

- `navigation-backstack`: Safe navigation with fallback routes, URL-based tab state management, and smart bottom navigation behavior for team pages

### Modified Capabilities

- `team-detail`: Tab state now managed via URL query params (`?view=home|schedule|members`) instead of client-only state, enabling deep linking and sharing

## Impact

**Affected Files:**
- `src/shared/lib/hooks/use-safe-back.ts` (NEW): Safe back navigation hook
- `src/features/team/ui/team-detail-view.tsx`: URL-based tab state
- `src/features/team/ui/components/detail/team-detail-header.tsx`: Share functionality
- `src/features/team/ui/components/detail/team-settings-view.tsx`: Use useSafeBack
- `src/features/team/ui/components/detail/team-profile-edit-view.tsx`: Use useSafeBack
- `src/features/team/ui/components/detail/pending-members-view.tsx`: Use useSafeBack
- `src/features/team/ui/components/match/team-match-detail-view.tsx`: Use useSafeBack
- `src/shared/ui/layout/bottom-nav.tsx`: Smart navigation behavior

**User Experience Impact:**
- 공유된 팀 링크의 뒤로가기가 일관되게 동작
- 특정 탭 상태를 카카오톡 등으로 공유 가능
- Bottom Nav 중복 클릭 시 히스토리 오염 방지
- 모바일 앱과 유사한 직관적인 네비게이션
