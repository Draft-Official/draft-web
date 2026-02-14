# Phase 3: Remove @x Cross-Imports & Clean FSD Architecture

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**날짜**: 2026-02-14
**이전 단계**: Phase 2.5 완료 (All entities model types 생성)

---

## 🎯 Phase 2.5 완료 내역

### ✅ 생성한 Entity Types (DB Schema 기반)
1. **entities/match/model/types.ts** - ClientMatch, Create/UpdateMatchInput
2. **entities/application/model/types.ts** - ClientApplication, Create/UpdateApplicationInput
3. **entities/gym/model/types.ts** - ClientGym (위치 정보의 주인!)
4. **entities/user/model/types.ts** - ClientUser, UserMetadata

### ✅ CLAUDE.md 업데이트
- 실수 4 추가: Nested props 사용 (React anti-pattern)
- 실수 5 추가: N+1 문제 (개별 쿼리 vs JOIN)

### ✅ 검증
- TypeScript 컴파일 성공
- 빌드 성공 (15 files changed, 1808 insertions)
- Commit: bf6f1b1

---

## 🚨 문제의 본질 분석

### ❌ 잘못 이해한 것
- "@x 패턴 자체가 문제다"
- "@x 폴더만 지우면 된다"

### ✅ 실제 문제: Entities 간 API 호출 종속성

```typescript
// ❌ 문제의 근본 원인!
// entities/team/api/team-service.ts
class TeamService {
  async getTeamMatches(teamId: string) {
    // Team entity가 Match API를 호출! → 순환 종속성!
    const matches = await matchService.getMatches({ teamId });
    return matches;
  }
}

// entities/match/api/match-service.ts
class MatchService {
  async getMatch(matchId: string) {
    // Match entity가 Team API를 호출! → 순환 종속성!
    const team = await teamService.getTeam(match.teamId);
    return { ...match, team };
  }
}
```

**왜 @x가 생겼나?**
→ Entities 간 순환 종속성을 우회하려고 `@x` 패턴 사용!
→ 하지만 이것은 근본 해결이 아님!

### ✅ FSD + React Query 올바른 패턴

**원칙:**
1. **Entities** = 자기 테이블만 (완전 독립!)
2. **Features** = JOIN query + 조합 + DTO

```typescript
// ==========================================
// ✅ Entities - 순수하게 자신만!
// ==========================================

// entities/match/api/match-service.ts
class MatchService {
  async getMatch(id: string): Promise<Match> {
    const { data } = await this.supabase
      .from('matches')
      .select('*')  // ← matches 테이블만!
      .eq('id', id)
      .single();
    return matchRowToEntity(data);
  }
}

// ==========================================
// ✅ Features - JOIN query로 조합!
// ==========================================

// features/match/api/queries.ts
export function useMatchDetail(matchId: string) {
  return useQuery({
    queryKey: ['match', 'detail', matchId],
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();

      // ✅ 한 번의 query로 모든 관련 데이터 JOIN!
      const { data } = await supabase
        .from('matches')
        .select(`
          *,
          gyms(*),
          users!matches_host_id_fkey(*),
          teams(*)
        `)
        .eq('id', matchId)
        .single();

      // Entity mappers 재사용
      const match = matchRowToEntity(data);
      const gym = gymRowToEntity(data.gyms);
      const host = userRowToEntity(data.users);
      const team = data.teams ? teamRowToEntity(data.teams) : null;

      // Flat DTO로 변환 (features에서!)
      return toMatchDetailDTO(match, gym, host, team);
    },
  });
}
```

### 📊 Before vs After

| | Before (❌) | After (✅) |
|---|---|---|
| **Data Fetching** | N번의 개별 API 호출 | 1번의 JOIN query |
| **Entities** | 다른 entity API 호출 | 자기 테이블만 |
| **Cross-import** | @x 패턴으로 우회 | 없음 (독립적!) |
| **조합** | entities에서 | features에서 |
| **DTO** | Nested 객체 | Flat 구조 |

---

## 📋 Phase 3 작업 계획

