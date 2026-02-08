## Context

현재 매치 생성 시 "준비물" 필드(실내화, 유니폼)를 입력받고 DB에 저장하며, 매치 상세 페이지에서 표시하고 있다. 이 기능이 MVP에서 필요하지 않아 제거하기로 결정.

**현재 구조:**
- `match-create-view.tsx`: `hasShoes`, `hasJersey` 체크박스 상태 관리
- `match-create-mapper.ts`: 체크박스 → `requirements` 배열로 변환 후 서버 전송
- `match-info-section.tsx`: `getRequirementLabels()`로 준비물 표시

## Goals / Non-Goals

**Goals:**
- 매치 생성 UI에서 준비물 입력 필드 제거
- 매치 상세 페이지에서 준비물 표시 제거
- 코드 복잡도 감소

**Non-Goals:**
- DB 스키마 변경 (기존 데이터 보존 필요)
- 타입 정의 완전 제거 (하위 호환성)

## Decisions

### 1. UI 제거만 수행, DB 컬럼 유지

**결정**: `matches.requirements` 컬럼은 그대로 두고 UI만 제거

**이유**:
- 기존 매치 데이터의 requirements 정보 보존
- 추후 기능 복원 시 마이그레이션 불필요
- DB 변경 없이 빠른 적용 가능

**대안 검토**:
- DB 컬럼 삭제 → 기존 데이터 손실, 마이그레이션 필요 → 불채택

### 2. 빈 배열 전송

**결정**: 새 매치 생성 시 `requirements: []` 전송

**이유**:
- DB 스키마가 `string[] | null`이므로 빈 배열이 유효
- null보다 빈 배열이 클라이언트에서 처리 용이

### 3. 타입 정의 유지

**결정**: `Match.requirements?: string[]` 타입 유지

**이유**:
- 기존 매치 데이터 조회 시 타입 안전성 유지
- mapper에서 requirements 매핑은 유지 (읽기용)

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| 기존 매치에서 준비물 정보 접근 불가 | 데이터는 DB에 유지, 필요시 API로 조회 가능 |
| 사용자가 준비물 정보를 원할 수 있음 | MVP 이후 필요시 기능 복원 용이 (DB 데이터 보존) |
