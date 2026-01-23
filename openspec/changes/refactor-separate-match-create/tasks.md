# Tasks: match-create feature 분리

## 1. Directory 구조 생성

- [ ] 1.1 `src/features/match-create/` 디렉토리 생성
- [ ] 1.2 하위 폴더 구조 생성: `api/`, `ui/`, `model/`, `config/`, `lib/`

## 2. 파일 이동

- [ ] 2.1 `src/features/match/create/ui/**/*` → `src/features/match-create/ui/`
- [ ] 2.2 `src/features/match/create/model/**/*` → `src/features/match-create/model/`
- [ ] 2.3 `src/features/match/create/config/**/*` → `src/features/match-create/config/`

## 3. API 레이어 분리

- [ ] 3.1 `match-create/api/keys.ts` 생성 (create 관련 query keys)
- [ ] 3.2 `match-create/api/mutations.ts` 생성 (`useCreateMatch` 이동)
- [ ] 3.3 `match-create/api/queries.ts` 생성 (`useMyRecentMatches` 이동)
- [ ] 3.4 `match-create/api/index.ts` 배럴 export 생성

## 4. Import 경로 업데이트

- [ ] 4.1 `match-create` 내부 파일들의 import 경로 수정
- [ ] 4.2 `src/app/matches/create/page.tsx` import 경로 수정
- [ ] 4.3 기존 `match` feature에서 create 관련 export 제거

## 5. Feature index 파일

- [ ] 5.1 `src/features/match-create/index.ts` 배럴 export 생성
- [ ] 5.2 `src/features/match/index.ts` 업데이트 (create 관련 제거)

## 6. 검증

- [ ] 6.1 `npm run build` 성공 확인
- [ ] 6.2 경기 생성 플로우 수동 테스트
- [ ] 6.3 경기 목록/상세 페이지 정상 동작 확인
