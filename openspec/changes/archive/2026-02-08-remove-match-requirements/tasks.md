## 1. 매치 생성 UI 제거

- [x] 1.1 `match-create-view.tsx`에서 `hasShoes`, `hasJersey` 상태 제거
- [x] 1.2 `match-create-view.tsx`에서 준비물 체크박스 UI 제거

## 2. 매치 생성 데이터 처리

- [x] 2.1 `match-create-mapper.ts`에서 requirements를 빈 배열로 고정
- [x] 2.2 `schema.ts`에서 requirements 스키마 제거 또는 빈 배열 기본값 유지

## 3. 프리필 로직 제거

- [x] 3.1 `use-recent-match-prefill.ts`에서 requirements 관련 로직 제거
- [x] 3.2 `match-to-prefill-mapper.ts`에서 requirements 매핑 제거

## 4. 매치 상세 UI 제거

- [x] 4.1 `match-info-section.tsx`에서 준비물 표시 UI 제거

## 5. 검증

- [ ] 5.1 매치 생성 플로우 테스트 (준비물 없이 정상 생성)
- [ ] 5.2 매치 상세 페이지 테스트 (준비물 미표시 확인)
- [ ] 5.3 기존 매치 조회 테스트 (에러 없이 표시)
