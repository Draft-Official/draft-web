# Change: match와 match-create feature 분리

## Why

현재 `match` feature 내에 `create/` 하위 폴더로 경기 생성 기능이 포함되어 있어 단일 feature가 너무 커지고 있습니다. 경기 조회/목록과 경기 생성은 서로 다른 도메인 책임을 가지므로 별도 feature로 분리하여 관심사 분리와 유지보수성을 개선합니다.

## What Changes

- `src/features/match/create/` → `src/features/match-create/`로 분리
- `match-create` feature에 독립적인 `api/`, `ui/`, `model/`, `config/` 레이어 구성
- `match` feature에서 create 관련 API 함수 및 쿼리를 `match-create`로 이동
- **`matchKeys`를 `@/shared/api/keys/match-keys.ts`로 이동** (두 feature 모두 사용)
- Import 경로 업데이트

## Impact

- **Affected specs**: match (기존), match-create (신규)
- **Affected code**:
  - `src/features/match/create/**/*` (이동)
  - `src/features/match/api/mutations.ts` (분리)
  - `src/features/match/api/queries.ts` (일부 분리 - `useMyRecentMatches`)
  - `src/features/match/api/keys.ts` → `src/shared/api/keys/match-keys.ts` (이동)
  - `src/app/matches/create/page.tsx` (import 변경)
