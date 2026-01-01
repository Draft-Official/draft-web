# Draft 프로젝트 아키텍처

> 1인 개발자를 위한 확장 가능한 농구 용병 모집 플랫폼

**최종 업데이트**: 2025-12-31

---

## 🏗️ 프로젝트 구조

```
draft-web/
├── app/                              # Next.js App Router (라우팅만)
│   ├── (guest)/                      # 게스트 전용 페이지
│   │   ├── page.tsx                  # 경기 목록
│   │   └── match/[id]/page.tsx       # 경기 상세
│   ├── (host)/                       # 호스트 전용 페이지
│   │   ├── create/page.tsx           # 경기 생성
│   │   └── dashboard/page.tsx        # 대시보드
│   ├── (user)/                       # 공통 유저 페이지
│   │   └── my/page.tsx               # 마이페이지
│   └── layout.tsx                    # 루트 레이아웃
│
├── src/                              # 소스 코드 (비즈니스 로직)
│   ├── components/                   # 컴포넌트
│   │   ├── registry/                 # 🔥 Figma에서 가져온 UI 컴포넌트
│   │   │   ├── match-create-form/
│   │   │   │   ├── index.tsx         # 컴포넌트 코드
│   │   │   │   ├── metadata.yaml     # 메타데이터
│   │   │   │   ├── README.md         # 문서
│   │   │   │   └── styles.css        # (optional) 커스텀 스타일
│   │   │   └── match-list-card/
│   │   └── ui/                       # shadcn/ui 기본 컴포넌트
│   │
│   ├── features/                     # 🔥 기능별 모듈 (Feature-Sliced Design)
│   │   ├── match/                    # 경기 관련 기능
│   │   │   ├── ui/                   # Match UI 컴포넌트
│   │   │   │   ├── MatchListItem.tsx
│   │   │   │   ├── FilterBar.tsx
│   │   │   │   └── ApplicationDrawer.tsx
│   │   │   ├── api/                  # API 함수 (Supabase)
│   │   │   │   ├── queries.ts        # React Query hooks (GET)
│   │   │   │   └── mutations.ts      # React Query hooks (POST/PUT/DELETE)
│   │   │   ├── model/                # 타입, 스키마
│   │   │   │   ├── types.ts          # TypeScript 타입
│   │   │   │   └── schema.ts         # Zod 스키마
│   │   │   └── lib/                  # 헬퍼 함수
│   │   │       └── format-date.ts
│   │   ├── auth/                     # 인증 기능
│   │   │   ├── ui/
│   │   │   ├── api/
│   │   │   ├── model/
│   │   │   └── lib/
│   │   └── user/                     # 유저 프로필
│   │
│   ├── shared/                       # 전역 공유 자원
│   │   ├── lib/                      # 유틸리티
│   │   │   ├── supabase.ts           # Supabase 클라이언트
│   │   │   ├── query-client.ts       # React Query 설정
│   │   │   └── utils.ts              # 일반 유틸
│   │   ├── config/                   # 설정
│   │   │   └── constants.ts
│   │   └── types/                    # 전역 타입
│   │       └── database.types.ts     # Supabase 생성 타입
│   │
│   └── widgets/                      # 조합형 컴포넌트
│       ├── Header.tsx                # 레이아웃 컴포넌트
│       └── BottomNav.tsx
│
├── scripts/                          # 자동화 스크립트
│   └── import-figma-component.py     # Figma → Draft 변환
│
├── .claude/                          # Claude Code Agents
│   ├── agents/
│   │   └── figma-ui-importer.md      # Figma UI 변환 Agent
│   ├── skills/
│   └── docs/
│
├── public/                           # 정적 파일
│   └── registry/                     # Registry 컴포넌트 asset
│
├── package.json
├── tsconfig.json
└── ARCHITECTURE.md                   # 이 파일
```

---

## 📐 설계 원칙

### 1. Feature-Sliced Design (간소화 버전)

