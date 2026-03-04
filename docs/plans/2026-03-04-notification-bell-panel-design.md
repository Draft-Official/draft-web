# Notification Bell Panel Design

## Context

현재 알림 벨은 `/notifications` 페이지로 이동하는 링크다. 요청사항은 데스크톱 상단 헤더의 벨 클릭 시 페이지 이동 대신 즉시 확인 가능한 패널을 여는 것이다.

추가 요구:
- 패널 헤더는 `알림` + 설정 아이콘 형태
- 배경은 흰색
- 기존 `notification` 페이지 구조를 최대한 재사용

## Decision

데스크톱에서는 `Popover` 기반 알림 패널을 열고, 모바일은 기존 페이지 이동을 유지한다.

## Architecture

- `NotificationBell`에 `mode`(`link | panel`)를 추가한다.
- `mode="panel"`일 때는 `Popover` 트리거 버튼으로 렌더링하고, 패널 본문은 새 컴포넌트 `NotificationPanel`에서 담당한다.
- `NotificationPanel`은 헤더(`알림` + 설정 버튼)와 기존 `NotificationList`를 조합한다.
- 현재 `/notifications` 페이지는 유지한다(직접 진입 및 모바일 흐름 보존).

## UX Rules

- 데스크톱 상단 헤더 벨: 패널 토글
- 모바일 벨: 기존처럼 `/notifications` 링크
- 패널은 흰색 배경, 우측 상단 정렬, 둥근 모서리, 그림자
- 알림이 비어 있을 때는 벨 아이콘 중심의 빈 상태를 보여준다

## Data Flow

1. 사용자 벨 클릭
2. `Popover` open
3. `NotificationList`가 기존 query hook(`useNotifications`)로 데이터 조회
4. 알림 클릭 시 읽음 처리 + 대상 라우트 이동

## Risks

- 벨 컴포넌트가 여러 곳에서 재사용되므로 `mode` 기본값을 `link`로 유지해 회귀를 최소화한다.
- 패널 내부 스크롤 높이를 제한하지 않으면 화면을 가릴 수 있어 max-height + overflow를 적용한다.

## Verification

- `npm run lint`
- 데스크톱: 벨 클릭 시 패널 열림/닫힘, 설정 버튼 라우팅 확인
- 모바일: 벨 클릭 시 `/notifications` 이동 유지
- 알림 0건: 빈 상태 UI 표시 확인
