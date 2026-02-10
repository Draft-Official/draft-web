## Context

팀 시스템의 기본 구조(팀 생성, 멤버 관리, 설정)는 구현되었으나, 핵심 기능인 **팀 매치(정기운동)** 플로우가 미완성 상태다.

**현재 상태:**
- API 레이어: `team-match-api.ts`에 createTeamMatch, closeVoting 등 존재
- UI 컴포넌트: `vote-dialog.tsx` 존재하나 연동 안됨
- 페이지: `/team/[code]/match/create`, `/team/[code]/matches/[matchId]` 모두 404

**기존 데이터 모델:**
- `matches` 테이블: `match_type='TEAM_MATCH'`, `team_id` 연결
- `applications` 테이블: `source='TEAM_VOTE'`로 팀 투표 구분
- 투표 상태: PENDING, CONFIRMED, LATE, NOT_ATTENDING, MAYBE

## Goals / Non-Goals

**Goals:**
- 팀 매치 생성 → 상세 → 투표 → 마감 플로우 완성
- 기존 API 활용하여 UI 페이지 구현
- 권한 기반 액션 제어 (Leader/Manager/Member)
- 비팀원 가입 신청 플로우

**Non-Goals:**
- 게스트 모집 전환 (별도 proposal)
- 회비 관리 (구현 안 함)
- 팀 공지사항 / 출석 통계 (별도 검토)
- 자동 투표 마감 (MVP에서 수동만)

## Decisions

### 1. 투표 상태 관리

| 결정 | 선택 | 근거 |
|------|------|------|
| 투표 취소 | **불허** | 한번 의사표시하면 책임감 유지. 변경(참석↔불참)은 가능 |
| 마감 재오픈 | **허용 (Leader만)** | 실수로 마감했을 때 복구 가능해야 함 |
| 미응답자 처리 | **PENDING 유지** | 마감해도 미응답자 강제 처리 없음. UI에서 "미응답" 표시 |
| 마감 후 변경 | **팀장 대신 변경** | 마감 상태에서 Leader/Manager가 팀원 투표 대신 변경 가능 |

**대안 검토:**
- 미응답자 자동 불참 처리 → 기각: 늦게 확인하는 팀원에게 불리
- 마감 후 재오픈 불허 → 기각: 실수 복구 불가

### 2. 팀원 변동 처리

| 결정 | 선택 | 근거 |
|------|------|------|
| 새 멤버 가입 | 진행 중 매치에 투표 자동 생성 | `createVotesForNewMember` 활용 |
| 탈퇴/강퇴 시 투표 | **기록 유지** | 통계 목적. user_id는 남지만 user 정보는 null 가능 |

### 3. 권한 체계

| 액션 | Leader | Manager | Member |
|------|:------:|:-------:|:------:|
| 매치 생성 | ✅ | ✅ | ❌ |
| 매치 수정/취소 | ✅ | ✅ | ❌ |
| 투표 마감 | ✅ | ✅ | ❌ |
| 마감 재오픈 | ✅ | ❌ | ❌ |
| 팀원 투표 대신 변경 | ✅ | ✅ | ❌ |
| 본인 투표 | ✅ | ✅ | ✅ |

### 4. 라우팅 구조

```
/team/[code]/match/create     → 팀 매치 생성 (Leader/Manager)
/team/[code]/matches/[id]     → 팀 매치 상세 + 투표 (전체 팀원)
```

**대안 검토:**
- `/team/[code]/schedule/create` → 기각: `match` 도메인 명확히 분리
- 모달 방식 생성 → 기각: 폼 입력 항목 많아 페이지 필요

### 5. 컴포넌트 구조

```
features/team/ui/components/match/
├── team-match-create-form.tsx   # 생성 폼
├── team-match-detail-view.tsx   # 상세 뷰
├── voting-status-card.tsx       # 투표 현황 카드
├── voter-list.tsx               # 투표자 목록
└── admin-actions.tsx            # 관리자 액션 (마감, 재오픈, 대신 변경)
```

## Risks / Trade-offs

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| 동시 투표 충돌 | 마지막 쓰기 우선 → 데이터 손실 | Optimistic update + 실패 시 롤백 + toast 알림 |
| 팀원 수 ≠ 투표 수 | 가입/탈퇴 시점 차이로 불일치 | Summary는 application 기준으로 계산 |
| 마감 후 재오픈 남용 | 팀원 혼란 | Leader만 재오픈 가능 + 로그 기록 |
| 탈퇴한 멤버 투표 표시 | UI에서 "알 수 없음" 표시 | user 정보 null 체크 + fallback 텍스트 |

### Trade-offs

| Trade-off | 선택 | 포기한 것 |
|-----------|------|----------|
| 투표 취소 불허 | 책임감 있는 의사표시 | 유연한 취소 |
| 수동 마감 | MVP 단순화 | 자동 마감 편의성 |
| 마감 후 팀장 대신 변경 | 긴급 상황 대응 | 팀원 자율성 |

## Open Questions

1. **매치 삭제 정책**: 삭제 시 관련 applications도 cascade 삭제? 또는 soft delete?
2. **알림 시스템**: 투표 마감, 매치 취소 시 팀원 알림 방법 (앱 내 알림? 푸시?)
3. **오프라인 대응**: 투표 버튼 비활성화 vs 로컬 큐잉 후 재시도
