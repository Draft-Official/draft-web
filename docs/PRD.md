# DRAFT PRD v1.2 (Code-Truth Snapshot)

> 기준일: 2026-02-27
> 
> 기준 커밋: `a5126b1`
> 
> 기준 원칙: "문서가 아니라 코드가 정답". 이 문서는 기획 의도 문서가 아니라 현재 코드가 실제 제공하는 제품 동작을 고정한다.

---

## 0. 문서 목적

1. 현재 프로젝트의 기능/흐름/권한을 코드 기준으로 상세하게 명세한다.
2. 구현 완료, 부분 구현, 목업, 플레이스홀더를 분리한다.
3. UX/기능 부족점과 RLS/보안 위험을 같이 기록한다.
4. 바로 실행 가능한 개선 우선순위(P0/P1/P2)를 제공한다.

---

## 1. 제품 현재 정의 (한 줄)

DRAFT는 **카카오 OAuth + 전화번호 인증 기반**으로,
**게스트 모집 경기 생성/신청/승인/입금확인/취소**, **팀 생성/가입/팀투표**, **일정 관리**, **알림**, **마이페이지 설정**을 제공하는 모바일 중심 웹앱이다.

---

## 2. 전역 구조와 동작 규칙

### 2.1 아키텍처

- 라우팅 엔트리: `app/*`
- 실제 페이지 로직: `src/pages/*`
- 도메인/비즈니스: `src/features/*`, `src/entities/*`
- 공용/인프라: `src/shared/*`

즉, App Router는 어댑터 레이어이고 실제 화면/로직은 `src` 레이어에 집중되어 있다.

### 2.2 전역 레이아웃

- 기본: 상단 헤더 + 하단 탭(모바일), 사이드바(데스크탑)
- Bare 레이아웃: `/login`, `/auth*`, `/signup/verify`
- 비-Bare 구간은 `SignupVerifyGuard`가 적용되어 전화인증/실명 미완료 유저를 `/signup/verify`로 강제 이동시킨다.

### 2.3 전역 인증 게이트

- Middleware 보호 경로:
  - `/matches/create`
  - `/schedule`
  - `/my`
  - `/team`
  - `/signup/verify`
- 미인증 접근 시 `/auth/login?redirect=...`로 이동
- 인증 완료 유저의 `/auth/login`, `/auth/signup` 접근 시 redirect 처리

### 2.4 데이터 접근 패턴

- UI에서 직접 Supabase 호출이 일부 존재하지만, 기본 패턴은 feature/entity service를 통한 접근.
- React Query 기반 캐시/무효화가 주요 상태 동기화 수단.

---

## 3. 라우트 인벤토리 (코드 기준)

## 3.1 인증/가입

| Route | 접근 | 실제 기능 | 상태 |
|---|---|---|---|
| `/login` | 공개 | 카카오 OAuth 시작, redirect 지원, 강제 재인증 플래그 지원 | 구현 |
| `/auth/login` | 공개 | 로그인 필요 브리지 페이지 | 구현 |
| `/auth/callback` | 공개 | OAuth code 교환 후 세션 생성/redirect | 구현 |
| `/auth/auth-code-error` | 공개 | 인증 실패 안내 페이지 | 구현 |
| `/signup/verify` | 로그인 필요 | 실명 입력 + 전화번호 인증 2단계 보강 | 구현 |

## 3.2 홈/매치

| Route | 접근 | 실제 기능 | 상태 |
|---|---|---|---|
| `/` | 공개 | 모집 경기 무한 리스트, 다중 필터, 신청상태 뱃지, 알림 벨 | 구현 |
| `/matches/create` | 로그인+가입보강 필요 | 경기 생성/수정 폼(`?edit=`), 최근 경기 불러오기, 이탈방지 | 구현 |
| `/matches/[id]` | 공개 | 경기 상세, 신청/취소, 공유, 공지 표시, 호스트 메뉴 | 부분 구현 |
| `/matches/[id]/manage` | 로그인 필요 | 호스트 상세관리(승인/거절/입금확인/공지/모집수정/취소) | 구현 |

## 3.3 일정/알림