### 목표
1. ❌ Entities 간 API 호출 제거 (순환 종속성 해결)
2. ❌ 모든 `@x` 폴더 제거
3. ✅ Features에 JOIN query 추가
4. ✅ Features에 Flat DTO + Mapper 추가
5. ✅ FSD 원칙 완벽 준수

---

## Task 3.0: Entities 순수성 확보 (API 호출 종속성 제거)

**목표:** Entities가 다른 entities API를 호출하지 않도록 수정

**Files:**
- Analyze: `src/entities/*/api/*-service.ts`
- Modify: Entities service methods that call other entities

**Step 1: 순환 종속성 찾기**

```bash
# Entity service에서 다른 entity import 찾기
grep -r "from '@/entities/" src/entities/*/api/ --include="*.ts"
```

**Step 2: 각 Entity Service 정리**

패턴:
```typescript
// ❌ Before - Match service가 Team API 호출
class MatchService {
  async getMatch(id: string) {
    const match = await this.getMatchRow(id);
    const team = await teamService.getTeam(match.team_id);  // ❌
    return { ...match, team };
  }
}

// ✅ After - Match는 자기 것만!
class MatchService {
  async getMatch(id: string): Promise<Match> {
    const { data } = await this.supabase
      .from('matches')
      .select('*')  // ← matches만!
      .eq('id', id)
      .single();
    return matchRowToEntity(data);
  }
}
```

**Step 3: 검증**

```bash
# Entities에서 다른 entities import가 없어야 함
grep -r "from '@/entities/" src/entities/ --include="*.ts" | grep -v "from '@/entities/[^/]*'$"
```

---

## Task 3.1: Features에 JOIN Query 추가

**목표:** Features에서 Supabase JOIN으로 관련 데이터 한 번에 fetch

**Files:**
- Create: `src/features/match/model/types.ts` (DTO types)
- Create: `src/features/match/lib/mappers.ts` (Entity → DTO)
- Modify: `src/features/match/api/queries.ts` (JOIN query)

**Step 1: DTO 타입 정의**

```typescript
// features/match/model/types.ts

/**
 * Match 상세 페이지 DTO (UI 전용)
 */
export interface MatchDetailDTO {
  // Match
  id: string;
  dateISO: string;
  startTime: string;
  endTime: string;

  // Gym (flat!)
  gymId: string;
  gymName: string;
  gymAddress: string;
  latitude: number;
  longitude: number;

  // Host (flat!)
  hostId: string;
  hostName: string;
  hostAvatar: string | null;

  // Team (flat!)
  teamId: string | null;
  teamName: string | null;
  teamLogo: string | null;

  // Computed
  priceDisplay: string;
  recruitmentStatus: {
    total: number;
    current: number;
    isFull: boolean;
  };
}
```

**Step 2: Mapper 구현**

```typescript
// features/match/lib/mappers.ts

import type { Match } from '@/entities/match';
import type { Gym } from '@/entities/gym';
import type { User } from '@/entities/user';
import type { Team } from '@/entities/team';
import type { MatchDetailDTO } from '../model/types';

export function toMatchDetailDTO(
  match: Match,
  gym: Gym,
  host: User,
  team: Team | null,
): MatchDetailDTO {
  const priceDisplay = formatPrice(match.costType, match.costAmount);
  const recruitmentStatus = calculateRecruitment(match.recruitmentSetup);

  return {
    id: match.id,
    dateISO: formatDateISO(match.startTime),
    startTime: formatTime(match.startTime),
    endTime: formatTime(match.endTime),

    gymId: gym.id,
    gymName: gym.name,
    gymAddress: gym.address,
    latitude: gym.latitude,
    longitude: gym.longitude,

    hostId: host.id,
    hostName: host.nickname ?? '익명',
    hostAvatar: host.avatarUrl,

    teamId: team?.id ?? null,
    teamName: team?.name ?? match.manualTeamName,
    teamLogo: team?.logoUrl ?? null,

    priceDisplay,
    recruitmentStatus,
  };
}
```

**Step 3: JOIN Query 구현**

