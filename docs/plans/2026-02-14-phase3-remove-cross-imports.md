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

## 🚨 새로운 문제 발견: @x Cross-Import 패턴

### 현재 위반 중인 FSD 원칙

```
entities/
├── team/@x/match.ts          ❌ team이 match를 cross-import!
├── match/@x/team.ts          ❌ match가 team을 cross-import!
├── match/@x/application.ts   ❌ match가 application을 cross-import!
└── application/@x/match.ts   ❌ application이 match를 cross-import!
```

**문제점:**
- entities는 다른 entities를 import하면 안 됨 (FSD 원칙)
- `@x` 패턴도 cross-import이므로 위반!
- CLAUDE.md "실수 2"에도 명시되어 있음

**올바른 방법:**
```typescript
// ❌ entities에서 cross-import
import { useMatch } from '@/entities/team/@x/match';

// ✅ features에서 각각 import하고 조합
import { useMatch } from '@/entities/match';
import { useTeam } from '@/entities/team';

function Component() {
  const match = useMatch(matchId);
  const team = useTeam(match.teamId);  // 조합은 features에서!
}
```

---

## 📋 Phase 3 작업 계획

### 목표
1. ❌ 모든 `@x` 폴더 제거
2. ✅ features/에서 올바르게 entities 조합
3. ✅ FSD 원칙 완벽 준수

---

## Task 3.1: @x 사용처 분석

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

## Task 3.2: features/ 파일 수정 (cross-import 제거)

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

## Task 3.3: @x 폴더 삭제

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

## Task 3.4: CLAUDE.md 업데이트

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

## Task 3.5: WORK_LOG.md 업데이트

**Files:**
- Modify: `WORK_LOG.md`

**Step 1: Phase 3 완료 내역 추가**

```markdown
## 🎯 Phase 3 완료! (2026-02-14)

**Phase 3 - Remove @x Cross-Imports: 완료**

### 문제 발견
- entities/team/@x/match.ts ❌
- entities/match/@x/team.ts ❌
- entities/match/@x/application.ts ❌
- entities/application/@x/match.ts ❌
→ @x 패턴도 FSD 원칙 위반!

### 완료된 작업
✅ @x import 사용처 분석 및 수정
✅ features/에서 올바르게 entities 직접 import
✅ 모든 @x 폴더 삭제
✅ CLAUDE.md에 실수 6 추가
✅ 빌드 성공 확인

### 결과
**Before:**
\`\`\`
entities/team/@x/match.ts     ❌ cross-import
features/team/ui/comp.tsx
  import from '@/entities/team/@x/match'  ❌
\`\`\`

**After:**
\`\`\`
entities/team/               ✅ 독립적!
features/team/ui/comp.tsx
  import from '@/entities/match'          ✅
  import from '@/entities/team'           ✅
\`\`\`
```

---

## Task 3.6: Commit

**Step 1: 변경사항 커밋**

```bash
git add -A
git commit -m "$(cat <<'EOF'
refactor: Remove @x cross-import pattern (FSD violation)

## 문제
- entities 간 @x cross-import 존재
- FSD 원칙 위반: entities는 완전히 독립적이어야 함

## 수정 내역
- ❌ entities/team/@x/match.ts 삭제
- ❌ entities/match/@x/team.ts 삭제
- ❌ entities/match/@x/application.ts 삭제
- ❌ entities/application/@x/match.ts 삭제
- ✅ features/에서 올바르게 각 entity 직접 import

## 원칙 확립
entities는 완전히 독립적!
- ❌ entities 간 cross-import
- ❌ @x 패턴
- ✅ features에서 조합

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
