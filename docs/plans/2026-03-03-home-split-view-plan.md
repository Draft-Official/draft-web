# Home Desktop Split View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 데스크톱 홈에서 매치 클릭 시 좌측 리스트/우측 상세 2단 split UX를 제공하고, 모바일은 기존 상세 라우팅을 유지한다.

**Architecture:** route adapter는 유지하고 `src/pages/home/page.tsx` 오케스트레이션 + `features/match` UI 확장으로 구현한다. 글로벌 레이아웃 제어는 `layout-shell`에서 split 상태를 감지해 사이드바/폭만 조정한다. P0 진행 중인 상세 라우트 파일(`src/pages/matches/[id]/page.tsx`)은 수정하지 않는다.

**Tech Stack:** Next.js App Router, React Query, Tailwind v4, shadcn/ui, react-resizable-panels

---

### Task 1: Add split layout primitives

**Files:**
- Create: `src/shared/ui/shadcn/resizable.tsx`
- Modify: `app/globals.css`

**Step 1: Write failing test**
- 현재 테스트 인프라 부재로 컴포넌트 동작은 lint/build + 수동 검증으로 대체

**Step 2: Run test to verify it fails**
- N/A

**Step 3: Write minimal implementation**
- shadcn compatible `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` 추가
- `--layout-content-split-max` 및 `.app-content-container--split` 유틸 추가

**Step 4: Verify**
Run: `npm run lint`
Expected: 0 errors

### Task 2: Control shell for split mode

**Files:**
- Modify: `src/app/layout-shell.tsx`

**Step 1: Write failing test**
- 현재 테스트 인프라 부재로 수동 검증으로 대체

**Step 2: Run test to verify it fails**
- N/A

**Step 3: Write minimal implementation**
- 홈 + `match` query 존재 시 데스크톱 사이드바 숨김
- split 상태일 때 main 컨텐츠 max-width를 split 토큰으로 확장

**Step 4: Verify**
Run: `npm run check:architecture`
Expected: no boundary violations

### Task 3: Home page split orchestration

**Files:**
- Modify: `src/pages/home/page.tsx`
- Create: `src/shared/lib/hooks/use-media-query.ts`
- Modify: `src/shared/lib/hooks/index.ts`

**Step 1: Write failing test**
- 현재 테스트 인프라 부재로 lint/build + 수동 검증으로 대체

**Step 2: Run test to verify it fails**
- N/A

**Step 3: Write minimal implementation**
- `match` query 기반 selected state
- `>=1024` desktop split: resizable left(list)/right(detail)
- `<1024` mobile: 기존 `/matches/[id]` 라우팅 유지
- 모바일에서 `/?match=` 접근 시 상세 라우트로 리다이렉트
- 카드 active 상태 전달

**Step 4: Verify**
Run: `npm run lint`
Expected: 0 errors

### Task 4: Make list/detail reusable for split mode

**Files:**
- Modify: `src/features/match/ui/match-list-item.tsx`
- Modify: `src/features/match/ui/match-detail-view.tsx`

**Step 1: Write failing test**
- 현재 테스트 인프라 부재로 수동 검증으로 대체

**Step 2: Run test to verify it fails**
- N/A

**Step 3: Write minimal implementation**
- `MatchListItem`에 optional `onClick`, `isActive`
- `MatchDetailView`에 `layoutMode`(`page|split`), `onClose`, `onOpenFullPage` 추가
- split 모드에서는 full-page 전용 bottom bar를 숨김

**Step 4: Verify**
Run: `npm run build`
Expected: build success

### Task 5: End-to-end verification

**Files:**
- Modify: none

**Step 1: Run full verification**
Run:
- `npm run check:architecture`
- `npm run lint`
- `npm run build`

**Step 2: Manual scenarios**
- Desktop 1024+: 클릭 시 split + sidebar hidden
- Split close/open page button 동작
- Split drag resize 동작
- Mobile/Tablet: 기존 full-page 상세 동작

**Step 3: Summarize with evidence**
- 명령 결과 + 수동 검증 결과를 함께 보고