| Route | 접근 | 실제 기능 | 상태 |
|---|---|---|---|
| `/schedule` | 로그인 필요 | 참여/관리 탭, 타입/상태 필터, 카드 액션(송금완료/취소/투표) | 구현 |
| `/notifications` | 사실상 로그인 의존 | 알림 목록, 단건 읽음, 전체 읽음, 타입별 라우팅 | 구현 |
| `/chat` | 로그인 필요 | 채팅 인박스(전체/호스트/게스트), 경기별 문의 대화 진입 | 구현 |
| `/chat/rooms/[roomId]` | 로그인 필요 | 1:1 문의 채팅방(실시간 메시지, 읽음 처리) | 구현 |

## 3.4 팀

| Route | 접근 | 실제 기능 | 상태 |
|---|---|---|---|
| `/team` | 로그인 필요 | 나의 팀/팀 생성하기 탭 | 구현 |
| `/team/create` | 로그인 필요 | 3-step 팀 생성(정보/일정/특성) | 구현 |
| `/team/[code]` | 로그인 필요 | 팀 상세(홈/일정/멤버), 멤버십별 탭 노출 | 구현 |
| `/team/[code]/match/create` | 로그인 필요 | 팀 운동 생성(날짜/시간/장소/공지 입력 UI) | 부분 구현 |
| `/team/[code]/matches/[matchId]` | 로그인 필요 | 팀운동 상세 + 투표 + 투표현황 | 구현 |
| `/team/[code]/matches/[matchId]/manage` | 로그인 필요 | 리더/매니저용 팀운동 관리 뷰 | 부분 구현 |
| `/team/[code]/members/pending` | 로그인 필요 | 가입 신청 승인/거절, 멤버 추방 | 구현 |
| `/team/[code]/settings` | 로그인 필요 | 팀 설정(리더:수정/계좌/위임/삭제, 멤버:탈퇴) | 구현 |
| `/team/[code]/settings/edit` | 로그인 필요 | 팀 프로필 편집 | 구현 |
| `/team/[code]/manage` | 로그인 필요 | 준비중 화면 | 플레이스홀더 |

## 3.5 마이

| Route | 접근 | 실제 기능 | 상태 |
|---|---|---|---|
| `/my` | 로그인 필요 | 프로필 카드/수정, 알림설정, 결제, 지원, 계정 메뉴 | 구현 |
| `/my/payment/bank-account` | 로그인 필요 | 개인 계좌 저장/수정 | 구현 |
| `/my/account/phone` | 로그인 필요 | 전화번호 인증/변경 | 구현 |
| `/my/account/email` | 로그인 필요 | 준비중 페이지 | 플레이스홀더 |
| `/my/account/password` | 로그인 필요 | 준비중 페이지 | 플레이스홀더 |
| `/my/account/social` | 로그인 필요 | 준비중 페이지 | 플레이스홀더 |
| `/my/notices` | 공개 | 시스템 공지 목록 | 구현 |
| `/my/faq` | 공개 | FAQ 정적 페이지 | 구현 |
| `/my/contact` | 로그인 필요 | `/chat` 리다이렉트(레거시 문의 링크) | 구현 |
| `/my/privacy` | 공개 | 개인정보처리방침 | 구현 |
| `/my/terms` | 공개 | 이용약관 | 구현 |

## 3.6 대회

| Route | 접근 | 실제 기능 | 상태 |
|---|---|---|---|
| `/tournaments/create` | 로그인 필요 | 준비중 | 플레이스홀더 |
| `/tournaments/[id]` | 로그인 필요 | 대회 상세 | 목업 데이터 기반 |
| `/tournaments/[id]/manage` | 로그인 필요 | 대회 관리 | 목업 데이터 기반 |

## 3.7 시스템 라우트

| Route | 기능 | 상태 |
|---|---|---|
| `/loading` | 전역 로딩 UI | 구현 |
| `/error` | 전역 에러 UI | 구현 |
| `/not-found` | 404 UI | 구현 |

## 3.8 API 라우트

| Endpoint | 인증 | 기능 | 상태 |
|---|---|---|---|
| `POST /api/phone-verification/request` | 필요 | 전화인증 요청 생성 | 구현 |
| `GET /api/phone-verification/check` | 필요 | IMAP 기반 인증 확인 | 구현 |
| `GET /api/search-places` | 불필요 | 카카오 장소 검색 프록시 | 구현 |
| `GET /api/account/delete` | 필요 | 탈퇴 전 확정자 수 조회 | 구현 |
| `POST /api/account/delete` | 필요 | 탈퇴 실행(정리+익명화+auth 삭제) | 구현 |

