# Match Chat Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 문의하기 플로우를 인앱 채팅으로 전환하고, 호스트가 경기별 문의 채팅을 쉽게 확인/응답할 수 있게 한다.

**Architecture:** Supabase에 `match_chat_rooms`/`match_chat_messages`를 추가하고 RLS로 참가자 접근만 허용한다. `entities/chat`에서 DB 접근을 캡슐화하고, `features/chat`에서 DTO/queries/mutations/UI를 구성한다. 진입점은 매치 상세 문의 버튼, 호스트 관리 상세, 채팅 탭을 연결한다.

**Tech Stack:** Next.js App Router, React Query, Supabase(Postgres + RLS + Realtime), TypeScript, shadcn UI

---

### Task 1: Chat DB schema + RLS + trigger 추가

**Files:**
- Create: `supabase/migrations/20260305210000_add_match_chat.sql`

**Step 1: Write the failing test**
- 실패 기준 정의:
  - chat room/messages 테이블이 없어 쿼리 불가
  - 참가자 기반 접근 제어 불가

**Step 2: Run test to verify it fails**
- Run: 현재 스키마 확인
- Expected: `match_chat_rooms`, `match_chat_messages` 미존재

**Step 3: Write minimal implementation**
- room/messages 테이블 생성
- 인덱스/unique/check 제약
- room/message RLS 정책 추가
- 메시지 insert 시 room 메타(`last_message_at`, `last_message_preview`, sender read-at`) 갱신 trigger 추가

**Step 4: Run test to verify it passes**
- Run: migration SQL 정적 검토
- Expected: 스키마/정책/트리거 정의 완결

### Task 2: DB 타입 확장

**Files:**
- Modify: `src/shared/types/database.types.ts`

**Step 1: Write the failing test**
- 실패 기준: 새 테이블 타입이 없어 TypeScript에서 chat 쿼리 타입 안전성 부재

**Step 2: Run test to verify it fails**
- Run: 타입 참조 시 컴파일 에러 예상

**Step 3: Write minimal implementation**
- `match_chat_rooms`, `match_chat_messages` Table Row/Insert/Update/Relationships 추가
- convenience alias(`MatchChatRoom`, `MatchChatMessage`) 추가

**Step 4: Run test to verify it passes**
- Run: `npm run build` (후속 태스크와 함께)
- Expected: 타입 해석 성공

### Task 3: Chat entity 계층 추가

**Files:**
- Create: `src/entities/chat/index.ts`
- Create: `src/entities/chat/api/chat-service.ts`
- Create: `src/entities/chat/api/keys.ts`
- Create: `src/entities/chat/model/types.ts`

**Step 1: Write the failing test**
- 실패 기준: 채팅 room 조회/생성/메시지 전송/읽음 처리 로직을 호출할 API 부재

**Step 2: Run test to verify it fails**
- Run: feature 레이어에서 import 시 unresolved

**Step 3: Write minimal implementation**
- `ChatService` 구현:
  - `listMyRooms`
  - `listHostRoomsByMatch`
  - `getRoom`
  - `createOrGetRoom`
  - `getMessages`
  - `sendMessage`
  - `markRoomRead`
  - `countUnreadMessages`
- query key helper 추가

**Step 4: Run test to verify it passes**
- Run: TS import/usage 확인
- Expected: entity API를 feature에서 사용 가능

### Task 4: Chat feature hooks + mappers + DTO

**Files:**
- Create: `src/features/chat/index.ts`
- Create: `src/features/chat/model/types.ts`
- Create: `src/features/chat/lib/mappers.ts`
- Create: `src/features/chat/api/keys.ts`
- Create: `src/features/chat/api/queries.ts`
- Create: `src/features/chat/api/mutations.ts`

**Step 1: Write the failing test**
- 실패 기준: UI에서 사용할 room/message DTO, query/mutation hook 부재

**Step 2: Run test to verify it fails**
- Run: UI에서 hook import 시 unresolved

**Step 3: Write minimal implementation**
- room row -> list/detail DTO mapper 추가
- hooks 구현:
  - `useMatchChatRooms`
  - `useHostMatchChatRooms`
  - `useMatchChatRoom`
  - `useMatchChatMessages`
  - `useCreateOrGetMatchChatRoom`
  - `useSendMatchChatMessage`
  - `useMarkMatchChatRead`

**Step 4: Run test to verify it passes**
- Run: TS import/usage 확인
- Expected: view layer에서 모든 chat 데이터 접근 가능

### Task 5: 채팅 인박스/채팅방 UI 구현

**Files:**
- Create: `src/features/chat/ui/chat-inbox-view.tsx`
- Create: `src/features/chat/ui/chat-room-view.tsx`
- Create: `src/features/chat/ui/chat-room-page-view.tsx`
- Modify: `src/pages/chat/page.tsx`
- Create: `src/pages/chat/rooms/[roomId]/page.tsx`
- Create: `app/(main)/chat/rooms/[roomId]/page.tsx`

**Step 1: Write the failing test**
- 실패 기준:
  - `/chat`가 여전히 외부 카카오 링크 화면
  - room 상세 페이지 부재

**Step 2: Run test to verify it fails**
- Run: 현재 `/chat`
- Expected: 기존 ContactView 표시

**Step 3: Write minimal implementation**
- `/chat` -> chat inbox 렌더
- `/chat/rooms/[roomId]` 추가
- 당근 스타일 말풍선/프리뷰/시간/unread UI 적용
- room view에 realtime subscribe + 읽음 처리 연결

**Step 4: Run test to verify it passes**
- Run: 수동 확인
- Expected:
  - 인박스 목록 렌더
  - room 진입/메시지 전송 가능

### Task 6: 문의 시작 진입점 교체(매치 상세)

**Files:**
- Modify: `src/features/match/ui/components/detail/host-section.tsx`
- Modify: `src/features/match/ui/match-detail-view.tsx`

**Step 1: Write the failing test**
- 실패 기준: 문의하기 버튼이 연락처 모달을 여는 기존 동작 유지

**Step 2: Run test to verify it fails**
- Run: 매치 상세에서 문의 클릭
- Expected: contact modal 오픈

**Step 3: Write minimal implementation**
- HostSection 버튼 동작을 callback 기반으로 교체
- MatchDetailView에서 auth 확인 후 room 생성/재사용 -> room 페이지 이동

**Step 4: Run test to verify it passes**
- Run: 수동 확인
- Expected: 문의 클릭 시 채팅방 진입

### Task 7: 호스트 경기별 채팅 접근 개선

**Files:**
- Modify: `src/features/schedule/ui/detail/host-match-detail-view.tsx`

**Step 1: Write the failing test**
- 실패 기준: 호스트 관리 상세에서 해당 경기 문의 채팅을 한 화면에서 볼 수 없음

**Step 2: Run test to verify it fails**
- Run: `/matches/[id]/manage`
- Expected: 채팅 섹션 미표시

**Step 3: Write minimal implementation**
- 해당 경기(`match.id`) room 목록 섹션 추가
- unread/last message 표시 + room 이동 버튼 연결

**Step 4: Run test to verify it passes**
- Run: 수동 확인
- Expected: 경기별 채팅방 탐색 가능

### Task 8: 카피/내비게이션 정리

**Files:**
- Modify: `src/features/my/ui/support-section.tsx`
- Modify: `src/features/my/ui/my-sub-page-shell.tsx`
- Modify: `src/features/my/ui/faq-list.tsx`
- Modify: `src/shared/config/match-constants.ts`

**Step 1: Write the failing test**
- 실패 기준: 문의하기 문구가 외부채널 기준으로 남아 있음

**Step 2: Run test to verify it fails**
- Run: 마이페이지/FAQ/문구 확인
- Expected: 카카오 문의 중심 문구 노출

**Step 3: Write minimal implementation**
- 문의 관련 문구를 채팅 문의 기준으로 정리
- `/chat/rooms/[roomId]`에서 서브페이지 헤더 중복 방지

**Step 4: Run test to verify it passes**
- Run: 수동 확인
- Expected: 채팅 문의 용어 일관

### Task 9: Verification

**Files:**
- N/A

**Step 1: Lint**
Run: `npm run lint`
Expected: exit 0

**Step 2: Build**
Run: `npm run build`
Expected: exit 0

**Step 3: Manual QA**
- 게스트: 매치 상세 -> 채팅 시작 -> 메시지 전송
- 호스트: 경기 관리 상세 -> 경기별 채팅 목록 확인 -> 답장
- 인박스 unread 배지/마지막 메시지 시간 반영 확인
