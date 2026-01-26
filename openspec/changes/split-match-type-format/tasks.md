# Tasks: Split match_type into Type and Format

## Phase 1: DB Migration (Supabase Manual)

- [ ] 1.1 `match_format` 컬럼 추가
  ```sql
  ALTER TABLE matches ADD COLUMN match_format TEXT NOT NULL DEFAULT 'FIVE_ON_FIVE';
  ```

- [ ] 1.2 기존 데이터 마이그레이션
  ```sql
  UPDATE matches SET match_format =
    CASE match_type
      WHEN '5vs5' THEN 'FIVE_ON_FIVE'
      WHEN '3vs3' THEN 'THREE_ON_THREE'
      ELSE 'FIVE_ON_FIVE'
    END;
  ```

- [ ] 1.3 match_type 값 초기화 (경기 목적으로 전환)
  ```sql
  UPDATE matches SET match_type = 'GUEST_RECRUIT';
  ```

- [ ] 1.4 database.types.ts 재생성 (Supabase CLI)
  ```bash
  npx supabase gen types typescript --project-id <project-id> > src/shared/types/database.types.ts
  ```

## Phase 2: Constants Update

- [ ] 2.1 `constants.ts` - MATCH_TYPE 상수 리네이밍
  - 기존 `MATCH_TYPE_VALUES = ['5vs5', '3vs3']` 삭제
  - `MATCH_FORMAT_VALUES = ['FIVE_ON_FIVE', 'THREE_ON_THREE']` 추가
  - `MATCH_FORMAT_LABELS` 추가 (FIVE_ON_FIVE: '5vs5', ...)

- [ ] 2.2 `constants.ts` - MATCH_CATEGORY → MATCH_TYPE 통합
  - 기존 `MATCH_CATEGORY_*` 상수들을 `MATCH_TYPE_*`로 리네이밍
  - 기존 `MATCH_TYPE_*` (5vs5, 3vs3) 관련 상수 삭제

## Phase 3: Type Definitions

- [ ] 3.1 `match/model/types.ts` - ClientMatch 타입 정리
  - `matchType: string` → `matchType: MatchTypeValue` (경기 목적)
  - `gameFormat: string` → `matchFormat: MatchFormatValue` (경기 방식)

- [ ] 3.2 `match/ui/match-list-item.tsx` - Props 타입 정리
  - `gameFormat` → `matchFormat`

## Phase 4: Mappers Update

- [ ] 4.1 `match/api/match-mapper.ts` - 매핑 로직 수정
  - `matchType: row.match_type || '5vs5'` → `matchType: row.match_type`
  - `gameFormat: row.match_type || '5vs5'` → `matchFormat: row.match_format`

- [ ] 4.2 `match-create/api/match-create-mapper.ts` - 폼 → DB 매핑 수정
  - `match_type: form.matchType` → `match_format: form.matchFormat` 변환 추가
  - `match_type: 'GUEST_RECRUIT'` 고정값 추가

- [ ] 4.3 `match-create/mappers/match-to-prefill-mapper.ts` - prefill 매핑 수정
  - `matchType: this.match.match_type || '5vs5'` → `matchFormat: this.match.match_format || 'FIVE_ON_FIVE'`

## Phase 5: Schema Update

- [ ] 5.1 `match-create/model/schema.ts` - Zod 스키마 수정
  - `matchType: z.enum(['5vs5', '3vs3'])` → `matchFormat: z.enum(MATCH_FORMAT_VALUES)`

## Phase 6: UI Components Update

- [ ] 6.1 `match-create/ui/match-create-view.tsx` - state 변수 변경
  - `const [matchType, setMatchType] = useState("5vs5")` → `const [matchFormat, setMatchFormat] = useState<MatchFormatValue>(MATCH_FORMAT_DEFAULT)`
  - form 데이터 구성 시 `matchType` → `matchFormat`

- [ ] 6.2 `match-create/ui/components/match-create-specs.tsx` - props 변경
  - `matchType, setMatchType` → `matchFormat, setMatchFormat`
  - UI 라벨에 `MATCH_FORMAT_LABELS` 사용

- [ ] 6.3 `match-create/lib/hooks/use-recent-match-prefill.ts` - prefill 적용 수정
  - `setMatchType(data.specs.matchType)` → `setMatchFormat(data.specs.matchFormat)`

- [ ] 6.4 `match/ui/components/filter/detail-filter-modal.tsx` - 필터 옵션 수정
  - 하드코딩된 `{ value: '5vs5', label: '5vs5' }` → `MATCH_FORMAT_OPTIONS` 사용

- [ ] 6.5 `match/ui/components/detail/match-info-section.tsx` - 표시 로직 수정
  - `match.gameFormat || '5vs5'` → `MATCH_FORMAT_LABELS[match.matchFormat] || '5vs5'`

- [ ] 6.6 `match/ui/match-list-item.tsx` - props 및 표시 수정
  - `gameFormat` prop → `matchFormat`

## Phase 7: Verification

- [ ] 7.1 TypeScript 빌드 검증
  ```bash
  npm run build
  ```

- [ ] 7.2 매치 생성 플로우 수동 테스트
- [ ] 7.3 매치 목록/상세 표시 확인
- [ ] 7.4 필터 기능 동작 확인

## Dependencies

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6 → Phase 7
         (Sequential - DB 먼저 완료 필수)
```

Phase 2~6은 DB 변경 이후 동시에 작업 가능하나, 타입 안정성을 위해 순차 진행 권장.
