# Tasks: Form 상수값 대문자 통일

## 1. Constants 확장

- [ ] 1.1 `match-constants.ts`에 DEFAULT 상수 추가
  - `GENDER_DEFAULT`, `PLAY_STYLE_DEFAULT`, `REFEREE_TYPE_DEFAULT`
  - `COURT_SIZE_DEFAULT`, `POSITION_DEFAULT`

## 2. Schema 업데이트

- [ ] 2.1 `schema.ts`의 `gameFormat` enum을 대문자로 변경
  - `['internal_2', ...]` → `['INTERNAL_2WAY', ...]`
- [ ] 2.2 `schema.ts`의 `rules.referee` enum을 대문자로 변경
  - `['self', 'member', 'pro']` → `['SELF', 'STAFF', 'PRO']`
- [ ] 2.3 `schema.ts`의 `courtSize` enum을 대문자로 변경
  - `['regular', 'short', 'narrow']` → `['REGULAR', 'SHORT', 'NARROW']`

## 3. Form 초기값 변경

- [ ] 3.1 `match-create-view.tsx` 초기값을 Constants 참조로 변경
  - `useState("men")` → `useState(GENDER_DEFAULT)`
  - `useState("internal_2")` → `useState(PLAY_STYLE_DEFAULT)`
  - `useState("self")` → `useState(REFEREE_TYPE_DEFAULT)`
- [ ] 3.2 `match-create-game-format.tsx` 기본값을 Constants 참조로 변경
  - `setGameFormatType("internal_2")` → `setGameFormatType(PLAY_STYLE_DEFAULT)`
  - `setRefereeType("self")` → `setRefereeType(REFEREE_TYPE_DEFAULT)`
- [ ] 3.3 Facilities 관련 기본값 변경
  - `setCourtSize("")` → `setCourtSize(COURT_SIZE_DEFAULT)` 또는 빈값 유지

## 4. Mapper 정리

- [ ] 4.1 `match-create-mapper.ts`의 `gameFormatMap` 제거
- [ ] 4.2 `match-create-mapper.ts`의 `refereeMap` 제거
- [ ] 4.3 `match-create-mapper.ts`의 `sizeMap` 제거
- [ ] 4.4 각 필드에서 값 변환 없이 직접 전달

## 5. "최근 경기 불러오기" 정리

- [ ] 5.1 `match-create-view.tsx`의 `fillFromRecentMatch` 함수에서 `formatMap` 제거
- [ ] 5.2 `fillFromRecentMatch` 함수에서 `refMap` 제거
- [ ] 5.3 DB 값을 그대로 setState에 전달

## 6. Facilities Prefill 정리

- [ ] 6.1 `prefillFacilities` 함수의 `sizeMap` 제거
- [ ] 6.2 DB의 `court_size_type` 값을 그대로 사용

## 7. Position UI 변경

- [ ] 7.1 `apply-modal.tsx`에서 `POSITION_MAP`, `POSITION_MAP_REVERSE` 제거
- [ ] 7.2 `POSITION_OPTIONS` import하여 사용
- [ ] 7.3 Form state를 대문자 코드('G', 'F', 'C')로 변경
- [ ] 7.4 `app/my/page.tsx`에서 동일하게 처리

## 8. 검증

- [ ] 8.1 빌드 성공 확인 (`npm run build`)
- [ ] 8.2 타입 에러 없음 확인
- [ ] 8.3 경기 생성 플로우 테스트
- [ ] 8.4 "최근 경기 불러오기" 테스트
- [ ] 8.5 경기 신청 플로우 테스트
