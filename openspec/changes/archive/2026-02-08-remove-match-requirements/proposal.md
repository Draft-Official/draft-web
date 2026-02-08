## Why

매치 생성 시 "준비물" (실내화, 유니폼) 필드를 현재 사용하지 않기로 결정. 불필요한 입력 필드와 UI를 제거하여 사용자 경험을 간소화하고 코드 복잡도를 줄인다.

## What Changes

- **BREAKING**: 매치 생성 시 `requirements` 필드 입력 UI 제거 (실내화/유니폼 체크박스)
- **BREAKING**: 매치 상세 페이지에서 "준비물" 정보 표시 제거
- 서버에 `requirements` 데이터 전송 중단 (빈 배열로 전송)
- 클라이언트 타입에서 `requirements` 필드 optional 유지 (DB 호환성)

## Capabilities

### New Capabilities

없음

### Modified Capabilities

- `match`: requirements 필드를 UI에서 제거하고 서버 전송 중단

## Impact

### 영향받는 파일

| 위치 | 파일 | 변경 내용 |
|------|------|----------|
| match-create | `ui/match-create-view.tsx` | hasShoes/hasJersey 상태 및 UI 제거 |
| match-create | `api/match-create-mapper.ts` | requirements 매핑 제거 (빈 배열) |
| match-create | `model/schema.ts` | requirements 스키마 제거 |
| match-create | `lib/hooks/use-recent-match-prefill.ts` | requirements prefill 로직 제거 |
| match-create | `mappers/match-to-prefill-mapper.ts` | requirements 매핑 제거 |
| match | `ui/components/detail/match-info-section.tsx` | 준비물 표시 UI 제거 |
| match | `api/match-mapper.ts` | requirements 매핑 유지 (하위 호환) |
| match | `model/types.ts` | requirements 필드 유지 (optional) |

### DB 영향

- `matches.requirements` 컬럼은 유지 (기존 데이터 보존)
- 새 매치는 빈 배열 `[]`로 저장
