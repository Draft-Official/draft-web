## 1. Match 타입 수정

- [x] 1.1 `types.ts`에서 `Match.rule.type` 타입을 `PlayStyleValue`로 변경
- [x] 1.2 `types.ts`에서 `Match.rule.referee` 타입을 `RefereeTypeValue`로 변경
- [x] 1.3 constants import 추가 (`PlayStyleValue`, `RefereeTypeValue`)

## 2. Mapper 함수 추가

- [x] 2.1 `match-mapper.ts`에 `guestListMatchToMatch()` 함수 추가
- [x] 2.2 `GuestListMatch.matchOptions.playStyle` → `Match.rule.type` 매핑 구현
- [x] 2.3 `GuestListMatch.matchOptions.refereeType` → `Match.rule.referee` 매핑 구현
- [x] 2.4 나머지 필드 변환 로직 구현 (positions, facilities, priceDisplay 등)
- [x] 2.5 `guestListMatchToMatch` 함수를 `index.ts`에서 export

## 3. Page 정리

- [x] 3.1 `matches/[id]/page.tsx`에서 `adaptToDetailMatch` 함수 제거
- [x] 3.2 `guestListMatchToMatch` import 추가
- [x] 3.3 `matchData`를 `guestListMatchToMatch(matchData)`로 변환하도록 수정

## 4. UI 컴포넌트 리팩토링

- [x] 4.1 `match-rule-section.tsx`에서 `typeLabel` 인라인 매핑 제거
- [x] 4.2 `match-rule-section.tsx`에 `PLAY_STYLE_LABELS` import 추가
- [x] 4.3 `match-rule-section.tsx`에서 `refereeLabel` 인라인 매핑 제거
- [x] 4.4 `match-rule-section.tsx`에 `REFEREE_TYPE_LABELS` import 추가
- [x] 4.5 `recruitment-status.tsx`에서 `config` 인라인 매핑 제거
- [x] 4.6 `recruitment-status.tsx`에 `POSITION_LABELS` import 추가

## 5. 검증

- [x] 5.1 TypeScript 빌드 성공 확인 (`npm run build`)
- [ ] 5.2 match[id] 상세 페이지에서 경기 형태 라벨 정상 표시 확인
- [ ] 5.3 match[id] 상세 페이지에서 심판 방식 라벨 정상 표시 확인
- [ ] 5.4 match[id] 상세 페이지에서 포지션 라벨 정상 표시 확인
- [x] 5.5 인라인 매핑 문자열 검색으로 중복 없음 확인 (`grep "자체전" src/`)