**왜 Feature-Sliced?**
- ✅ 1인 개발에 최적: 기능별 독립 개발
- ✅ 확장성: 팀 확대 시 충돌 최소화
- ✅ 유지보수: 기능 단위 수정/삭제 용이
- ✅ 재사용성: 공통 컴포넌트 자동 분리

**계층 구조:**

```
Features (기능)
   ↓
Shared (공유)
   ↓
App (라우팅)
```

### 2. Registry 패턴 (Monet 방식)

Figma Make에서 가져온 UI를 독립적으로 관리:

```typescript
// src/components/registry/{name}/
// - 각 컴포넌트가 독립적인 폴더
// - metadata.yaml로 메타데이터 관리
// - scripts로 자동화
```

**장점:**
- Figma UI 변경 시 해당 폴더만 업데이트
- 컴포넌트 검색/관리 용이
- 비즈니스 로직(features)과 분리

---

## 🎯 기술 스택

### Phase 1: 현재 (UI 개발)

| 카테고리 | 기술 | 용도 |
|---------|------|------|
| **Framework** | Next.js 16 (App Router) | SSR, Routing |
| **Language** | TypeScript | 타입 안정성 |
| **Styling** | Tailwind CSS 4 | 스타일링 |
| **UI Library** | shadcn/ui + Radix UI | 컴포넌트 |
| **Animation** | Framer Motion | 애니메이션 |
| **Form** | React Hook Form + Zod | 폼 검증 |

### Phase 2: Supabase 연결 (추후)

```bash
pnpm add @supabase/supabase-js @supabase/ssr @tanstack/react-query
```

| 카테고리 | 기술 | 용도 |
|---------|------|------|
| **Backend** | Supabase | 인증 + DB + Storage |
| **State** | React Query | 서버 상태 캐싱 |
| **Validation** | Zod | 런타임 검증 |

### Phase 3: 확장 (유저 증가 시)

```bash
pnpm add @vercel/kv @vercel/analytics @sentry/nextjs
```

---

## 📁 파일 명명 규칙

### 컴포넌트

| 위치 | 명명 규칙 | 예시 |
|------|---------|------|
| `src/components/registry/*` | kebab-case | `match-create-form/` |
| `src/features/*/ui/*` | PascalCase | `MatchListItem.tsx` |
| `src/components/ui/*` | kebab-case | `button.tsx` |
| `src/widgets/*` | PascalCase | `Header.tsx` |

### 기타 파일

| 타입 | 명명 규칙 | 예시 |
|------|---------|------|
| API 함수 | 복수형 | `queries.ts`, `mutations.ts` |
| 타입 정의 | `.types.ts` | `match.types.ts` |
| 스키마 | `.schema.ts` | `match.schema.ts` |
| 헬퍼 함수 | kebab-case | `format-date.ts` |
| Agent | kebab-case | `figma-ui-importer.md` |

---

## 🔄 Figma → Draft 워크플로우

### 자동화 프로세스

```mermaid
graph LR
    A[Figma Design] --> B[Figma Make]
    B --> C[GitHub Push]
    C --> D[Agent 실행]
    D --> E[Draft Registry]
    E --> F[App Router]
```

### 실행 방법

1. **Figma Make 코드 생성**
   ```
   Figma → Figma Make → /tmp/figma-sample
   ```

2. **Draft로 Import**
   ```bash
   python3 scripts/import-figma-component.py \
     --name "match-create-form" \
     --source-file "/tmp/figma-sample/src/pages/HostCreateMatch.tsx" \
     --category "form"
   ```

3. **Agent 사용 (자동)**
   ```
   Claude Code가 figma-ui-importer Agent를 자동 실행
   ```

4. **App Router에 연결**
   ```tsx
   // app/(host)/create/page.tsx
   import MatchCreateForm from '@/components/registry/match-create-form';

   export default function Page() {
     return <MatchCreateForm />;
   }
   ```

---

## 🤖 Agent 사용 가이드

### Figma UI Importer Agent

