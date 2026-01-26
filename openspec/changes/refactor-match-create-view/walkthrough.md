# Walkthrough: Match Create View 리팩토링 (Phase 1-2)

## 📋 개요

`match-create-view.tsx`의 복잡도를 개선하기 위한 리팩토링을 수행했습니다.

**목표**: 952줄의 거대한 view 파일을 재사용 가능한 훅과 클래스로 분리

**결과**: 
- **코드 감소**: 952줄 → 717줄 (**235줄, 24.7% 감소**)
- **Props 제거**: 12개
- **새 파일**: 5개 (hooks 2개, mapper 1개, types 1개)

---

## ✅ 완료된 작업

### Phase 1: Quick Wins

#### 1.1-1.2 UI 상태 로컬화

**문제**: show/hide 상태가 부모 컴포넌트에서 관리되어 불필요한 Props Drilling 발생

**해결**:
- `MatchCreateGameFormat`: 4개 show 상태 → 로컬 useState로 이동
- `MatchCreateFacilities`: 2개 dialog 상태 → 로컬 useState로 이동

**영향받은 파일**:
- [match-create-game-format.tsx](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/ui/components/match-create-game-format.tsx)
- [match-create-facilities.tsx](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/ui/components/match-create-facilities.tsx)
- [match-create-view.tsx](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/ui/match-create-view.tsx)

**코드 예시**:
```tsx
// Before (match-create-view.tsx)
const [showGameFormatType, setShowGameFormatType] = useState(false);
<MatchCreateGameFormat 
  showGameFormatType={showGameFormatType} 
  setShowGameFormatType={setShowGameFormatType}
  // ...10+ more props
/>

// After (match-create-game-format.tsx)
export function MatchCreateGameFormat({ /* only 8 props */ }) {
  const [showGameFormatType, setShowGameFormatType] = useState(false);
  // ...
}
```

**Props 감소**: 8개 제거

---

#### 1.3 타입 통합

**문제**: `LocationData`, `GymFacilities` 타입이 3-4개 파일에 중복 정의됨

**해결**:
- `model/types.ts` 생성하여 중앙 관리
- 중복 interface 제거 및 import로 교체

**새 파일**:
- [model/types.ts](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/model/types.ts)

**변경된 파일**:
- [hooks/use-location-search.ts](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/hooks/use-location-search.ts)
- [match-create-basic-info.tsx](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/ui/components/match-create-basic-info.tsx)
- [selected-location-card.tsx](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/ui/components/selected-location-card.tsx)

---

#### 2.1-2.2 useLocationSearch 훅 추출

**문제**: 장소 검색 로직(126줄)이 view 파일에 있어 재사용 불가

**해결**:
- Kakao Map 검색, debounce, Gym 조회 로직을 `useLocationSearch()` 훅으로 추출
- 시설 프리필 로직 통합

**새 파일**:
- [hooks/use-location-search.ts](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/hooks/use-location-search.ts) (172줄)

**코드 예시**:
```tsx
// Before (match-create-view.tsx에 126줄)
const [location, setLocation] = useState("");
const handleLocationSearch = (query: string) => { /* 긴 로직 */ };
// ...

// After
const {
  location,
  locationData,
  searchResults,
  isDropdownOpen,
  handleSearch,
  handleSelect,
  handleClear,
  gymFacilities
} = useLocationSearch();
```

**코드 감소**: match-create-view.tsx에서 ~100줄 제거

---

### Phase 2: 핵심 로직 분리

#### 3.1 MatchToPrefillMapper 클래스 생성

**문제**: `fillFromRecentMatch` 함수가 127줄로 너무 길고 테스트 불가능

**해결**:
- 12개 섹션별 private 메서드로 분리한 Mapper 클래스 생성
- 각 섹션 독립적으로 테스트 가능

**새 파일**:
- [mappers/match-to-prefill-mapper.ts](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/mappers/match-to-prefill-mapper.ts) (211줄)

**아키텍처**:
```tsx
class MatchToPrefillMapper {
  constructor(private match: MatchWithRelations) {}
  
  toFormData() {
    return {
      location: this.mapLocation(),      // 장소
      timeInfo: this.mapTimeInfo(),      // 시간
      pricing: this.mapPricing(),        // 가격
      account: this.mapAccount(),        // 계좌
      contact: this.mapContact(),        // 연락처
      host: this.mapHost(),              // 주최자
      notice: this.mapNotice(),          // 공지
      recruitment: this.mapRecruitment(),// 모집
      specs: this.mapSpecs(),            // 스펙
      gameFormat: this.mapGameFormat(),  // 경기형식
      requirements: this.mapRequirements() // 준비물
    };
  }
  
  private mapLocation() { /* ... */ }
  // ... 11개 더
}
```

---

#### 3.2-3.3 useRecentMatchPrefill 훅 생성

**문제**: 최근 경기 프리필 로직이 view에 있어 재사용 및 테스트 어려움

**해결**:
- Mapper 클래스를 사용하는 훅 생성
- 모든 setter 함수를 파라미터로 받아 의존성 주입

**새 파일**:
- [hooks/use-recent-match-prefill.ts](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/hooks/use-recent-match-prefill.ts) (177줄)

