# Tasks: match-create feature 분리

## 1. Shared Keys 이동

- [x] 1.1 `src/shared/api/keys/` 디렉토리 생성
- [x] 1.2 `matchKeys`를 `src/shared/api/keys/match-keys.ts`로 이동
- [x] 1.3 `src/shared/api/keys/index.ts` 배럴 export 생성
- [x] 1.4 기존 `match/api/keys.ts` 삭제, import 경로 업데이트

## 2. Shared Constants 이동

- [x] 2.1 Form/Filter용 상수를 `src/shared/config/match-constants.ts`에 추가
- [x] 2.2 `match-create/config/constants.ts` 삭제 (중복 제거)

## 3. Directory 구조 생성

- [x] 3.1 `src/features/match-create/` 디렉토리 생성
- [x] 3.2 하위 폴더 구조 생성: `api/`, `ui/`, `model/`, `lib/`

## 4. 파일 이동

- [x] 4.1 `src/features/match/create/ui/**/*` → `src/features/match-create/ui/`
- [x] 4.2 `src/features/match/create/model/**/*` → `src/features/match-create/model/`

## 5. API 레이어 분리

- [x] 5.1 `match-create/api/match-create-api.ts` 생성 (`createMatch` 함수)
- [x] 5.2 `match-create/api/match-create-mapper.ts` 생성 (생성 전용 mapper)
- [x] 5.3 `match-create/api/mutations.ts` 생성 (`useCreateMatch` 이동)
- [x] 5.4 `match-create/api/queries.ts` 생성 (`useMyRecentMatches` 이동)
- [x] 5.5 `match-create/api/index.ts` 배럴 export 생성

## 6. 기존 match feature 정리

- [x] 6.1 `match/api/match-api.ts`에서 create 관련 코드 제거
- [x] 6.2 `match/api/match-mapper.ts`에서 create 관련 함수 제거
- [x] 6.3 `match/api/mutations.ts` 삭제
- [x] 6.4 `match/api/queries.ts`에서 `useMyRecentMatches` 제거
- [x] 6.5 `match/api/index.ts` 업데이트

## 7. Import 경로 업데이트

- [x] 7.1 `match-create` 내부 파일들의 import 경로 수정
- [x] 7.2 `src/app/matches/create/page.tsx` import 경로 수정
- [x] 7.3 기타 feature import 경로 수정 (application, schedule)

## 8. Feature index 파일

- [x] 8.1 `src/features/match-create/index.ts` 배럴 export 생성
- [x] 8.2 `src/features/match-create/lib/utils.ts` 생성 (`getNext14Days`)

## 9. 검증

- [x] 9.1 `npm run build` 성공 확인
- [ ] 9.2 경기 생성 플로우 수동 테스트
