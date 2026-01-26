# Design: Recruitment Position Tracking

## Context
신청 확정 시 `recruitment_setup`의 current 값을 업데이트하는 방식에서 발생할 수 있는 문제점과 해결 방안을 정리합니다.

## Potential Issues

### 1. Race Condition (동시성 문제)

**문제**: 여러 신청이 동시에 확정되면 Lost Update 발생 가능

```
시간 →
신청A: READ(current=0) → UPDATE(current=1) → COMMIT
신청B: READ(current=0) → UPDATE(current=1) → COMMIT  ❌ 실제로는 2여야 함
```

**해결책**: Supabase의 JSONB 연산자 사용

```sql
-- 직접 값 설정 대신 증감 연산 사용
UPDATE matches
SET recruitment_setup = jsonb_set(
  recruitment_setup,
  '{positions,G,current}',
  (COALESCE((recruitment_setup->'positions'->'G'->>'current')::int, 0) + 1)::text::jsonb
)
WHERE id = $1;
```

**또는** Supabase RPC 함수 생성:
```sql
CREATE OR REPLACE FUNCTION increment_position_count(
  match_id UUID,
  position_key TEXT,
  delta INT DEFAULT 1
) RETURNS void AS $$
BEGIN
  UPDATE matches
  SET recruitment_setup = jsonb_set(
    recruitment_setup,
    ARRAY['positions', position_key, 'current'],
    (COALESCE((recruitment_setup->'positions'->position_key->>'current')::int, 0) + delta)::text::jsonb
  )
  WHERE id = match_id;
END;
$$ LANGUAGE plpgsql;
```

### 2. 트랜잭션 실패 (부분 실패)

**문제**: 신청 상태는 CONFIRMED로 변경됐는데 count 업데이트가 실패하면?

```
1. UPDATE applications SET status = 'CONFIRMED'  ✅
2. UPDATE matches SET recruitment_setup = ...    ❌ 실패
→ 데이터 불일치
```

**해결책 A (권장)**: 단일 트랜잭션으로 묶기
```typescript
// Supabase는 기본적으로 각 요청이 트랜잭션
// RPC 함수로 두 작업을 하나로 묶음
const { error } = await supabase.rpc('confirm_application_with_count', {
  application_id: applicationId,
  match_id: matchId,
  position: position
});
```

**해결책 B**: 실패 시 롤백 로직
```typescript
try {
  await updateApplicationStatus('CONFIRMED');
  await updateRecruitmentCount(matchId, position, +1);
} catch (error) {
  // 롤백
  await updateApplicationStatus('PENDING');
  throw error;
}
```

### 3. Position 매핑 문제

**문제**: `participants_info`의 position 값과 `recruitment_setup.positions`의 키가 일치해야 함

```typescript
// participants_info 예시
[{ type: 'MAIN', position: 'G', ... }]

// recruitment_setup.positions 키
{ G: {...}, F: {...}, C: {...} }
// 또는 빅맨 통합 시
{ G: {...}, B: {...} }
```

**해결책**: Position 매핑 함수 추가
```typescript
function mapPositionToRecruitmentKey(
  position: string,
  setupPositions: Record<string, any>
): string {
  // 직접 매칭
  if (setupPositions[position]) return position;

  // 빅맨 통합: F, C → B
  if ((position === 'F' || position === 'C') && setupPositions['B']) {
    return 'B';
  }

  throw new Error(`Unknown position: ${position}`);
}
```

### 4. 동반인(Guest) 처리

**문제**: 한 신청에 여러 참여자가 있을 수 있음

```typescript
participants_info: [
  { type: 'MAIN', position: 'G', ... },
  { type: 'GUEST', position: 'F', ... },
  { type: 'GUEST', position: 'C', ... }
]
```

**해결책**: 모든 참여자의 position을 순회하며 count 증가
```typescript
async function updateCountsForAllParticipants(
  matchId: string,
  participants: ParticipantInfo[],
  delta: number // +1 or -1
) {
  for (const participant of participants) {
    const key = mapPositionToRecruitmentKey(participant.position, setupPositions);
    await incrementPositionCount(matchId, key, delta);
  }
}
```

### 5. 이미 확정된 신청의 재처리

**문제**: 이미 CONFIRMED인 신청을 다시 CONFIRMED로 업데이트하면 count가 중복 증가

**해결책**: 상태 변경 전 체크
```typescript
async function confirmApplication(applicationId: string) {
  const app = await getApplication(applicationId);

  // 이미 확정된 경우 스킵
  if (app.status === 'CONFIRMED') {
    return app;
  }

  // 상태 변경 + count 업데이트
  await updateStatusAndCount(applicationId, 'CONFIRMED');
}
```

## Decisions

| 결정 | 선택 | 이유 |
|------|------|------|
| 동시성 처리 | Supabase RPC 함수 | 원자적 연산 보장 |
| 트랜잭션 | RPC 함수로 단일 트랜잭션 | 데이터 일관성 |
| Position 매핑 | 헬퍼 함수 | 빅맨 통합 지원 |
| 동반인 처리 | 순회 증가 | 정확한 카운트 |

## Implementation Priority

1. **먼저**: 타입 정의 및 헬퍼 함수 구현 (클라이언트)
2. **다음**: Supabase RPC 함수 생성 (DB)
3. **마지막**: 기존 코드 마이그레이션

## Risks

| 리스크 | 영향 | 완화 방안 |
|--------|------|-----------|
| RPC 함수 배포 필요 | 배포 복잡도 증가 | SQL 마이그레이션 스크립트로 관리 |
| 기존 데이터 불일치 | current 값 부정확 | 마이그레이션 스크립트로 재계산 |
| 롤백 복잡성 | 취소 시 count 감소 누락 | 상태 변경 시 이전 상태 기록 |

## Open Questions

1. ~~Position 무관(ANY) 모드에서 current_players_count 대신 어디에 저장?~~ → `recruitment_setup.current_count`로 결정
2. ~~동반인이 다른 포지션일 때 어떻게 처리?~~ → 각각 해당 포지션에 count 추가
3. 취소된 신청을 다시 확정하는 케이스 지원 필요? → 일단 미지원 (새 신청 필요)
