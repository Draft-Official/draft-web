## Why

팀 상세 페이지의 핵심 기능들이 아직 미완성 상태이다. 플로팅 액션 버튼(FAB), 팀 설정 페이지 세부 기능, 가입 신청 관리 페이지가 없어서 팀장/매니저가 팀을 효과적으로 운영할 수 없다. 또한 DB 스키마와 맞지 않는 쿼리 오류(`team_members.created_at`)와 UI 개선 사항들도 해결해야 한다.

## What Changes

### 신규 기능
- **플로팅 액션 버튼(FAB)**: "이번 주 운동 생성" 버튼을 FAB로 변경하고 다음 액션들을 포함
  - 경기 생성하기
  - 링크로 멤버 초대하기
- **팀 설정 페이지 분리**: 이미지처럼 "팀 설정" 탭과 "..." 버튼(팀 공유하기) 분리
- **가입 신청 관리 페이지**: 대기 중인 가입 신청 목록과 수락/거절 버튼
- **팀 프로필 수정 페이지**: 팀 정보 수정 전용 페이지
- **환불 계좌 수정 다이얼로그**: 팀 환불 계좌 정보 수정
- **팀 소유자 위임 다이얼로그**: 팀장 권한을 다른 멤버에게 이전
- **팀 삭제 기능**: 팀 삭제 확인 및 실행

### UI/UX 개선
- 팀 정보에서 "웹사이트" 항목 제거
- 팀 정보에서 "성별" 항목을 "평균 나이" 위로 이동
- 모임 시간 표시 형식 변경: "매주 토요일 01:30~02:30" → "토요일 01:30 ~ 02:30"

### 버그 수정
- **BREAKING**: `getPendingMembers` 쿼리에서 `created_at` → `joined_at` 정렬 변경 (DB 스키마에 `created_at` 컬럼 없음)

## Capabilities

### New Capabilities
- `team-fab-actions`: 팀 상세 페이지의 플로팅 액션 버튼 (경기 생성, 멤버 초대)
- `team-join-requests`: 가입 신청 관리 페이지 (목록 조회, 수락/거절)
- `team-settings-actions`: 팀 설정 관련 액션들 (프로필 수정, 환불 계좌, 소유자 위임, 팀 삭제)

### Modified Capabilities
- `team-detail`: 헤더 UI 변경 (설정 버튼 → 팀 설정/공유 분리), 팀 정보 섹션 순서 변경, 모임 시간 포맷 변경

## Impact

### 영향받는 코드
- `src/features/team/ui/team-detail-view.tsx` - 헤더 구조 변경, FAB 추가
- `src/features/team/ui/components/detail/team-detail-header.tsx` - 버튼 구조 변경
- `src/features/team/ui/components/detail/team-home-tab.tsx` - 팀 정보 항목 순서 및 제거
- `src/features/team/ui/components/detail/team-settings-view.tsx` - 설정 페이지 확장
- `src/features/team/api/mapper.ts` - `formatRegularSchedule` 포맷 변경
- `src/features/team/api/membership/api.ts` - `getPendingMembers` 정렬 컬럼 수정

### 새로 생성되는 파일
- `src/app/team/[code]/settings/edit/page.tsx` - 팀 프로필 수정 페이지
- `src/app/team/[code]/members/pending/page.tsx` - 가입 신청 관리 페이지
- `src/features/team/ui/components/detail/team-fab.tsx` - 플로팅 액션 버튼 컴포넌트
- `src/features/team/ui/components/detail/pending-members-view.tsx` - 가입 신청 목록 뷰
- `src/features/team/ui/components/detail/account-edit-dialog.tsx` - 환불 계좌 수정 다이얼로그
- `src/features/team/ui/components/detail/delegate-leader-dialog.tsx` - 소유자 위임 다이얼로그

### API 영향
- 기존 API 함수들 활용 (`approveJoinRequest`, `rejectJoinRequest`, `transferLeadership`)
- 팀 업데이트 API 확장 필요 (프로필 수정, 계좌 정보 수정)
