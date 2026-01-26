# Change: Match Create View 리팩토링 - 상태 관리 및 로직 분리

## Why

`match-create-view.tsx` 파일(952줄)이 `match-detail-view.tsx`(98줄) 대비 약 10배 길며, 과도하게 복잡한 상태 관리와 Props Drilling으로 유지보수성이 저하되어 있습니다:

| 문제점 | 현황 |
|--------|------|
| **useState 개수** | 43개 (match-detail은 2개) |
| **함수 개수** | 25개 (대부분 view 파일 내부) |
| **Props Drilling** | 각 컴포넌트에 10~20개 props 전달 |
| **react-hook-form 미활용** | Form 라이브러리 사용하면서도 대부분 useState로 중복 관리 |
| **대형 함수** | `onSubmit` 233줄, `fillFromRecentMatch` 137줄 |

이로 인해:
1. 새 필드 추가 시 평균 3개 파일 수정 필요
2. 상태 동기화 버그 발생 위험 높음
3. 컴포넌트 재사용성 저하
4. 신규 개발자 온보딩 어려움

## What Changes

### 1. 상태 관리 통합

**Before:** 43개의 개별 useState
```typescript
const [gender, setGender] = useState<GenderValue>(GENDER_DEFAULT);
const [level, setLevel] = useState(4);
const [parkingCost, setParkingCost] = useState("");
// ... 40개 더
```

**After:** react-hook-form으로 통합
```typescript
const { control, watch } = useForm({
  defaultValues: {
    specs: { gender: GENDER_DEFAULT, level: 4 },
    facilities: { parking: { cost: "" } }
  }
});
```

### 2. 커스텀 훅 추출

복잡한 비즈니스 로직을 재사용 가능한 훅으로 분리:

- `useLocationSearch` - Kakao 장소 검색 및 Gym 프리필 (126줄 → 훅으로 분리)
- `useRecentMatchPrefill` - 최근 경기 데이터 매핑 (137줄 → mapper 클래스로 분리)
- `useMatchFormSubmit` - 폼 제출 및 검증 (233줄 → 훅으로 분리)
- `useOperationsDefaults` - 기본값 저장 로직 분리

### 3. 검증 로직 Schema 이동

**Before:** onSubmit 내부에 수동 검증 (~50줄)
```typescript
if (!selectedDate) {
  toast.error("날짜를 선택해주세요.");
  scrollToSection('section-basic-info');
  return;
}
```

**After:** Zod Schema로 선언적 검증
```typescript
export const matchCreateSchema = z.object({
  basicInfo: z.object({
    selectedDate: z.string().min(1, "날짜를 선택해주세요.")
  })
});
```

### 4. 컴포넌트 Props 최소화

**Before:** Props Drilling
```tsx
<MatchCreateFacilities
  hasWater={hasWater} setHasWater={setHasWater}
  hasAcHeat={hasAcHeat} setHasAcHeat={setHasAcHeat}
  hasBall={hasBall} setHasBall={setHasBall}
  // ... 11개 props
/>
```

**After:** FormContext 사용
```tsx
<MatchCreateFacilities isExistingGym={isExistingGym} />

// 내부에서
export function MatchCreateFacilities({ isExistingGym }: Props) {
  const { control } = useFormContext<MatchCreateFormData>();
  // ...
}
```

### 5. UI 상태 로컬화

show/hide 상태는 해당 컴포넌트 내부로 이동:
```typescript
// match-create-view.tsx (제거)
// const [showGameFormatType, setShowGameFormatType] = useState(false);

// match-create-game-format.tsx (추가)
export function MatchCreateGameFormat() {
  const [showGameFormatType, setShowGameFormatType] = useState(false);
}
```

## Impact

- **Affected specs**: match-create
- **Affected features**: match-create, match (공통 타입)
- **Affected files**:
  - `features/match-create/ui/match-create-view.tsx` - 메인 리팩토링 (952줄 → ~260줄)
  - `features/match-create/ui/components/match-create-*.tsx` - 컴포넌트들 (Props 최소화)
  - `features/match-create/hooks/` - 신규 디렉토리
    - `use-location-search.ts`
    - `use-recent-match-prefill.ts`
    - `use-match-form-submit.ts`
    - `use-operations-defaults.ts`
  - `features/match-create/mappers/` - 신규 디렉토리
    - `match-to-prefill-mapper.ts`
  - `features/match-create/model/schema.ts` - Zod 검증 schemas 추가

## Migration Strategy

### Phase 1: Quick Wins (1주차)
1. UI 상태 로컬화 (show/hide 플래그들)
2. `useLocationSearch` 훅 추출
3. 예상 감소: ~170줄 (18%)

### Phase 2: 핵심 로직 분리 (2주차)
1. `useRecentMatchPrefill` 훅 + `MatchToPrefillMapper` 클래스
2. 각 섹션 컴포넌트 `useFormContext` 적용
3. 예상 감소: ~300줄 추가 (누적 49%)

### Phase 3: 검증 및 상태 관리 (3주차)
1. Zod Schema 정의
2. 도메인별 상태 그룹화
3. 예상 감소: ~150줄 추가 (누적 65%)

### Phase 4: 최종 통합 (4주차)
1. react-hook-form 완전 통합
2. E2E 테스트
3. 예상 감소: ~70줄 추가 (최종 72%)

**목표**: 952줄 → ~260줄 (match-detail-view 대비 2.7배로 개선)

## Breaking Changes

**없음** - 내부 리팩토링만 수행, 외부 API 변경 없음

## Non-Goals

- DB 스키마 변경
- 새로운 기능 추가
- 다른 feature(match, application) 변경
- UI/UX 변경
