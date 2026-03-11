# 낙관적 업데이트 UX 설계

## 목표
- 투표/가입 신청/제거·삭제 액션에서 서버 응답 전에도 UI를 즉시 반영해 체감 지연을 제거한다.
- 실패 시 사용자가 혼란을 느끼지 않도록 자동 롤백과 최신 재동기화를 보장한다.

## 범위
- 투표: `useScheduleVote`, `useVote`, `useAddTeamVoteGuest`, `useRemoveTeamVoteGuest`, `useUpdateMemberVote`
- 생성: `useJoinTeam` (가입 신청 생성)
- 제거/삭제: `useRemoveMember`, `useLeaveTeam`, `useDeleteTeam`

## UX 원칙
1. 버튼 클릭 즉시 화면 상태가 바뀌어야 한다.
2. 실패 시 원래 상태로 즉시 복구되고, 에러 토스트만 남긴다.
3. 성공 시에도 invalidate로 서버 상태를 재확인해 장기 불일치가 남지 않게 한다.

## 기술 설계
- mutation에 `onMutate`를 추가하고 아래 공통 절차를 따른다.
  - 관련 쿼리 `cancelQueries`
  - 이전 캐시 snapshot 저장
  - `setQueryData`/`setQueriesData`로 즉시 반영
  - `onError`에서 snapshot으로 롤백
  - `onSuccess`/`onSettled`에서 invalidate로 재동기화
- 계산이 필요한 투표 요약 값은 순수 함수로 분리해 단위 테스트한다.

## 리스크와 완화
- 리스크: 다양한 캐시 shape(일반/무한스크롤)로 인한 타입/런타임 오류
- 완화: 캐시 패치 함수에서 shape guard 적용, 변경된 페이지만 얕은 복사

