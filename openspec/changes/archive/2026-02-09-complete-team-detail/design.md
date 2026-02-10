## Context

팀 상세 페이지(`/team/[code]`)는 현재 기본 구조만 구현되어 있다:
- 헤더 + 3탭 (홈/일정/멤버)
- "이번 주 운동 생성" 버튼과 설정 아이콘 버튼
- 팀 설정 페이지는 삭제/탈퇴 기능만 존재

**현재 구조**:
```
src/features/team/
├── api/
│   ├── core/          # 팀 CRUD
│   ├── membership/    # 팀원 관리 (이미 구현됨)
│   ├── match/         # 팀 매치
│   └── fees/          # 회비 관리
├── ui/
│   ├── team-detail-view.tsx
│   └── components/detail/
│       ├── team-detail-header.tsx
│       ├── team-home-tab.tsx
│       ├── team-schedule-tab.tsx
│       ├── team-members-tab.tsx
│       └── team-settings-view.tsx
└── model/types.ts
```

**기존 API 활용 가능**:
- `approveJoinRequest`, `rejectJoinRequest` - 가입 승인/거절
- `transferLeadership` - 팀장 위임
- `deleteTeam`, `leaveTeam` - 팀 삭제/탈퇴

## Goals / Non-Goals

**Goals:**
- 팀장/매니저가 팀을 효과적으로 운영할 수 있는 기능 제공
- FAB를 통한 빠른 액션 접근 (경기 생성, 멤버 초대)
- 가입 신청 관리 워크플로우 완성
- 팀 설정 기능 완성 (프로필 수정, 계좌, 위임, 삭제)
- 3-Folder 아키텍처 준수 (app/은 라우팅만)

**Non-Goals:**
- 팀 채팅 기능 (별도 change로 분리)
- 회비 관리 UI (이미 별도로 존재)
- 팀 통계/분석 대시보드

## Decisions

### 1. FAB 구현 방식

**결정**: Radix UI Popover 기반 FAB 컴포넌트

**대안 검토**:
- A) Sheet (bottom drawer) - 모바일 친화적이지만 2개 액션에는 과함
- B) DropdownMenu - 데스크탑 친화적, 모바일에서 터치 영역 작음
- C) **Popover (선택)** - 가볍고 2개 액션에 적합, 위치 제어 용이

**이유**:
- 액션이 2개뿐이라 Sheet는 과함
- Popover는 FAB 바로 위에 메뉴를 띄울 수 있어 자연스러움
- shadcn/ui Popover 이미 사용 중

### 2. 팀 설정 페이지 구조

**결정**: 기존 `team-settings-view.tsx` 확장 + 다이얼로그 패턴

**구조**:
```
/team/[code]/settings          → TeamSettingsView (메뉴 목록)
/team/[code]/settings/edit     → TeamProfileEditView (전체 페이지)
```

**다이얼로그로 처리**:
- 환불 계좌 수정 (간단한 폼)
- 팀 소유자 위임 (멤버 선택)
- 팀 삭제 확인 (이미 구현됨)

**이유**:
- 프로필 수정은 여러 필드가 있어 전체 페이지가 적합
- 계좌/위임은 단일 액션이라 다이얼로그가 UX에 좋음

### 3. 가입 신청 관리 페이지 경로

**결정**: `/team/[code]/members/pending`

**대안 검토**:
- A) `/team/[code]/settings/requests` - 설정 하위
- B) **`/team/[code]/members/pending` (선택)** - 멤버 관련
- C) 별도 탭으로 추가

**이유**:
- 멤버 탭에서 "가입 대기 N명" 클릭 시 이동하므로 멤버 하위가 자연스러움
- 설정과 멤버 관리는 개념적으로 분리

### 4. 헤더 UI 변경 (팀 설정 / 공유 분리)

**결정**: 이미지 기준으로 SegmentedControl 스타일 UI

**구조**:
```tsx
<div className="flex rounded-lg bg-slate-100 p-1">
  <button className="flex-1 ...">팀 설정</button>
  <button className="px-4 ...">...</button>  {/* 공유 */}
</div>
```

**이유**:
- 이미지에서 보여준 디자인 그대로 구현
- "팀 설정"은 설정 페이지로 이동
- "..."은 팀 공유 (링크 복사 등)

### 5. 팀 정보 순서 변경

**결정**: `team-home-tab.tsx`의 `infoItems` 배열 순서 변경

**변경 후 순서**:
1. 지역
2. 홈 구장
3. 모임 시간
4. 성별 (추가)
5. 평균 나이
6. 멤버
7. 레벨
8. ~~웹사이트~~ (제거)

### 6. 모임 시간 포맷 변경

**결정**: `formatRegularSchedule` 함수 수정

**Before**: `"매주 토요일 01:30~02:30"`
**After**: `"토요일 01:30 ~ 02:30"` (매주 제거, 물결표 양쪽 공백)

### 7. 버그 수정: created_at → joined_at

**결정**: `getPendingMembers`에서 정렬 컬럼 변경

**원인**: `team_members` 테이블에 `created_at` 컬럼이 없음
**해결**: `joined_at`으로 정렬 (PENDING 상태에서는 null이지만 정렬에는 문제없음)

## Risks / Trade-offs

### [Risk] FAB가 컨텐츠를 가릴 수 있음
→ **Mitigation**: 하단 여백(pb-20) 추가, FAB 위치를 우측 하단 고정

### [Risk] 팀 소유자 위임 중 동시성 이슈
→ **Mitigation**: 기존 `transferLeadership` 함수가 순차 업데이트 + 롤백 로직 포함

### [Risk] 팀 삭제 시 연관 데이터 처리
→ **Mitigation**: DB cascade 설정에 의존 (team_members, team_fees 등)

### [Trade-off] 다이얼로그 vs 페이지
- 다이얼로그: 빠른 UX, 하지만 복잡한 폼에는 부적합
- 페이지: 명확한 컨텍스트, 하지만 이동 비용
→ 복잡도에 따라 혼합 사용

## File Structure

```
src/
├── app/team/[code]/
│   ├── settings/
│   │   ├── page.tsx                    # TeamSettingsView (기존)
│   │   └── edit/page.tsx               # TeamProfileEditView (신규)
│   └── members/
│       └── pending/page.tsx            # PendingMembersView (신규)
│
└── features/team/ui/components/detail/
    ├── team-fab.tsx                    # FAB 컴포넌트 (신규)
    ├── team-settings-view.tsx          # 수정 (다이얼로그 추가)
    ├── team-profile-edit-view.tsx      # 프로필 수정 뷰 (신규)
    ├── pending-members-view.tsx        # 가입 신청 관리 뷰 (신규)
    ├── account-edit-dialog.tsx         # 환불 계좌 다이얼로그 (신규)
    └── delegate-leader-dialog.tsx      # 소유자 위임 다이얼로그 (신규)
```

## Open Questions

1. **팀 공유 기능의 구체적 동작**: 링크 복사만? 카카오톡 공유 버튼 포함?
   → MVP는 링크 복사만, 추후 확장

2. **프로필 수정 시 이미지 업로드**: Supabase Storage 사용?
   → 기존 이미지 업로드 패턴 따름 (있다면)