---

## 4. 기능 상세 명세

## 4.1 인증/가입 보강

### 로그인

- 로그인 UI는 카카오 버튼 중심.
- redirect 파라미터를 callback `next`로 유지.
- 강제 재로그인 시 카카오 `prompt=login` 사용.

### 가입 보강(`signup/verify`)

- Step 1: 실명 입력(`users.real_name`)
- Step 2: 전화 인증(`users.phone`, `users.phone_verified`)
- 완료 전에는 `SignupVerifyGuard`에 의해 주요 화면 접근이 차단됨.

### 전화 인증 구현 상세

- 요청 제한: 1시간 내 5회
- 코드 만료: 5분
- 대기 화면에서 3초 간격 polling
- 실제 확인은 IMAP 메일함에서 코드 포함 문자 메일을 읽는 방식

## 4.2 홈(모집 경기 탐색)

- 무한 스크롤(infinite query)
- 필터 로컬 저장(localStorage)
- 필터 종류:
  - 날짜
  - 포지션
  - 지역
  - 시작시간 범위
  - 최대 참가비
  - 최소 빈자리
  - 성별
  - 연령대
  - 경기 형식
  - 마감 경기 제외
- 신청 상태 뱃지 반영:
  - `PENDING`
  - `PAYMENT_PENDING`
  - `CONFIRMED`

## 4.3 경기 생성/수정

- 생성과 수정이 동일 폼으로 통합(`?edit=`)
- 최근 경기 불러오기 지원
- 폼 이탈 방지 다이얼로그 제공
- 섹션 구성:
  - 기본정보(날짜/시간/장소/참가비)
  - 시설
  - 모집인원
  - 경기스펙(성별/레벨/연령)
  - 경기방식/룰
  - 운영정보(주최자/계좌/연락/공지)
- 주요 검증:
  - 날짜/장소 필수
  - 모집 1명 이상
  - 계좌 정보 형식
  - 전화번호 인증 여부

## 4.4 경기 상세/신청

- 상세 섹션:
  - 히어로
  - 공지
  - 모집현황
  - 경기/시설 정보
  - 호스트 정보
  - 정책
- 신청 모달:
  - 본인 + 동반인 정보 입력
  - 팀 선택 가능
  - 부족 프로필값 업데이트 연동
- 신청 취소:
  - 게스트 직접 취소 가능
  - 호스트 취소/강제 취소 분기 존재

## 4.5 일정(참여/관리)

### 참여 탭

- 본인 신청 경기 + 팀운동/대회 카드 혼합 표시
- 상태/종류/지난경기 필터
- 카드에서 수행 가능한 액션:
  - 송금 완료 알림
  - 신청 취소
  - 팀 투표

### 관리 탭

- 본인이 호스트인 경기 목록
- 신청자 승인/거절/입금확인
- 모집 인원 수정
- 공지 발송
- 경기 취소(공지 동시 발송)

## 4.6 팀 도메인

### 팀 생성

- 3단계 입력:
  - 팀 정보(이름/소개/코드/로고)
  - 운동 정보(요일/시간/홈구장)
  - 팀 특성(성별/평균 나이/평균 실력)
- 팀 코드 중복 체크 포함
- 팀 생성 시 트리거로 생성자를 `LEADER` 자동 등록

### 팀 상세

- 홈/일정/멤버 탭
- 비멤버는 홈만 접근 가능
- 멤버십 상태별 동작:
  - 비로그인: 로그인 유도
  - 비멤버: 가입 신청
  - `PENDING`: 승인 대기 표시
  - `ACCEPTED`: 설정/초대 버튼 활성

### 팀 멤버 관리

- 리더/매니저: 가입 신청 승인/거절
- 리더: 멤버 추방/팀 삭제/소유자 위임
- 멤버: 팀 탈퇴

### 팀운동/투표

- 팀운동 생성 시 팀원 전체에 `TEAM_VOTE` application 생성
- 투표 상태:
  - `PENDING`
  - `CONFIRMED`
  - `LATE`
  - `MAYBE`
  - `NOT_ATTENDING`