```typescript
// features/match/api/queries.ts

import { matchRowToEntity } from '@/entities/match';
import { gymRowToEntity } from '@/entities/gym';
import { userRowToEntity } from '@/entities/user';
import { teamRowToEntity } from '@/entities/team';

export function useMatchDetail(matchId: string) {
  return useQuery({
    queryKey: ['match', 'detail', matchId],
    queryFn: async (): Promise<MatchDetailDTO> => {
      const supabase = getSupabaseBrowserClient();

      // ✅ JOIN query - 한 번에!
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          gyms(*),
          users!matches_host_id_fkey(*),
          teams(*)
        `)
        .eq('id', matchId)
        .single();

      if (error) throw error;

      // Entity mappers 재사용
      const match = matchRowToEntity(data);
      const gym = gymRowToEntity(data.gyms);
      const host = userRowToEntity(data.users);
      const team = data.teams ? teamRowToEntity(data.teams) : null;

      return toMatchDetailDTO(match, gym, host, team);
    },
  });
}
```

**Step 4: 빌드 검증**

```bash
npm run build
```

---

## Task 3.2: @x 사용처 분석

**Files:**
- Analyze: All files importing from `@x` directories

**Step 1: @x import 사용처 검색**

```bash
# @x 패턴 사용처 모두 찾기
grep -r "from '@/entities/.*/@x/" src/ --include="*.ts" --include="*.tsx"
```

**Step 2: 사용처 문서화**

각 @x import가:
- 어느 파일에서 사용되는지
- 어떤 entity를 cross-import하는지
- 어떻게 수정해야 하는지

결과를 문서화.

---

## Task 3.3: features/ 파일 수정 (cross-import 제거)

**Files:**
- Modify: All files using `@x` imports

**Step 1: 각 features/ 파일 수정**

패턴:
```typescript
// Before (❌)
import { useMatch } from '@/entities/team/@x/match';

// After (✅)
import { useMatch } from '@/entities/match';
```

**Step 2: 검증**

```bash
# @x import가 남아있는지 확인
grep -r "@x" src/ --include="*.ts" --include="*.tsx"
# 결과가 없어야 함!
```

**Step 3: 빌드 테스트**

```bash
npm run build
```

---

## Task 3.4: @x 폴더 삭제

**Files:**
- Delete: `src/entities/team/@x/`
- Delete: `src/entities/match/@x/`
- Delete: `src/entities/application/@x/`

**Step 1: @x 폴더 삭제**

```bash
rm -rf src/entities/team/@x
rm -rf src/entities/match/@x
rm -rf src/entities/application/@x
```

**Step 2: 검증**

```bash
# @x 폴더가 남아있는지 확인
find src/entities -type d -name "@x"
# 결과가 없어야 함!
```

**Step 3: 빌드 재확인**

```bash
npm run build
```

---

## Task 3.5: CLAUDE.md 업데이트

**Files:**
- Modify: `CLAUDE.md`

**Step 1: @x 패턴 제거 내역 추가**

CLAUDE.md의 "Common Mistakes" 섹션에 추가:

```markdown
**실수 6: @x 패턴 사용 (Cross-import 위장)**

\`\`\`typescript
// ❌ @x 패턴도 cross-import! (entities 간 의존성)
// entities/team/@x/match.ts
export { useMatch } from '@/entities/match';

// ✅ features에서 직접 import
// features/team-detail/ui/team-matches.tsx
import { useMatch } from '@/entities/match';
import { useTeam } from '@/entities/team';

// 조합은 features에서!
const match = useMatch(matchId);
const team = useTeam(match.teamId);
\`\`\`

**핵심:** entities는 완전히 독립적! @x 패턴도 금지!
```

---

## Task 3.6: WORK_LOG.md 업데이트

**Files:**
- Modify: `WORK_LOG.md`

**Step 1: Phase 3 완료 내역 추가**

