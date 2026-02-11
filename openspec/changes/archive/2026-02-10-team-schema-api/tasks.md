## 1. Database Migration

- [x] 1.1 teams 테이블 확장 마이그레이션 작성 (code, short_intro, description, regular_day, regular_time)
- [x] 1.2 applications 테이블 확장 마이그레이션 작성 (source, description 컬럼)
- [x] 1.3 application_status enum에 NOT_ATTENDING 값 추가 (이미 존재함)
- [x] 1.4 team_fees 테이블 생성 마이그레이션 작성
- [x] 1.5 team_fees RLS 정책 추가
- [x] 1.6 기존 데이터 마이그레이션 (teams.code 기본값, applications.source 기본값)

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

## 6. Constants & Types

- [x] 6.1 shared/config/team-constants.ts 생성 (TEAM_ROLE_VALUES, TEAM_MEMBER_STATUS_VALUES 등)
- [x] 6.2 shared/types/team.types.ts 생성 (필요시 공유 타입) - team/model/types.ts에 통합
- [x] 6.3 application source 상수 추가 (APPLICATION_SOURCE_VALUES)

---

**Note**: UI 컴포넌트 및 페이지 작업은 별도 change로 분리됨 (team-schema-ui)
