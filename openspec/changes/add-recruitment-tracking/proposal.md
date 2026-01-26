# Change: Add Recruitment Position Tracking

## Why
현재 매치 생성 시 포지션별 모집 인원(`max`)을 설정할 수 있지만, 게스트가 신청 후 확정될 때 해당 포지션의 현재 인원(`current`)이 자동으로 업데이트되지 않습니다. 또한 `current_players_count` 필드와 `recruitment_setup.positions[].current`가 중복되어 데이터 불일치 위험이 있습니다.

## What Changes

### 1. 데이터 구조 통합 (BREAKING)
- `matches.current_players_count` 필드 **Deprecated** → `recruitment_setup`으로 통합
- `recruitment_setup` 타입 확장:
  - `ANY` 타입: `current_count` 필드 추가
  - `POSITION` 타입: 기존 `positions[].current` 활용

### 2. 자동 카운트 업데이트
- 신청 확정(CONFIRMED) 시 `current` 자동 증가
- 신청 취소(CANCELED) 시 `current` 자동 감소

### 3. UI 및 API 수정
- 모든 곳에서 `recruitment_setup` 기준으로 현재 인원 조회
- `current_players_count` 참조 코드 제거

## Data Structure

### Before (현재 - 중복 구조)
```typescript
// matches 테이블
{
  current_players_count: 3,  // 전체 인원 (ANY용)
  recruitment_setup: {
    type: 'POSITION',
    positions: { G: { max: 2, current: 0 }, ... }  // current가 업데이트 안됨
  }
}
```

### After (변경 후 - 통합 구조)
```typescript
// ANY 타입
recruitment_setup: {
  type: 'ANY',
  max_count: 5,
  current_count: 3  // 신규 필드
}

// POSITION 타입
recruitment_setup: {
  type: 'POSITION',
  positions: {
    G: { max: 2, current: 1 },
    F: { max: 2, current: 2 },
    C: { max: 1, current: 0 }
  }
}
```

## Impact
- **Affected specs**: match-recruitment (신규 capability)
- **Affected code**:
  - `src/shared/types/jsonb.types.ts` - RecruitmentSetup 타입 수정
  - `src/features/application/api/application-api.ts` - count 업데이트 로직
  - `src/features/match/api/match-mapper.ts` - current_players_count 참조 제거
  - `src/features/schedule/lib/mappers.ts` - current_players_count 참조 제거
  - `src/features/match-create/*` - 생성 시 올바른 형식 보장
  - Host/Guest UI 컴포넌트 - 모집 현황 표시

## Migration Strategy
1. **Phase 1**: `recruitment_setup`에 `current_count` 지원 추가 (backward compatible)
2. **Phase 2**: 기존 데이터에서 `current_players_count` → `recruitment_setup.current_count` 마이그레이션
3. **Phase 3**: `current_players_count` 참조 코드 제거

## Selected Approach: Application Service Direct Update

신청 확정/취소 시 `application-api.ts`에서 해당 매치의 `recruitment_setup`을 직접 업데이트합니다.

**선택 이유:**
- 단일 트랜잭션으로 일관성 보장
- 기존 코드 구조 유지
- DB trigger 없이 단순 구현
- 필요시 DB trigger로 전환 가능
