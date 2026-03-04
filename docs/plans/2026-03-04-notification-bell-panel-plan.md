# Notification Bell Panel Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 데스크톱 상단 `NotificationBell` 클릭 시 `/notifications` 이동 대신 흰색 알림 패널을 표시한다.

**Architecture:** `NotificationBell`에 `mode`를 추가해 링크/패널 동작을 분기한다. 패널 본문은 `NotificationPanel`로 분리하고 기존 `NotificationList`를 재사용한다. 재사용 안정성을 위해 기본 모드는 기존 링크 동작으로 유지한다.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Radix Popover

---

### Task 1: NotificationBell에 panel 모드 추가

**Files:**
- Modify: `src/features/notification/ui/notification-bell.tsx`
- Create: `src/features/notification/ui/notification-panel.tsx`

**Step 1: Write the failing test**
- 테스트 인프라가 없어 자동화 테스트 추가가 어려우므로, 수동 확인 시나리오를 실패 기준으로 정의한다.
- 실패 기준: 데스크톱에서 벨 클릭 시 여전히 `/notifications`로 이동한다.

**Step 2: Run test to verify it fails**
Run: 수동 확인 (현재 동작)
Expected: 벨 클릭 시 페이지 이동 발생

**Step 3: Write minimal implementation**
- `NotificationBell`에 `mode: 'link' | 'panel'` 추가
- `mode='panel'`일 때 `Popover` + `NotificationPanel` 렌더링
- `NotificationPanel`에 헤더(`알림` + 설정 버튼) 및 `NotificationList` 배치

**Step 4: Run test to verify it passes**
Run: 수동 확인
Expected: 데스크톱 벨 클릭 시 패널 토글, 모바일은 기존 링크 이동 유지

### Task 2: 빈 상태를 패널 친화적으로 정리

**Files:**
- Modify: `src/features/notification/ui/notification-list.tsx`

**Step 1: Write the failing test**
- 실패 기준: 알림 0건일 때 단순 텍스트만 표시되어 패널 빈 상태가 의도와 다름.

**Step 2: Run test to verify it fails**
Run: 수동 확인
Expected: 빈 상태에 아이콘 중심 UI 없음

**Step 3: Write minimal implementation**
- 빈 상태에 벨 아이콘 + 2줄 안내 문구를 추가
- 기존 데이터/로딩/읽음 처리 로직은 유지

**Step 4: Run test to verify it passes**
Run: 수동 확인
Expected: 빈 상태 아이콘/문구 표시

### Task 3: 데스크톱 헤더에 panel 모드 연결

**Files:**
- Modify: `src/shared/ui/layout/desktop-top-header.tsx`

**Step 1: Write the failing test**
- 실패 기준: 상단 헤더의 벨이 link 모드로 동작한다.

**Step 2: Run test to verify it fails**
Run: 수동 확인
Expected: 벨 클릭 시 페이지 이동

**Step 3: Write minimal implementation**
- 상단 헤더에서 `<NotificationBell mode="panel" />` 적용

**Step 4: Run test to verify it passes**
Run: 수동 확인
Expected: 데스크톱 상단 벨이 패널을 연다.

### Task 4: 검증

**Files:**
- N/A

**Step 1: Run lint verification**
Run: `npm run lint`
Expected: exit 0 (기존 경고는 허용)

**Step 2: Final manual checks**
- 데스크톱: 패널 오픈/닫힘
- 데스크톱: 설정 버튼 클릭 시 `/my` 이동
- 모바일: 벨 클릭 시 `/notifications` 이동