- 투표 마감(`CLOSED`) 시 변경 제한
- 게스트 추가 기능: TEAM_VOTE 참여자에 게스트 추가 가능

## 4.7 알림

- 읽지 않은 개수 polling(30초)
- 알림 클릭 시 match_type/team_code 기반으로 이동 경로 결정:
  - 게스트 모집 경기 상세/관리
  - 팀운동 상세/관리
  - 대회 상세/관리
- `HOST_ANNOUNCEMENT`는 announcements 메시지 본문까지 조회하여 표시

## 4.8 마이페이지/계정

- 프로필 수정 모달
- 계좌 관리
- 전화번호 변경(인증)
- 알림 설정 토글
- 공지/FAQ/채팅 문의/약관/개인정보 페이지
- 탈퇴 플로우:
  - 사전 확정자 수 조회
  - 경고/확인 체크
  - 탈퇴 실행 시 매치/신청/팀멤버십 정리 + 유저 익명화 + Auth user 삭제

---

## 5. 상태 전이 명세

## 5.1 게스트 신청(application source=`GUEST_APPLICATION`)

- 생성: `PENDING`
- 호스트 승인: `PAYMENT_PENDING`
- 호스트 입금확정(RPC): `CONFIRMED` + `confirmed_at`
- 호스트 거절: `REJECTED`
- 취소(RPC): `CANCELED` + `cancel_type`, `canceled_by`, `cancel_reason`

## 5.2 팀 투표(application source=`TEAM_VOTE`)

- 기본: `PENDING`
- 선택 상태: `CONFIRMED`, `LATE`, `MAYBE`, `NOT_ATTENDING`
- 경기 상태가 `CLOSED`면 투표 변경 차단

## 5.3 경기(match)

- 주요 상태: `RECRUITING`, `CLOSED`, `CONFIRMED`, `ONGOING`, `FINISHED`, `CANCELED`
- 종료시간 경과 시 `finish_ended_matches()`로 `FINISHED` 전환

---

## 6. 데이터 모델 요약

핵심 테이블:

- `users`: 프로필, 실명, 전화인증, `metadata`, `account_info`, `operation_info`
- `gyms`: 장소, 좌표, `facilities` JSONB
- `matches`: 경기 본체, `short_id`, `match_type`, `recruitment_setup`, `match_rule`, `operation_info`, `account_info`
- `applications`: 신청/투표 공용, `source`, `participants_info`, `payment_notified_at`, `confirmed_at`
- `teams`, `team_members`, `team_fees`
- `notifications`
- `announcements`
- `user_settings`
- `phone_verifications`

---

## 7. RLS/보안 진단 (코드 + migration 기준)

### 7.1 정책 스냅샷

| 테이블 | 정책 요약 | 평가 |
|---|---|---|
| `users` | select(활성 프로필 + 본인), insert/update self-only | 양호 |
| `gyms` | select 공개, insert `WITH CHECK (true)` | 완화됨 |
| `matches` | select 공개, insert `WITH CHECK (true)`, update host | 완화됨 |
| `applications` | select (본인/호스트), insert `WITH CHECK (true)`, update `USING (true)` | 위험 |
| `notifications` | select/update 본인, insert `WITH CHECK (TRUE)` | 위험 |
| `teams` | 로그인 사용자 select/insert, 리더만 update/delete | 양호 |
| `team_members` | 가입신청 insert 제한, 리더/매니저 update 분리, self delete 제한 | 양호 |
| `team_fees` | 팀원 select, 리더/매니저 write, 리더 delete | 양호 |
| `user_settings` | 본인만 select/insert/update | 양호 |
| `announcements` | 작성자/확정신청자 select, host insert(match), 작성자 update | 양호 |
| `phone_verifications` | 본인만 ALL | 양호 |

### 7.2 핵심 위험 (점검 기준 + 현재 상태)

- 아래 항목은 초기 점검 시점 위험이며, 2026-03-03 적용 기록(12장) 기준으로 상태를 함께 표기한다.

#### P0

1. `applications` update가 `USING (true)` [해결]
- 잘못된 클라이언트 또는 악의적 요청이 신청 상태를 임의 갱신할 여지가 큼.

2. `notifications` insert가 `WITH CHECK (TRUE)` [해결]
- 클라이언트에서 직접 notification insert를 수행하는 코드와 결합되어 알림 스푸핑 표면이 넓다.

