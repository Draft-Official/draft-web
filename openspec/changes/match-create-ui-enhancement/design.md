# Design: Match Create UI Enhancement

## Context

매치 생성 폼(`/matches/create`)은 호스트가 게스트 모집을 위한 매치를 등록하는 핵심 기능입니다. 현재 폼은 기능적으로 동작하지만, 다음과 같은 UX 이슈가 있습니다:

**현재 상태:**
- Chip 컴포넌트: `orange` variant만 사용 (날짜 선택의 navy 스타일과 불일치)
- 실력 선택: 단일 값만 선택 가능 (실제로는 범위로 모집하는 경우가 많음)
- 나이 선택: 70대까지 있으나 실제 사용 거의 없음
- 은행 입력: 자유 텍스트 입력 (오타, 불일치 문제)
- 개인 주최: 팀 이름 없이 생성되어 식별 어려움
- 문의하기 토글: 다른 섹션 토글과 스타일 불일치

**기술 스택:**
- React Hook Form + Zod validation
- shadcn/ui 기반 컴포넌트 (Chip, Switch, Select, Input)
- Supabase PostgreSQL (matches 테이블)

## Goals / Non-Goals

**Goals:**
- UI 스타일 일관성 확보 (Chip, Switch 통일)
- 실력 범위 선택으로 더 정확한 게스트 타겟팅
- 은행 선택 UX 개선 (Combobox)
- 개인 주최 시 임시 팀 이름으로 식별성 확보
- 불필요한 필드(보장 쿼터) 제거로 폼 간소화

**Non-Goals:**
- 매치 생성 플로우 전체 리팩토링 (별도 change에서 진행 중)
- DB 스키마 대규모 변경 (기존 컬럼 활용 우선)
- 매치 상세/목록 화면 변경 (생성 폼에 집중)

## Decisions

### 1. Navy Chip Variant 구현 방식

**결정:** 기존 Chip 컴포넌트에 `navy` variant 추가

**대안 검토:**
- A. 새 variant 추가 ← **선택**
- B. DateStrip 스타일을 별도 컴포넌트로 분리
- C. Chip 전체를 navy 기반으로 변경

**근거:** A를 선택한 이유는 기존 orange variant를 사용하는 곳이 많아 영향도가 적고, cva의 variants 패턴을 그대로 활용할 수 있음.

```typescript
// chip.tsx variants에 추가
navy: [
  "bg-white text-slate-600 border-slate-200",
  "data-[active=true]:bg-slate-900 data-[active=true]:text-white data-[active=true]:border-slate-900",
],
```

### 2. 실력 범위 선택 컴포넌트

**결정:** 기존 `SkillSlider`를 `SkillRangeSlider`로 교체, min/max 두 개 값 관리

**대안 검토:**
- A. 단일 슬라이더 2개 (min, max 별도)
- B. 범위 슬라이더 (드래그로 범위 선택) ← **선택**
- C. 두 개의 Select 드롭다운

**근거:** B를 선택한 이유는 시각적으로 범위를 직관적으로 표현할 수 있고, 모바일에서 터치 친화적임.

```typescript
interface SkillRangeSliderProps {
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
}
```

**DB 매핑:**
- 기존: `skill_level: number` (단일 값)
- 변경: `skill_level_min: number`, `skill_level_max: number`
- 마이그레이션: 기존 `skill_level` 값을 min=max로 복사

### 3. 은행 선택 Combobox

**결정:** shadcn/ui Combobox 패턴 사용, 한국 주요 은행 목록 하드코딩

**대안 검토:**
- A. 자유 텍스트 유지 + 자동완성
- B. Select 드롭다운 (검색 없음)
- C. Combobox (검색 가능) ← **선택**

**근거:** C를 선택한 이유는 은행 수가 20개 이상으로 드롭다운만으로는 탐색이 불편하고, 검색으로 빠르게 찾을 수 있음.

```typescript
// shared/config/bank-constants.ts
export const BANK_OPTIONS = [
  { value: 'KB', label: 'KB국민은행' },
  { value: 'SHINHAN', label: '신한은행' },
  { value: 'WOORI', label: '우리은행' },
  { value: 'HANA', label: '하나은행' },
  { value: 'NH', label: 'NH농협은행' },
  { value: 'KAKAO', label: '카카오뱅크' },
  { value: 'TOSS', label: '토스뱅크' },
  // ... 기타 은행
] as const;
```

### 4. 개인 주최 시 팀 이름 입력

**결정:** `selectedHost === 'me'`일 때 별도 Input 필드 표시

**대안 검토:**
- A. 별도 Input 필드 ← **선택**
- B. Select 내 직접입력 옵션

**근거:** A를 선택한 이유는 필수 필드임을 명확히 표시할 수 있고, 다른 필드들과 일관된 UX 제공.

**DB 매핑:**
- 기존 `manual_team_name` 컬럼 활용 (이미 존재)
- 개인 주최 시: `team_id = null`, `manual_team_name = 입력값`

### 5. 보장 쿼터 삭제

**결정:** UI에서 제거, DB 컬럼은 nullable로 유지 (soft delete)

**근거:** 기존 데이터 호환성을 위해 컬럼 자체는 유지하되, 새 매치에서는 사용하지 않음.

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| 실력 범위 DB 마이그레이션 | 기존 데이터 손실 가능 | 기존 값을 min=max로 복사하는 안전한 마이그레이션 |
| Combobox 접근성 | 스크린리더 지원 부족 가능 | shadcn/ui의 접근성 준수 Combobox 사용 |
| 70대 제거 | 일부 사용자 영향 | 실제 사용 데이터 분석 결과 0.1% 미만 |
| 보장 쿼터 삭제 | 기존 매치 표시 이슈 | 상세 화면에서 값이 있으면 표시, 없으면 숨김 처리 |

## Migration Plan

### Phase 1: UI 변경 (DB 변경 없음)
1. Chip navy variant 추가
2. Switch 스타일 통일
3. 나이 범위 70대 제거
4. 보장 쿼터 UI 제거
5. 네이밍 변경 ("문의연락처")
6. 팀 생성 이점 문구 수정

### Phase 2: 신규 컴포넌트
1. `SkillRangeSlider` 컴포넌트 생성
2. `BankCombobox` 컴포넌트 생성
3. 개인 주최 시 팀 이름 Input 추가

### Phase 3: DB 스키마 (선택적)
1. `skill_level_min`, `skill_level_max` 컬럼 추가
2. 기존 데이터 마이그레이션
3. 기존 `skill_level` 컬럼 deprecated

**Rollback:** Phase별 독립적 배포로 문제 발생 시 해당 Phase만 롤백

## Open Questions

1. ~~실력 범위 UI: 범위 슬라이더 vs 두 개의 Select?~~ → 범위 슬라이더로 결정
2. ~~은행 목록: API 조회 vs 하드코딩?~~ → 하드코딩 (변경 빈도 낮음)
3. 기존 매치의 skill_level 단일값 표시: 범위로 변환 표시 vs 레거시 그대로?
