# Tasks: Match 매핑 상수 통합

## 1. Constants 구조 개편

- [x] 1.1 `match-constants.ts`에 DB 값 상수 정의 (GENDER_VALUES, POSITION_VALUES 등)
- [x] 1.2 DB값 → UI 라벨 매핑 객체 추가 (GENDER_LABELS, POSITION_LABELS 등)
- [x] 1.3 UI 스타일 매핑 추가 (GENDER_STYLES 등)
- [x] 1.4 기존 Form/Filter Options을 새 값으로 업데이트
- [x] 1.5 getLabelByValue 헬퍼 함수 추가

## 2. 타입 정의 업데이트

- [x] 2.1 `shared/types/match.ts`의 Gender 타입을 `'MALE' | 'FEMALE' | 'MIXED'`로 변경
- [x] 2.2 Position 타입을 `'G' | 'F' | 'C' | 'B'`로 확인/통일
- [x] 2.3 CostType enum을 constants와 일관되게 정리
- [x] 2.4 `mock-data.ts`를 `types.ts`로 이름 변경 및 정리

## 3. Mapper 리팩터링

- [x] 3.1 `match-mapper.ts`의 inline `genderMap` 제거
- [x] 3.2 `match-mapper.ts`의 inline `costTypeMap` 유지 (CostType enum 변환용)
- [x] 3.3 mapper가 값 변환 없이 타입 변환만 수행하도록 정리
- [x] 3.4 `match-create-mapper.ts`의 gender 변환 로직 제거

## 4. UI 컴포넌트 정리

- [x] 4.1 `match-list-item.tsx`의 `GENDER_CONFIG` 대문자 키로 변경
- [x] 4.2 `hero-section.tsx`의 inline genderLabel 매핑 제거
- [x] 4.3 `match-info-section.tsx`의 gender 비교 대문자로 변경
- [x] 4.4 `app/page.tsx`의 genderMap 제거
- [x] 4.5 `matches/[id]/page.tsx`의 gender 타입 캐스팅 수정
- [x] 4.6 `match-create-view.tsx`의 genderMap 제거
- [x] 4.7 `match-create-game-format.tsx`의 import 수정

## 5. 파일 정리

- [x] 5.1 `mock-data.ts`에서 사용하지 않는 MOCK_MATCHES 배열 삭제
- [x] 5.2 `mock-data.ts`에서 사용하지 않는 getDistrictName 함수 삭제
- [x] 5.3 `mock-data.ts`를 `types.ts`로 이름 변경
- [x] 5.4 모든 import 경로 업데이트 (mock-data → types)

## 6. 검증

- [x] 6.1 빌드 성공 확인 (`npm run build`)
- [x] 6.2 타입 에러 없음 확인

---

## 후속 작업 (별도 PR)

→ **새 proposal로 이동**: [`unify-form-constants-uppercase`](../unify-form-constants-uppercase/proposal.md)

아래 항목들은 동일한 패턴 적용이 필요하나, 범위가 넓어 별도 작업으로 분리:

- [ ] Position: Form에서 한글(`'가드'`) 대신 대문자(`'G'`) 사용
  - `apply-modal.tsx`, `my/page.tsx`의 POSITION_MAP 제거
- [ ] PlayStyle: Form에서 소문자(`'internal_2'`) 대신 대문자(`'INTERNAL_2WAY'`) 사용
  - `match-create-mapper.ts`의 gameFormatMap 제거
- [ ] RefereeType: Form에서 소문자(`'self'`) 대신 대문자(`'SELF'`) 사용
  - `match-create-mapper.ts`의 refereeMap 제거
- [ ] CourtSize: Form에서 소문자(`'regular'`) 대신 대문자(`'REGULAR'`) 사용
  - `match-create-mapper.ts`의 sizeMap 제거