3. `matches`/`applications` insert 광범위 허용 [부분완화]
- 인증 여부/소유권 조건이 약해 데이터 오염 가능성이 크다.

4. `SECURITY DEFINER` RPC 호출자 검증 부재 [해결]
- `confirm_application_with_count`, `cancel_application_with_count`가 내부에서 호출자 권한을 검증하지 않는다.
- execute 권한 하드닝 스크립트도 리포지토리 내에서 확인되지 않는다.

5. `users` 공개 insert/update 정책 잔존 [해결]
- `All Public Users Insert/Update`로 인해 anon/authenticated에서 프로필 변조 위험이 존재.

#### P1

1. Auth callback 라우트의 상세 로그 출력
- URL/파라미터/세션 결과를 콘솔로 노출.

2. `/api/search-places` 레이트리밋 부재 [부분완화]
- 2026-03-03 기준 로그인 사용자만 호출 가능하도록 제한됨.
- 인증 사용자 기준 과도 호출(봇/자동화) 방지는 별도 레이트리밋이 필요.

### 7.3 트리거 드리프트 리스크

- `notify_on_application_change()`가 여러 migration에서 재정의됨.
- `20260223_fix_team_vote_notification.sql`에서 추가된 TEAM_VOTE 제외 분기가
  `20260224_fix_payment_confirmed_notification.sql`에서 소실됨.
- 배포 환경 순서/상태에 따라 알림 동작이 달라질 위험이 있다.

---

## 8. UX/기능 갭 리뷰 (코드 근거)

## 8.1 P0/P1 결함

1. 팀운동 생성 공지 미저장 (P0) [해결]
- 현상: 생성폼의 `notice` 입력이 실제 생성 payload에 전달되지 않음.
- 영향: 공지 작성 UX가 동작하지 않음(입력은 되지만 저장 안 됨).

2. 팀운동 관리자 투표 관리 정책 재정의(X 액션 기반) (P1) [해결]
- 정책: 관리자 대리 "임의 상태 변경" 다이얼로그는 제거하고, 관리 화면의 `X` 액션만 허용.
  - 팀원 `X`: 해당 팀원 투표를 `NOT_ATTENDING`으로 변경
  - 게스트 `X`: 해당 게스트만 참여자 목록에서 제외
- 영향: 과도한 상태 변경 UI를 제거하면서 필요한 운영 제어(불참 전환/게스트 제외)만 유지.

3. 마이페이지 알림 설정 `notifyAnnouncement` 토글 누락 (P1) [해결]
- 현상: DTO에는 필드가 있으나 UI field union/map에서 제외됨.
- 영향: 공지 알림 ON/OFF 불가.

4. 매치 상세 타입 분기 불일치 (P0) [해결]
- 현상: `/matches/[id]`에서 `matchData.type`을 참조하지만 실제 DTO 필드는 `matchType`.
- 영향: 타입 분기가 기본값으로 고정될 가능성이 큼.

5. 경기 취소 일괄 처리에서 `PAYMENT_PENDING` 누락 (P0) [해결]
- 위치:
  - `useCancelMatchFlow`
  - 계정탈퇴 서버 정리(`cancelActiveMatchesAndApplications`)
- 영향: 취소 후에도 입금대기 신청이 잔존할 수 있음.

6. 알림 트리거 재정의 드리프트 (P1) [해결]
- 현상: TEAM_VOTE 제외 로직이 최신 재정의에서 누락.
- 영향: 팀투표 상태변경이 게스트 알림으로 오발송될 수 있음.

7. 게스트 송금완료 알림 클라이언트 직접 insert (P0) [해결]
- 현상: `useConfirmPaymentByGuest`가 notifications insert를 직접 호출.
- 영향: 완화된 RLS와 결합 시 오남용 위험 증가.

8. 팀 `regular_day` 스키마 드리프트 (P1) [해결]
- `20260303203000_p1_regular_day_multi_day_alignment.sql`로 `teams.regular_day`를 `text[]`로 정렬.
- 단일값 레거시 데이터는 배열로 승격하고, 트리거에서 공백/중복 제거 + MON~SUN 검증을 강제.

## 8.2 UX/제품 완성도 갭