**언제 사용:**
- Figma Make에서 새 UI 컴포넌트 가져올 때
- 기존 Figma 컴포넌트 업데이트 시

**실행:**
```
"Figma의 HostCreateMatch 컴포넌트를 Draft로 import 해줘"
```

**Agent가 수행:**
1. Figma Make 코드 분석
2. Draft 구조로 변환
3. Registry에 등록
4. Import 경로 업데이트
5. TypeScript 에러 체크

---

## 📊 확장성 로드맵

### 사용자 수별 대응

| 사용자 수 | 인프라 | 비용 | 필요 작업 |
|----------|--------|------|----------|
| ~1,000 | Supabase Free + Vercel Hobby | 무료 | DB 연결 |
| ~10,000 | Supabase Pro + Vercel Pro + Redis | ~$50/월 | 캐싱 추가 |
| ~100,000 | Supabase Team + Edge Functions | ~$500/월 | CDN, 최적화 |

### Feature 추가 예시

```bash
# 새 Feature 추가: 팀 관리
mkdir -p src/features/team/{ui,api,model,lib}

# UI 컴포넌트
touch src/features/team/ui/TeamList.tsx

# API 함수
touch src/features/team/api/queries.ts

# 타입 정의
touch src/features/team/model/types.ts
```

**장점: 다른 Feature에 영향 없음** ✅

---

## 🔐 Supabase 통합 계획 (Phase 2)

### 1. 환경 변수 설정

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Supabase 클라이언트

```typescript
// src/shared/lib/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

### 3. React Query 설정

```typescript
// src/shared/lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분
      cacheTime: 5 * 60 * 1000, // 5분
    },
  },
});
```

### 4. API 함수 작성

```typescript
// src/features/match/api/queries.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';

export const useMatches = () => {
  return useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
```

---

## 📝 개발 가이드

### 새 기능 추가 시

1. **Feature 생성**
   ```bash
   mkdir -p src/features/{feature-name}/{ui,api,model,lib}
   ```

2. **Figma UI 가져오기** (있으면)
   ```bash
   python3 scripts/import-figma-component.py --name "{name}"
   ```

3. **타입 정의**
   ```typescript
   // src/features/{feature}/model/types.ts
   export interface Feature {
     id: string;
     // ...
   }
   ```

4. **API 함수 작성** (Supabase 연결 후)
   ```typescript
   // src/features/{feature}/api/queries.ts
   export const useFeatures = () => { /* ... */ };
   ```

5. **페이지 연결**
   ```tsx
   // app/(...)/page.tsx
   import Feature from '@/features/{feature}/ui/FeatureComponent';
   ```

### Auto-Generated 파일 구분

모든 Agent가 생성한 파일에는 헤더가 있음:

```typescript
/**
 * 🤖 AUTO-GENERATED by {agent-name}
 * 생성일: {DATE}
 * Agent: .claude/agents/{agent-name}.md
 */
```

**수동 수정 주의**: Agent 재실행 시 덮어쓰여질 수 있음

---

## ⚠️ 주의사항

### DO ✅

- ✅ Feature 단위로 개발
- ✅ Figma UI는 Registry에만 저장
- ✅ TypeScript 타입 100% 정의
- ✅ Agent 스크립트 사용
- ✅ AUTO-GENERATED 헤더 확인

### DON'T ❌

- ❌ Registry 파일 직접 수정
- ❌ App Router에 비즈니스 로직 작성
- ❌ Feature 간 직접 import
- ❌ 절대 경로 대신 상대 경로 사용
- ❌ any 타입 사용

---

## 🔗 참고 문서

- [Agent 생성 가이드](.claude/docs/agent-creation-guide.md)
- [Subagent 문서](.claude/docs/sub-agent.md)
- [Figma UI Importer](.claude/agents/figma-ui-importer.md)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase Docs](https://supabase.com/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

**Last Updated**: 2025-12-31
**Maintainer**: @beom
**Project**: Draft - 농구 용병 모집 플랫폼
