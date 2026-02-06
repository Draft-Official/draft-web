## 1. Cleanup

- [ ] 1.1 `src/features/team/ui/host-dashboard-view.tsx` 삭제
- [ ] 1.2 `src/features/team/model/mock-data.ts` 삭제
- [ ] 1.3 `src/features/team/ui/index.ts` export 정리

## 2. API Layer

- [ ] 2.1 `useMyPendingVoteMatches(userId)` 쿼리 추가 (src/features/team/api/match/queries.ts)

## 3. UI Components

- [ ] 3.1 `src/features/team/ui/team-page-tabs.tsx` 생성 (메인 탭 컨테이너)
- [ ] 3.2 `src/features/team/ui/my-teams-tab.tsx` 생성 (나의 팀 탭)
- [ ] 3.3 `src/features/team/ui/team-create-tab.tsx` 생성 (팀 생성하기+ 탭)

## 4. Page Integration

- [ ] 4.1 `src/app/team/page.tsx` 수정 → TeamPageTabs 렌더링
- [ ] 4.2 `src/features/team/ui/index.ts` export 추가

## 5. Verification

- [ ] 5.1 팀 없는 상태에서 Empty State 확인
- [ ] 5.2 팀 있는 상태에서 팀 카드 표시 확인
- [ ] 5.3 팀 생성하기+ 탭에서 /team/create 이동 확인
