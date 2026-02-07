## 1. Cleanup

- [x] 1.1 `src/features/team/ui/host-dashboard-view.tsx` 삭제
- [x] 1.2 `src/features/team/model/mock-data.ts` 삭제
- [x] 1.3 `src/features/team/ui/index.ts` export 정리

## 2. API Layer

- [x] 2.1 `TeamListItem` 타입 확장 (regularDay, regularTime, homeGymName 추가)
- [x] 2.2 `useMyTeams` 쿼리 수정 - 정기운동 정보 포함
- [ ] 2.3 `useMyPendingVoteMatches(userId)` 쿼리 추가 (TODO: 실제 API 연동 필요)

## 3. UI Components

- [x] 3.1 `src/features/team/ui/components/team-profile-card.tsx` 생성 (재사용 가능)
- [x] 3.2 `src/features/team/ui/team-page-tabs.tsx` 생성 (메인 탭 컨테이너)
- [x] 3.3 `src/features/team/ui/my-teams-tab.tsx` 생성 (나의 팀 탭)
- [x] 3.4 `src/features/team/ui/team-create-tab.tsx` 생성 (팀 생성하기+ 탭)

## 4. Page Integration

- [x] 4.1 `src/app/team/page.tsx` 수정 → TeamPageTabs 렌더링
- [x] 4.2 `src/features/team/ui/index.ts` export 추가

## 5. Verification

- [ ] 5.1 팀 없는 상태에서 Empty State 확인
- [ ] 5.2 팀 있는 상태에서 팀 카드 표시 확인
- [ ] 5.3 팀 생성하기+ 탭에서 /team/create 이동 확인
