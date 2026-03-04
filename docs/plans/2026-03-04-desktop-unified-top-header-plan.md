# Desktop Unified Top Header Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 데스크톱에서 사이드바와 메인 영역을 연결하는 전역 상단 헤더(로고 + 알림)를 추가하고 기존 중복 알림 UI를 정리한다.

**Architecture:** `LayoutShell` 상단에 데스크톱 전용 헤더를 고정 배치하고, 사이드바는 내비게이션 전용 구조로 단순화한다. 페이지별 알림 슬롯은 모바일 전용으로 제한해 전역 헤더와 충돌을 방지한다.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS

---

### Task 1: 데스크톱 전역 헤더 컴포넌트 추가

**Files:**
- Create: `src/shared/ui/layout/desktop-top-header.tsx`
- Modify: `src/app/layout-shell.tsx`

**Step 1: 실패 기준 정의**
- 데스크톱에서 상단에 로고/알림 전역 바가 없고, 사이드바 상단과 메인 헤더가 분리되어 보이는 상태를 문제로 정의한다.

**Step 2: 최소 구현**
- `DesktopTopHeader` 컴포넌트를 만들고, 로고/알림을 렌더링한다.
- `LayoutShell`에서 `lg` 이상일 때만 헤더를 렌더링하고, 사이드바/메인 시작점을 헤더 높이에 맞춘다.

**Step 3: 동작 확인**
Run: `npm run lint`
Expected: exit code 0

### Task 2: 사이드바를 네비게이션 전용으로 단순화

**Files:**
- Modify: `src/shared/ui/layout/sidebar.tsx`

**Step 1: 실패 기준 정의**
- 사이드바 자체 로고 영역이 유지되면 전역 헤더와 중복되어 시각적 분리가 해결되지 않는 상태.

**Step 2: 최소 구현**
- 사이드바 로고/알림 영역을 제거하고 내비게이션 시작 간격만 유지한다.

**Step 3: 동작 확인**
Run: `npm run lint`
Expected: exit code 0

### Task 3: 페이지별 알림 중복 제거(데스크톱)

**Files:**
- Modify: `src/features/notification/ui/notification-bell.tsx`
- Modify: `src/pages/home/page.tsx`
- Modify: `src/pages/schedule/page.tsx`

**Step 1: 실패 기준 정의**
- 홈/스케줄 데스크톱에서 알림 아이콘이 전역 헤더와 페이지 헤더에 동시에 노출되는 상태.

**Step 2: 최소 구현**
- `NotificationBell`에 `className`을 허용해 컨텍스트별 표시 제어를 가능하게 한다.
- 홈/스케줄에서 전달하는 알림 슬롯을 `lg:hidden` 처리한다.

**Step 3: 동작 확인**
Run: `npm run lint`
Expected: exit code 0