**사용법**:
```tsx
const { fillFromRecentMatch } = useRecentMatchPrefill({
  setValue,
  handleLocationSelect,
  setFeeType,
  // ... 18개 setter 함수
});

// 사용
const handleSelect = async (match: MatchWithRelations) => {
  await fillFromRecentMatch(match);
};
```

**코드 감소**: match-create-view.tsx에서 ~127줄 제거

---

#### 3.4 중복 타입 정리

**문제**: `MatchWithRelations`가 2개 파일에 중복 정의됨

**해결**:
- `shared/types/database.types.ts`의 타입 사용
- [recent-matches-dialog.tsx](file:///Users/beom/Documents/Draft/draft-web/src/features/match-create/ui/components/recent-matches-dialog.tsx)의 중복 제거

---

## 📊 통계

### 파일 변경 사항

| 카테고리 | 파일 수 | 변경 |
|---------|--------|------|
| **신규 생성** | 4개 | hooks (2), mappers (1), types (1) |
| **수정** | 6개 | view, components (5) |
| **총계** | 10개 | - |

### 코드 메트릭

| 항목 | Before | After | 감소 |
|------|--------|-------|------|
| **match-create-view.tsx** | 952줄 | 717줄 | **-235줄 (-24.7%)** |
| **Props (total)** | ~43개 | ~31개 | **-12개** |
| **useState (view)** | 43개 | 43개 | 0 (Phase 3-4 예정) |

### 새로 생성된 파일

```
src/features/match-create/
├── hooks/
│   ├── use-location-search.ts      (172줄)
│   └── use-recent-match-prefill.ts (177줄)
├── mappers/
│   └── match-to-prefill-mapper.ts  (211줄)
└── model/
    └── types.ts                    (33줄)
```

**총 추가 코드**: 593줄  
**view에서 제거된 코드**: ~235줄  
**순 증가**: +358줄 (하지만 테스트 가능성과 재사용성 대폭 향상)

---

## 🎯 개선 효과

### 1. 테스트 가능성 향상

**Before**: 
- view 파일 전체를 마운트해야 테스트 가능
- 로직 테스트가 사실상 불가능

**After**:
- `MatchToPrefillMapper` 독립 테스트
- `useLocationSearch` 훅 독립 테스트
- 각 섹션별 매핑 로직 개별 테스트 가능

```tsx
// 예시: Mapper 단위 테스트
test('mapLocation returns correct format', () => {
  const mapper = new MatchToPrefillMapper(mockMatch);
  const location = mapper.mapLocation();
  expect(location.locationInfo.address).toBe('서울시...');
});
```

---

### 2. 재사용성 향상

- `useLocationSearch`: 다른 feature에서도 사용 가능
- `MatchToPrefillMapper`: 다른 폼에서도 최근 데이터 매핑 시 재사용

---

### 3. 유지보수성개선

**Before**:
```tsx
// 952줄 중 특정 로직 찾기 어려움
// 새 필드 추가 시 여러 곳 수정 필요
```

**After**:
```tsx
// 새 필드 추가 시:
// 1. mapper의 해당 메서드만 수정
// 2. 훅의 파라미터 추가
// 명확한 책임 분리
```

---

### 4. 타입 안전성 강화

- 중복 타입 제거로 일관성 확보
- `LocationData`, `GymFacilities`, `MatchWithRelations` 단일 소스

---

## 🚧 남은 작업 (Phase 3-4)

### Phase 3: Zod Schema 검증

- [ ] `model/match-create-validation.ts` 생성
- [ ] onSubmit의 수동 검증 → Zod schema로 교체
- [ ] 예상 감소: ~50줄

### Phase 4: react-hook-form 완전 통합

- [ ] useState → useForm defaultValues 마이그레이션
- [ ] FormContext로 Props Drilling 제거
- [ ] 예상 감소: ~150줄 추가

**최종 목표**: 952줄 → ~260줄 (72% 감소)

---

## ✅ 검증 완료

- [x] **빌드**: TypeScript 체크 성공
- [x] **타입**: 모든 import 경로 올바름
- [x] **중복**: LocationData, GymFacilities, MatchWithRelations통합 완료

---

## 📝 교훈

### 중복 타입 방지 체크리스트

새 타입 정의 전에 **항상**:
1. `rg "interface TypeName" src/` 검색
2. `shared/types/`, `features/[feature]/model/` 확인
3. 기존 정의 발견 시 import 사용

### 적용 사례

이번 리팩토링에서 발견하고 수정한 중복들:
- ✅ `LocationData` - 3개 파일 → `model/types.ts`로 통합
- ✅ `GymFacilities` - database.types.ts에 이미 정의됨을 확인
- ✅ `MatchWithRelations` - 2개 파일 → database.types.ts 사용

---

## 🎉 결론

Phase 1-2를 통해 **24.7%의 코드 감소**와 **테스트 가능성 대폭 향상**을 달성했습니다.

**핵심 성과**:
- 재사용 가능한 훅 2개 추출
- 테스트 가능한 Mapper 클래스 생성
- 타입 통합으로 일관성 확보
- Props 12개 제거

**다음 단계**:
- Phase 3-4는 선택사항 (Zod + FormContext)
- 현재 구조도 충분히 개선됨
- 리소스 여유 시 점진적 진행 권장
