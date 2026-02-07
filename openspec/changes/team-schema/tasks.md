## 1. Database Migration

- [x] 1.1 teams 테이블 확장 마이그레이션 작성 (code, short_intro, description, regular_day, regular_time)
- [x] 1.2 applications 테이블 확장 마이그레이션 작성 (source, description 컬럼)
- [x] 1.3 application_status enum에 NOT_ATTENDING 값 추가 (이미 존재함)
- [x] 1.4 team_fees 테이블 생성 마이그레이션 작성
- [x] 1.5 team_fees RLS 정책 추가
- [x] 1.6 기존 데이터 마이그레이션 (teams.code 기본값, applications.source 기본값)
- [ ] 1.7 Supabase에 마이그레이션 적용 및 검증

## 2. Team Feature API Layer

- [x] 2.1 src/features/team/ 디렉토리 구조 생성 (api/, model/, ui/)
- [x] 2.2 team/model/types.ts 타입 정의 (Team, TeamMember, TeamRole, TeamMemberStatus)
- [x] 2.3 team/api/team-api.ts 작성 (getTeam, getTeamByCode, createTeam, updateTeam)
- [x] 2.4 team/api/team-mapper.ts 작성 (DB row → Client type 변환)
- [x] 2.5 team/api/keys.ts 작성 (React Query 키 정의)
- [x] 2.6 team/api/queries.ts 작성 (useTeam, useTeamByCode, useMyTeams)
- [x] 2.7 team/api/mutations.ts 작성 (useCreateTeam, useUpdateTeam)

## 3. Team Membership API Layer

- [x] 3.1 team/api/membership-api.ts 작성 (getTeamMembers, createJoinRequest, updateMemberStatus, removeMember)
- [x] 3.2 team/api/membership-queries.ts 작성 (useTeamMembers, useMyMembership)
- [x] 3.3 team/api/membership-mutations.ts 작성 (useJoinTeam, useApproveJoin, useRejectJoin, useRemoveMember, useUpdateRole)

## 4. Team Match & Voting API Layer

- [x] 4.1 application/model/types.ts에 source 타입 추가 (ApplicationSource)
- [x] 4.2 application/api에 팀 투표 관련 함수 추가 (createTeamVote, updateTeamVote) - team-match-api.ts에 upsertTeamVote로 구현
- [x] 4.3 team/api/team-match-api.ts 작성 (createTeamMatch, getTeamMatches, closeVoting)
- [x] 4.4 team/api/team-match-queries.ts 작성 (useTeamMatches, useVotingStatus)
- [x] 4.5 team/api/team-match-mutations.ts 작성 (useCreateTeamMatch, useVote, useCloseVoting)

## 5. Team Fees API Layer

- [x] 5.1 team/api/fees-api.ts 작성 (getTeamFees, updateFeeStatus)
- [x] 5.2 team/api/fees-queries.ts 작성 (useTeamFees, useMyFeeStatus)
- [x] 5.3 team/api/fees-mutations.ts 작성 (useUpdateFeeStatus)

## 6. Routing & Pages

- [ ] 6.1 app/team/page.tsx 리팩토링 (내 팀 / 팀 찾기 탭 구조, Empty State)
- [ ] 6.2 app/team/create/page.tsx 생성 (팀 생성 페이지)
- [ ] 6.3 app/team/[code]/page.tsx 생성 (팀 프로필 페이지)
- [ ] 6.4 app/team/[code]/join/page.tsx 생성 (초대 링크 가입 페이지)
- [ ] 6.5 app/team/[code]/manage/page.tsx 생성 (팀 관리 페이지 - 팀장/매니저용)

## 7. Team UI Components

- [ ] 7.1 team/ui/team-profile-card.tsx 작성 (팀 프로필 카드)
- [ ] 7.2 team/ui/team-member-list.tsx 작성 (팀원 목록)
- [ ] 7.3 team/ui/team-join-button.tsx 작성 (가입 신청 버튼)
- [ ] 7.4 team/ui/team-create-form.tsx 작성 (팀 생성 폼)
- [ ] 7.5 team/ui/team-edit-form.tsx 작성 (팀 정보 수정 폼)
- [ ] 7.6 team/ui/team-code-input.tsx 작성 (팀 코드 입력 + 중복 체크)

## 8. Team Membership UI Components

- [ ] 8.1 team/ui/pending-members-list.tsx 작성 (가입 대기자 목록)
- [ ] 8.2 team/ui/member-role-badge.tsx 작성 (역할 뱃지)
- [ ] 8.3 team/ui/member-actions-menu.tsx 작성 (역할 변경, 강퇴 메뉴)
- [ ] 8.4 team/ui/invite-link-button.tsx 작성 (초대 링크 복사)

## 9. Team Match & Voting UI Components

- [ ] 9.1 team/ui/upcoming-match-card.tsx 작성 (다가오는 팀 운동 카드)
- [ ] 9.2 team/ui/voting-buttons.tsx 작성 (참석/불참/미정 투표 버튼)
- [ ] 9.3 team/ui/voting-status-summary.tsx 작성 (투표 현황 요약)
- [ ] 9.4 team/ui/vote-reason-input.tsx 작성 (불참 사유 입력)
- [ ] 9.5 team/ui/close-voting-button.tsx 작성 (투표 마감 버튼)
- [ ] 9.6 team/ui/guest-recruit-button.tsx 작성 (게스트 모집 전환 버튼)

## 10. Team Fees UI Components

- [ ] 10.1 team/ui/fee-status-list.tsx 작성 (회비 납부 현황 목록)
- [ ] 10.2 team/ui/fee-checkbox.tsx 작성 (납부 여부 체크박스)
- [ ] 10.3 team/ui/fee-account-info.tsx 작성 (계좌 정보 표시)
- [ ] 10.4 team/ui/fee-summary-card.tsx 작성 (납부 현황 요약)

## 11. Schedule Integration

- [ ] 11.1 schedule/api/queries.ts 수정 - 팀 매치 필터링 로직 추가
- [ ] 11.2 schedule/ui/schedule-list-item.tsx 수정 - 팀 매치 상태 표시 (투표중, 투표 마감)
- [ ] 11.3 schedule 게스트 탭에 팀 투표 결과 표시 (참여 예정/불참/미정)
- [ ] 11.4 schedule 호스트 탭에 팀장의 팀 매치 표시

## 12. Constants & Types

- [x] 12.1 shared/config/team-constants.ts 생성 (TEAM_ROLE_VALUES, TEAM_MEMBER_STATUS_VALUES 등)
- [x] 12.2 shared/types/team.types.ts 생성 (필요시 공유 타입) - team/model/types.ts에 통합
- [x] 12.3 application source 상수 추가 (APPLICATION_SOURCE_VALUES)

## 13. Testing & Validation

- [ ] 13.1 팀 생성 플로우 테스트 (코드 중복 체크 포함)
- [ ] 13.2 팀 초대/가입 플로우 테스트
- [ ] 13.3 팀 매치 생성 및 투표 플로우 테스트
- [ ] 13.4 경기관리 연동 테스트 (게스트/호스트 탭)
- [ ] 13.5 회비 관리 플로우 테스트
- [ ] 13.6 권한 체크 테스트 (역할별 접근 제한)