1. 플레이스홀더 페이지 잔존 (P1)
- `/team/[code]/manage`
- `/my/account/email`, `/my/account/password`, `/my/account/social`
- `/tournaments/create`

2. 대회/팀운동 상세/관리 일부 목업 의존 (P1)
- `features/schedule/model/mock-data.ts` 기반 컴포넌트 다수.
- 실데이터와 UX 일관성 저하.

3. 중복 인증 가드 체계 (P2)
- middleware + 페이지 useEffect redirect + layout guard가 중복되어
  상황에 따라 불필요한 로딩/리다이렉트 체감 가능.

4. 운영 로그 과다 (P2)
- 일부 query/auth 경로에 verbose log가 남아 있음.

## 8.3 품질 갭

1. 테스트 부재 (P1)
- `src`, `app` 기준 unit/integration/e2e 테스트 파일 사실상 없음.
- 회귀 위험 대비 장치 부족.

---

## 9. 우선순위 백로그

## 9.1 P0 (즉시) - 완료

1. `applications`, `matches`, `notifications` RLS 최소권한 재설계 [완료]
2. RPC 하드닝 [완료]
3. 핵심 결함 수정 [완료]

- 정책 메모: 정산 확인 강제는 현재 UI 확인만 채택(서버 강제는 보류).

## 9.2 P1 (단기)

1. 관리자 투표 X 액션 유지보수
- `VotingAccordion`에서 팀원 `불참`/게스트 `제외` 동작 회귀를 우선 보장.

2. 플레이스홀더/목업 최소화
- 최소한 비노출 처리 또는 명확한 준비중 라벨/플래그 분리.

3. 테스트 최소 도입
- 신청 승인/확정/취소, 팀가입/투표, 알림 트리거 회귀 테스트 우선.

4. `/api/search-places` 레이트리밋 추가
- 로그인 사용자만 허용된 상태에서 IP/사용자 단위 호출 제한을 적용.

## 9.3 P2 (중기)

1. 인증 가드 단순화
- middleware 중심으로 통일하고 클라이언트 중복 가드 정리.

2. 로깅 정책 정리
- 민감정보 마스킹/환경별 로그 레벨 구분.

3. 대회/팀운동 실데이터 전환
- mock-data 제거 및 API 통합.

---

## 10. 결론

- 핵심 사용자 플로우(경기 모집/신청/관리, 팀 운영, 알림, 마이페이지)는 실제 동작한다.
- P0 보안/정합성 수선은 2026-03-03 기준 반영되었고, 현재 우선순위는 P1 잔여 과제(관리자 투표 UX, 테스트 보강)다.

---

## 11. 문서 운영 규칙

1. 이 문서는 "코드-스냅샷" 문서다. 변경 시 코드 근거를 함께 갱신한다.
2. 기능 추가 시 반드시 다음 4개를 같이 업데이트한다.
- 라우트 인벤토리
- 상태 전이
- RLS/보안 섹션
- UX/기능 갭 섹션
3. 문서와 코드가 충돌하면 문서를 수정한다.

---

## 12. 2026-03-03 적용 기록 (P0/P1 진행분)

### 12.1 DB/RLS/RPC 하드닝 적용

- `supabase/migrations/20260303170000_p0_security_hardening.sql` 적용.
- `notifications` INSERT 정책을 `service_role`/DB owner 경로로 제한.
- `matches` UPDATE를 host-only 정책(`matches_update_secure`)으로 고정.
- `applications` 정책을 게스트 신청/TEAM_VOTE 흐름으로 분리.
- `confirm_application_with_count`에 호출자=호스트 검증, TEAM_VOTE 차단, 상태 전이 검증 추가.
- `cancel_application_with_count`에 호출자(호스트/신청자) 검증, cancel 메타데이터 인자 반영 추가.
- `notify_guest_payment_confirmed` RPC 신설(게스트 본인 + `PAYMENT_PENDING`에서만 허용).

### 12.2 앱 코드 정합성 수정

- 게스트 송금완료는 클라이언트 직접 `notifications` insert를 제거하고 RPC 호출로 전환.
- 취소 RPC 호출 시 `cancel_type`, `canceled_by`, `cancel_reason`를 전달하도록 정리.
- 경기 취소 일괄 처리/계정 탈퇴 정리에서 대상 상태에 `PAYMENT_PENDING`을 포함.
- 호스트 경기 취소 UI에서 정산 확인 대상을 `CONFIRMED` + `PAYMENT_PENDING`으로 확장.
  - 기존: 확정자 있을 때만 정산 확인 다이얼로그 노출
  - 변경: 입금 대기 인원만 있어도 정산 확인 다이얼로그 노출