```markdown
## 🎯 Phase 3 완료! (2026-02-14)

**Phase 3 - Entities 순수성 확보 & @x 제거: 완료**

### 문제의 본질
- ❌ Entities가 다른 entities API 호출 (순환 종속성!)
- ❌ @x 패턴으로 우회했으나 근본 해결 아님
- ❌ N번의 개별 API 호출 (비효율)

### 완료된 작업
1. ✅ Entities 순수성 확보
   - Entities는 자기 테이블만 다룸
   - 다른 entities API 호출 제거

2. ✅ Features에 JOIN Query 추가
   - 한 번의 query로 관련 데이터 fetch
   - Entity mappers 재사용
   - Flat DTO 변환

3. ✅ @x 폴더 제거
   - entities/team/@x/ 삭제
   - entities/match/@x/ 삭제
   - entities/application/@x/ 삭제

4. ✅ CLAUDE.md 업데이트
   - 실수 6 추가: Entities 간 API 호출
   - JOIN Query 패턴 문서화

### 결과

**Data Fetching:**
\`\`\`typescript
// Before (❌) - N번의 API 호출
const match = await matchService.getMatch(matchId);     // 1
const gym = await gymService.getGym(match.gymId);       // 2
const host = await userService.getUser(match.hostId);   // 3
const team = await teamService.getTeam(match.teamId);   // 4

// After (✅) - 1번의 JOIN query
const { data } = await supabase
  .from('matches')
  .select(\`*, gyms(*), users(*), teams(*)\`)
  .eq('id', matchId)
  .single();
\`\`\`

**Entities 독립성:**
\`\`\`
Before: entities/match/api/ → teamService.getTeam() ❌
After:  entities/match/api/ → matches 테이블만 ✅
\`\`\`
```

---

## Task 3.7: Commit

**Step 1: 변경사항 커밋**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor: Establish entity purity & remove @x pattern

## 문제의 본질
- Entities가 다른 entities API 호출 (순환 종속성)
- @x 패턴으로 우회했으나 근본 해결 아님
- N번의 개별 API 호출 (비효율)

## 수정 내역

### 1. Entities 순수성 확보
- Entities는 자기 테이블만 다룸
- 다른 entities API 호출 제거

### 2. Features에 JOIN Query 추가
- 한 번의 Supabase JOIN으로 관련 데이터 fetch
- Entity mappers 재사용
- Flat DTO 변환

### 3. @x 폴더 제거
- entities/team/@x/ 삭제
- entities/match/@x/ 삭제
- entities/application/@x/ 삭제

## FSD 원칙 확립
✅ Entities = 자기 테이블만 (완전 독립!)
✅ Features = JOIN query + 조합 + DTO
❌ Entities 간 API 호출 금지
❌ @x 패턴 금지

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## 🎉 Phase 3 완료 후 상태

### FSD 계층 구조 (완전 준수)
```
app/      → features/ + entities/ + shared/
features/ → entities/ + shared/
entities/ → shared/ (독립적!)

✅ entities DO NOT import from other entities
✅ features DO NOT import from other features
```

### Entities 독립성 확보
```
entities/
├── team/model/types.ts       ✅ Team 도메인만
├── match/model/types.ts      ✅ Match 도메인만
├── application/model/types.ts ✅ Application 도메인만
├── gym/model/types.ts        ✅ Gym 도메인만
└── user/model/types.ts       ✅ User 도메인만

❌ @x 폴더 없음!
```

### Features 조합 패턴
```typescript
// features/team-detail/ui/team-matches.tsx
import { useMatch } from '@/entities/match';      ✅
import { useTeam } from '@/entities/team';        ✅
import { useGym } from '@/entities/gym';          ✅

function TeamMatches({ teamId }: Props) {
  const team = useTeam(teamId);
  const matches = useMatches({ teamId });

  return matches.map(match => {
    const gym = useGym(match.gymId);  // 조합!
    return <MatchCard match={match} gym={gym} />;
  });
}
```

---

## 다음 단계: Phase 4

**Phase 4 - features/ UI Types 재설계**
- features/match/model/types.ts 정리 (UI 전용 타입만)
- features/application/model/types.ts 정리
- Flat DTO 구조 설계
- JOIN query + mapper 패턴 구현

---

**마지막 업데이트**: 2026-02-14 (Phase 3 계획 작성)
