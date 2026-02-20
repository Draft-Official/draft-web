# Location Search Shared Component Design

**Date:** 2026-02-19
**Scope:** `match-create`, `team-create`

## Goal

`match-create`에 있던 장소 검색 UI/동작을 공통 컴포넌트로 추출하고, 동일 기능을 `team-create`에도 적용한다.

## Current State

- 장소 검색 로직은 `src/shared/lib/hooks/use-location-search.ts`에 공통화되어 있다.
- 하지만 검색 UI/드롭다운/선택 렌더링은
  - `src/features/match-create/ui/components/match-create-basic-info.tsx`
  - `src/features/team/ui/components/team-create-step-schedule.tsx`
  에 중복 구현되어 있다.
- 두 화면의 기능이 일부 다르고, 유지보수 시 동기화 비용이 높다.

## Decision

`src/shared/ui/composite/location-search-field.tsx`를 새로 만들고, 이 컴포넌트가 장소 검색 기능(입력/검색/드롭다운/선택/clear)을 내부 소유한다.

- 내부 상태/동작: `useLocationSearch` 사용
- 외부 연동: `onResolvedChange` 콜백으로 `locationData`, `isExistingGym`, `gymFacilities`를 부모에 전달
- 외부 초기값 동기화: `value` prop(`LocationData | null`) 지원

## API Sketch

```ts
interface LocationSearchResolvedValue {
  locationData: LocationData | null;
  isExistingGym: boolean;
  gymFacilities: GymFacilities | null;
}

interface LocationSearchFieldProps {
  label?: string;
  value?: LocationData | null;
  placeholder?: string;
  required?: boolean;
  onResolvedChange?: (next: LocationSearchResolvedValue) => void;
  onInputFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}
```

## Integration Plan

1. `match-create-basic-info`의 장소 검색 블록 제거 후 `LocationSearchField` 사용
2. `useMatchCreateViewModel`에서 장소 관련 상태를 명시적으로 관리하고, `onResolvedChange`로 동기화
3. 최근 경기/수정 프리필에서 `locationData`를 직접 설정하도록 훅 시그니처 조정
4. `team-create`도 동일 `LocationSearchField` 사용으로 통일

## Risks

- 프리필 시 외부 `value`와 내부 상태 동기화 타이밍 이슈
- 장소 clear 시 `gymFacilities` 초기화 누락 가능성

## Mitigations

- `LocationSearchField` 내부에서 `value` 변경 감지 effect를 두고 id/address 기준으로 동기화
- `onResolvedChange`에서 항상 전체 상태(`locationData/isExistingGym/gymFacilities`)를 전달하여 부모 단일 source로 유지
