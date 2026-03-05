# Match Chat UX/Architecture Design

## Context

PRD(`docs/PRD.md`) 기준 현재 문의 플로우는 두 갈래다.
- 매치 상세 `문의하기`: 연락처 모달(전화/오픈채팅 URL) 표시
- 마이페이지 `/my/contact`: 외부 카카오 채널 링크 이동

요청사항은 다음 3가지다.
1. 문의하기를 앱 내 채팅으로 대체
2. 호스트가 경기별 채팅을 쉽게 확인
3. 당근마켓 채팅 감성(간결한 인박스 + 대화방 중심 흐름)

## Goals

- 문의 채널을 외부 링크/연락처 복사 중심에서 인앱 1:1 채팅으로 전환
- 게스트는 매치 상세에서 즉시 문의 시작
- 호스트는 경기 관리 화면에서 해당 경기 채팅방을 빠르게 탐색
- 채팅 탭 진입점을 채팅 인박스로 통일

## Non-Goals

- 파일/이미지 전송, 읽음 상태 per-message, 신고/차단, 자동 번역
- 푸시 알림/알림 타입 확장
- 팀 채팅/그룹 채팅

## UX Principles (Karrot-style adaptation)

- 리스트 우선: 대화상대, 최근 메시지, 시간, 읽지 않음 배지 중심
- 방 진입 단순화: 탭/모달 최소화, 터치 1회 진입
- 말풍선 대비 강조: 내 메시지는 브랜드 톤, 상대 메시지는 중립 톤
- 입력행 고정: 하단 입력바 + 전송 버튼으로 연속 대화 집중

## Information Architecture

- `/chat`:
  - 채팅 인박스(문의 대화 목록)
  - 모드 필터: 전체 / 호스트 / 게스트
  - 경기 필터(matchId query)로 특정 경기 채팅만 빠르게 보기
- `/chat/rooms/[roomId]`:
  - 채팅방 상세(메시지 리스트 + 입력)

Entry points:
- 게스트: `/matches/[id]`의 `문의하기` 버튼 -> 채팅방 생성/재사용 후 방으로 이동
- 호스트: `/matches/[id]/manage` 내 채팅 섹션 -> 해당 경기 채팅방 리스트 -> 방 이동
- 마이페이지 고객지원 메뉴: `채팅 문의` 링크로 `/chat` 진입

## Data Model

### `match_chat_rooms`
- 목적: 경기 단위 1:1 문의 room 메타데이터
- 핵심 컬럼:
  - `match_id`, `host_id`, `guest_id`
  - `host_last_read_at`, `guest_last_read_at`
  - `last_message_at`, `last_message_preview`
- 제약:
  - `UNIQUE(match_id, guest_id)` (게스트 기준 경기별 1개 room)
  - `CHECK(host_id <> guest_id)`

### `match_chat_messages`
- 목적: room 내 텍스트 메시지
- 핵심 컬럼: `room_id`, `sender_id`, `body`, `created_at`
- 제약: 공백/빈문자열 방지 + 길이 제한(1~1000)

### Derived fields
- unread count(클라이언트 계산):
  - 내 역할이 host면 `host_last_read_at` 이후 + `sender_id != me` 메시지 count
  - guest면 `guest_last_read_at` 기준

## RLS/Security

`match_chat_rooms`
- SELECT/UPDATE: `auth.uid()`가 `host_id` 또는 `guest_id`
- INSERT:
  - `auth.uid()`가 host/guest 중 하나
  - `matches.host_id = match_chat_rooms.host_id`를 만족해야 함

`match_chat_messages`
- SELECT/INSERT: room 참가자만 접근
- INSERT 추가 조건: `auth.uid() = sender_id`

## Write Flow

1. 채팅 시작(매치 상세)
- 클라이언트가 `match_id`, `host_id`, `guest_id`로 room insert 시도
- unique 충돌이면 기존 room 조회 후 재사용

2. 메시지 전송
- `match_chat_messages` insert
- trigger가 room의 `last_message_*` 갱신
- sender의 `*_last_read_at`를 자동 갱신

3. 읽음 처리
- room 진입/새 메시지 수신 시 내 역할의 `*_last_read_at`를 now로 업데이트

## Host-Centric UX for Per-Match Review

- 호스트 경기 상세 관리 화면(`/matches/[id]/manage`)에 `문의 채팅` 섹션 추가
- 해당 경기 room만 노출하고 최근 대화순으로 정렬
- 각 room 카드에:
  - 상대 게스트
  - 최근 메시지 프리뷰
  - 시간
  - unread 배지
- 클릭 시 채팅방으로 직행

## Architecture Fit (Project conventions)

- App Router adapter 유지:
  - `app/(main)/chat/...`는 `src/pages/chat/...` re-export
- 비즈니스 로직 분리:
  - DB 접근: `src/entities/chat/api/chat-service.ts`
  - 유즈케이스/DTO/UI: `src/features/chat/*`
- 기존 문의 UI 교체:
  - `src/features/match/ui/components/detail/host-section.tsx`
  - `/my/contact`는 `/chat`으로 리다이렉트

## Realtime Strategy

- 채팅방 상세에서 Supabase realtime(`postgres_changes` INSERT on `match_chat_messages`) 구독
- 이벤트 수신 시:
  - room messages query invalidate
  - room list query invalidate
  - 필요 시 읽음 timestamp 갱신

## Error Handling

- room 생성 실패: toast + 재시도 안내
- 메시지 전송 실패: 입력 유지 + toast
- 권한 없음(RLS): room not found/forbidden로 fallback 안내
- 빈 room: 시작 안내 문구 표시

## Edge Cases & 대응

- 비로그인 사용자의 채팅 접근
  - 대응: `/chat` 라우트 미들웨어 보호 + 매치 상세 버튼에서 `useRequireAuth` 게이트 적용
- 동일 경기 room 중복 생성 race
  - 대응: `UNIQUE(match_id, guest_id)` + insert 충돌(`23505`) 시 기존 room 재조회
- 호스트가 자기 자신에게 문의하는 케이스
  - 대응: `host_id === guest_id` 차단(서비스 validation + DB check) 및 호스트는 채팅 목록으로 라우팅
- room URL 직접 접근(비참여자)
  - 대응: RLS SELECT 차단 + UI에서 권한 없음 화면 표시
- 메시지 공백/장문 입력
  - 대응: 클라이언트 trim 검증 + DB CHECK(1~1000자)
- 실시간 채널 끊김/백그라운드 탭 복귀
  - 대응: realtime invalidate + query `refetchInterval` 폴백(rooms 10s, messages 5s)
- 읽음 처리 루프/중복 호출
  - 대응: 초기 동기화 플래그 + 마지막 incoming 메시지 id 기준 재호출 방지
- 상대 프로필 누락(닉네임/아바타 null)
  - 대응: fallback 이름/이니셜 아바타 렌더
- 채팅 데이터 없음(신규 유저/신규 경기)
  - 대응: 인박스/호스트 관리 화면 모두 빈 상태 UI 제공

## Rollout

1. Migration 배포
2. DB types 반영
3. chat entity/feature 배포
4. 진입점 연결(매치 상세/호스트 관리/채팅 탭/마이 고객지원 링크)
5. lint/build + 수동 QA

## QA Scenarios

- 게스트가 매치 상세에서 채팅 시작 가능
- 동일 경기 재진입 시 기존 room 재사용
- 호스트가 관리 화면에서 경기별 room 목록 확인 가능
- 양쪽 메시지 송수신 + last message 갱신
- room 진입 후 unread count 감소
- 비참여자가 room URL 직접 접근 시 데이터 노출 없음