- 마이페이지 알림 설정에 `notifyAnnouncement` 토글을 UI/타입/매퍼까지 연결.
- 매치 상세 타입 분기 필드를 `type`에서 `matchType` 기준으로 수정.
- 팀 운동 생성 시 공지(`operationInfo.notice`)가 실제 payload에 포함되도록 수정.
- 팀 매치 상세에서 경기 관리 메뉴 노출을 host 기준으로 제한(팀 투표 관리 권한과 분리).
- `database.types.ts`에 누락된 `payment_notified_at`/RPC 시그니처 반영.

### 12.3 원격 검증 결과

- 원격 스키마 덤프 기준으로 하드닝 정책/함수 본문 반영 확인.
- 추가로 발견된 잔존 권한 이슈를 운영 SQL로 정리:
  - `All Public Applications*`, `All Public Matches*` 정책 제거.
  - 민감 RPC(`confirm/cancel/notify_guest_payment_confirmed`)의 `anon` execute 제거.

### 12.4 남은 결정 사항

- 현재 코드 기준 경기 취소 일괄 처리에는 `PAYMENT_PENDING`이 포함된다.
- 현재 UI 정책은 "확정자/입금대기 인원 존재 시 정산 확인 체크 + 취소 사유 입력 후 취소 허용"이다.
- 서버는 정산 완료 여부를 강제 검증하지 않으므로, 정책 강제를 원하면 서버 측 검증 필드/플로우를 별도로 설계해야 한다.

### 12.5 P1 알림 트리거 단일화

- `supabase/migrations/20260303173000_p1_unify_application_notification_trigger.sql` 추가.
- `notify_on_application_change` 최종본을 단일화:
  - TEAM_VOTE 업데이트는 알림 제외
  - `should_notify` 기반 사용자 알림 설정 반영
  - `payment_notified_at IS NOT NULL`일 때만 `GUEST_PAYMENT_CONFIRMED` 발송

### 12.6 P0 권한 백스톱 추가

- `supabase/migrations/20260303180000_p0_permissions_backstop.sql` 추가.
- 원격 검증에서 확인된 잔존 권한 리스크 정리:
  - `users`의 공개 insert/update 정책 제거, self-only 정책으로 고정
  - 내부 helper/trigger 함수의 `anon`/`authenticated` EXECUTE 제거
  - `ALTER DEFAULT PRIVILEGES`에서 `anon`/`authenticated` 기본 `ALL` 제거

### 12.7 P1 다중요일 정합 + 장소검색 인증 제한

- `supabase/migrations/20260303203000_p1_regular_day_multi_day_alignment.sql` 추가.
  - `teams.regular_day`를 다중요일 `text[]` 기준으로 정렬.
  - 단일 문자열/공백/중복 레거시 값을 정규화하고 CHECK/트리거를 array 기준으로 재정의.
- `app/api/search-places/route.ts`에서 로그인 사용자만 호출 가능하도록 인증 검증 추가.
- `src/entities/team/api/team-service.ts`에서 빈 요일 배열 저장값을 `null`로 정규화.

### 12.8 P1 팀운동 투표 관리 UX 재정의

- 관리자 대리 "투표 변경 다이얼로그" 경로를 제거하고 `X` 액션 기반으로 단순화.
  - 팀원 `X`: `NOT_ATTENDING`으로 변경
  - 게스트 `X`: `participants_info`에서 해당 게스트만 제외
- 적용 위치:
  - `src/features/team/ui/components/match/voting-accordion.tsx`
  - `src/features/team/api/match/mutations.ts`
  - `src/entities/team/api/team-service.ts`
- 후속 정합성 수정:
  - 불참 그룹에서 "사유 있는 항목만 렌더" 필터를 제거하여, 사유 없는 불참자도 아코디언 내부에 정상 노출되도록 수정.
  - 인증 콜백에서 URL/파라미터/세션 결과 상세 로그를 제거하고 실패 로그만 최소화.
