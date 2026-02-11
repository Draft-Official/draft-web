## 1. 버그 수정 및 UI 개선

- [x] 1.1 `getPendingMembers`에서 정렬 컬럼 `created_at` → `id`로 변경 (`src/features/team/api/membership/api.ts`)
- [x] 1.2 `formatRegularSchedule` 함수에서 "매주" 제거, 시간 포맷을 "HH:MM ~ HH:MM"으로 변경 (`src/features/team/api/mapper.ts`)
- [x] 1.3 `team-home-tab.tsx`에서 웹사이트 항목 제거, 성별 항목 추가 및 평균 나이 위로 이동

## 2. 헤더 UI 변경 (팀 설정/공유 분리)

- [x] 2.1 `team-detail-header.tsx`에서 기존 버튼 제거하고 세그먼트 컨트롤 스타일 UI 추가
- [x] 2.2 "팀 설정" 버튼 클릭 시 `/team/[code]/settings`로 이동
- [x] 2.3 "..." 버튼 클릭 시 팀 링크 클립보드 복사 + 토스트 메시지

## 3. FAB 컴포넌트 구현

- [x] 3.1 `team-fab.tsx` 컴포넌트 생성 (Popover 기반)
- [x] 3.2 FAB 메뉴에 "경기 생성하기", "링크로 멤버 초대하기" 옵션 추가
- [x] 3.3 "경기 생성하기" 클릭 시 `/team/[code]/match/create`로 이동
- [x] 3.4 "링크로 멤버 초대하기" 클릭 시 초대 링크 클립보드 복사 + 토스트
- [x] 3.5 `team-detail-view.tsx`에 FAB 추가 (팀원만 표시, 하단 여백 추가)

## 4. 가입 신청 관리 페이지

- [x] 4.1 `pending-members-view.tsx` 컴포넌트 생성 (가입 신청 목록 + 수락/거절 버튼)
- [x] 4.2 `src/app/team/[code]/members/pending/page.tsx` 라우트 페이지 생성
- [x] 4.3 `useApproveJoinRequest`, `useRejectJoinRequest` mutation 훅 추가 (`src/features/team/api/membership/mutations.ts`)
- [x] 4.4 멤버 탭에서 "가입 대기 N명" 클릭 시 pending 페이지로 이동하도록 수정

## 5. 팀 설정 페이지 확장

- [x] 5.1 `account-edit-dialog.tsx` 환불 계좌 수정 다이얼로그 생성
- [x] 5.2 `delegate-leader-dialog.tsx` 팀 소유자 위임 다이얼로그 생성
- [x] 5.3 `team-settings-view.tsx`에 다이얼로그 연결 및 메뉴 구조 정리

## 6. 팀 프로필 수정 페이지

- [x] 6.1 `team-profile-edit-view.tsx` 프로필 수정 폼 컴포넌트 생성
- [x] 6.2 `src/app/team/[code]/settings/edit/page.tsx` 라우트 페이지 생성
- [x] 6.3 `useUpdateTeam` mutation 훅 추가 (`src/features/team/api/core/mutations.ts`) - 이미 존재
- [x] 6.4 팀 정보 수정 폼 구현 (이름, 소개, 로고, 지역, 홈 구장, 정기 운동, 성별, 레벨/나이 범위)

## 7. API 및 타입 정리

- [x] 7.1 `updateTeam` API 함수 추가 (`src/features/team/api/core/api.ts`) - 이미 존재
- [x] 7.2 `updateTeamAccount` API 함수 추가 (계좌 정보만 업데이트) - AccountEditDialog에서 직접 처리
- [x] 7.3 barrel export 업데이트 (`src/features/team/ui/components/detail/index.ts`)
