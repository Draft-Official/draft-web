## 1. API Layer

- [x] 1.1 Add `useTeamMatch` query for single team match detail with gym join
- [x] 1.2 Add `useReopenVoting` mutation to change match status back to RECRUITING
- [x] 1.3 Add `useUpdateMemberVote` mutation for admin to change other member's vote
- [x] 1.4 Add `useUpdateTeamMatch` mutation for match time/location edit
- [x] 1.5 Add `useCancelTeamMatch` mutation to cancel a team match
- [x] 1.6 Verify `createVotesForNewMember` is called in `useApproveJoin` (already exists)

## 2. Team Match Creation Page

- [x] 2.1 Create `/team/[code]/match/create/page.tsx` route file
- [x] 2.2 Create `team-match-create-form.tsx` component in `features/team/ui/components/match/`
- [x] 2.3 Implement auto-fill logic for team defaults (regularDay, time, homeGym)
- [x] 2.4 Add date picker with next regular day pre-selected
- [x] 2.5 Add time range inputs with team defaults
- [x] 2.6 Add gym selector with home gym pre-selected
- [x] 2.7 Add form validation (date, start time, end time, gym required)
- [x] 2.8 Connect form submit to `useCreateTeamMatch` mutation
- [x] 2.9 Redirect to match detail page on successful creation
- [x] 2.10 Add access control: only Leader/Manager can access

## 3. Team Match Detail Page

- [x] 3.1 Create `/team/[code]/matches/[matchId]/page.tsx` route file
- [x] 3.2 Create `team-match-detail-view.tsx` component in `features/team/ui/components/match/`
- [x] 3.3 Display match info header (date, time, location)
- [x] 3.4 Add access control: only team members can view

## 4. Voting Status Card

- [x] 4.1 Create `voting-status-card.tsx` component (→ voting-accordion.tsx)
- [x] 4.2 Display vote counts by status (참석, 늦참, 불참, 미응답)
- [x] 4.3 Display total member count
- [x] 4.4 Connect to `useVotingStatus` query with refetch on vote

## 5. Voter List

- [x] 5.1 Create `voter-list.tsx` component (→ voting-accordion.tsx)
- [x] 5.2 Display each voter's avatar, nickname, and vote status
- [x] 5.3 Group voters by status sections
- [x] 5.4 Handle withdrawn member display ("알 수 없음")
- [x] 5.5 Add badge/chip for vote status styling

## 6. Voting Flow

- [x] 6.1 Integrate existing `vote-dialog.tsx` with match detail page
- [x] 6.2 Add "투표하기" button that opens vote dialog
- [x] 6.3 Show current vote status on button (변경하기 if already voted)
- [x] 6.4 Disable vote button when voting is closed
- [x] 6.5 Connect dialog submit to `useVote` mutation
- [x] 6.6 Show toast on successful vote
- [x] 6.7 Invalidate voting status query on vote success

## 7. Admin Actions

- [x] 7.1 Create `admin-actions.tsx` component for Leader/Manager (→ header kebab menu)
- [x] 7.2 Add "투표 마감" button (Leader/Manager)
- [x] 7.3 Connect to `useCloseVoting` mutation
- [x] 7.4 Add "투표 재오픈" button (Leader only)
- [x] 7.5 Connect to `useReopenVoting` mutation
- [x] 7.6 Add "투표 변경" option in voter list for each member (Leader/Manager)
- [x] 7.7 Create dialog for admin to change member's vote
- [x] 7.8 Connect to `useUpdateMemberVote` mutation

## 8. Team Detail - Non-Member View

- [ ] 8.1 Modify `team-detail-view.tsx` to check membership status
- [ ] 8.2 Show limited info for non-members (name, logo, intro, region)
- [ ] 8.3 Hide 일정/멤버 tabs for non-members
- [ ] 8.4 Modify `team-detail-header.tsx` to show join button for non-members
- [ ] 8.5 Hide settings buttons for non-members

## 9. Team Join Flow

- [ ] 9.1 Add "팀 가입 신청" button in non-member header
- [ ] 9.2 Connect button to `useJoinTeam` mutation
- [ ] 9.3 Show "승인 대기 중" status for pending requests
- [ ] 9.4 Disable join button for users with pending request
- [ ] 9.5 Add login prompt for anonymous users

## 10. Team FAB Updates

- [ ] 10.1 Update `team-fab.tsx` to check role before showing "경기 생성" option
- [ ] 10.2 Hide "경기 생성" for Member role
