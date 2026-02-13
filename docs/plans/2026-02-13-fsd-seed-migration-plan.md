# FSD + Seed Design Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Draft project to FSD architecture with Seed Design system

**Architecture:** Hybrid FSD approach maintaining 3-folder structure while adding entities/widgets layers. Parallel Seed Design integration with Foundation-first strategy.

**Tech Stack:** Next.js 15, TypeScript, Seed Design, React Query, Tailwind CSS 4

---

## 🎯 Phase 1: Seed Foundation Setup (Week 1)

**Objective:** Install Seed Design packages and apply Foundation tokens without breaking existing UI.

### Task 1.1: Install Seed Design Packages (Manual)

**Files:**
- Modify: `package.json:12-72`

**Step 1: Add Seed Design dependencies**

Run: `pnpm add @seed-design/react @seed-design/css`

Expected: Package installation success

**Step 2: Verify installation**

Run: `pnpm list | grep seed-design`

Expected: See `@seed-design/react`, `@seed-design/css`

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: install Seed Design packages

Add @seed-design/react and @seed-design/css for design system integration.
Using Manual installation (no bundler plugin required).

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.2: Setup Seed Design Configuration

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `seed-design.json`

**Step 1: Import Seed CSS in layout.tsx**

Add import at the top of `src/app/layout.tsx`:

```typescript
import "@seed-design/css/base.css";
import type { Metadata } from "next";
import "./globals.css";
```

**Step 2: Create seed-design.json**

```json
{
  "rsc": true,
  "tsx": true,
  "path": "./seed-design",
  "telemetry": true
}
```

**Step 3: Commit**

```bash
git add src/app/layout.tsx seed-design.json
git commit -m "feat: setup Seed Design configuration

- Import Seed CSS base styles in layout.tsx
- Create seed-design.json for CLI support
- Enable RSC mode for Next.js App Router

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.3: Create Draft Brand Color Tokens

**Files:**
- Create: `src/shared/config/seed-tokens.ts`

**Step 1: Create seed tokens file**

```typescript
/**
 * Seed Design Token Configuration
 * Draft 브랜드 컬러로 커스터마이징된 Seed Design 토큰
 */

// Draft Brand Colors (replacing Carrot)
export const draftColors = {
  draft: {
    50: '#FFF5EB',
    100: '#FFE5CC',
    200: '#FFCC99',
    300: '#FFB366',
    400: '#FF9933',
    500: '#FF6600',  // Primary Brand Color
    600: '#E65C00',
    700: '#CC5200',
    800: '#B34700',
    900: '#993D00',
  },
} as const;

// Semantic Color Mapping
export const semanticColors = {
  primary: 'var(--seed-scale-color-draft-500)',
  primaryForeground: 'var(--seed-scale-color-gray-00)',
} as const;
```

**Step 2: Commit**

```bash
git add src/shared/config/seed-tokens.ts
git commit -m "feat: add Draft brand color tokens

Create Draft-branded color tokens based on Seed Design system.
Primary color: #FF6600 (Draft Orange)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.4: Update Tailwind Config with Draft Colors

**Files:**
- Modify: `tailwind.config.ts:1-45`

**Step 1: Backup current config**

Run: `cp tailwind.config.ts tailwind.config.ts.backup`

**Step 2: Update Tailwind config**

```typescript
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Keep existing system colors
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "hsl(var(--border))",

        // Draft brand colors (Seed-compatible)
        draft: {
          50: '#FFF5EB',
          100: '#FFE5CC',
          200: '#FFCC99',
          300: '#FFB366',
          400: '#FF9933',
          500: '#FF6600',  // Primary
          600: '#E65C00',
          700: '#CC5200',
          800: '#B34700',
          900: '#993D00',
        },

        // Keep primary mapped to draft
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        lg: `var(--radius)`,
        md: `calc(var(--radius) - 2px)`,
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
```

**Step 3: Test build**

Run: `pnpm build`

Expected: Build succeeds without errors

**Step 4: Commit**

```bash
git add tailwind.config.ts
git commit -m "feat: add Draft brand colors to Tailwind config

Add Draft color palette (orange #FF6600) compatible with Seed Design.
Maintain existing color system for backward compatibility.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.5: Update globals.css with Seed Foundation

**Files:**
- Modify: `src/app/globals.css:1-214`

**Step 1: Backup current globals.css**

Run: `cp src/app/globals.css src/app/globals.css.backup`

**Step 2: Add Seed Design imports (keep existing for now)**

```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");

@config "../../tailwind.config.ts";
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;

    /* 🟠 Draft Brand Color (Seed-compatible) */
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;

    /* Primary: Draft Orange #FF6600 */
    --primary: 24 95% 53%;
    --primary-foreground: 0 0% 98%;

    /* Seed Design semantic tokens */
    --seed-scale-color-draft-500: #FF6600;
    --seed-semantic-color-primary: var(--seed-scale-color-draft-500);

    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;

    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;

    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 24 95% 53%;

    --radius: 0.75rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;

    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;

    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;

    --primary: 24 95% 53%;
    --primary-foreground: 0 0% 98%;

    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;

    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;

    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;

    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;

    --ring: 24 95% 53%;
  }

  * {
    @apply border-border outline-ring/50;
  }

  body {
    @apply bg-background text-foreground;
  }
}

@layer base {
  * {
    border-color: hsl(var(--border));
  }
  body {
    @apply bg-background text-foreground;
  }
}

@layer utilities {
  .no-scrollbar::-webkit-scrollbar {
      display: none;
  }
  .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
}

/* Keep existing OKLCH tokens for now */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... rest of OKLCH tokens ... */
}
```

**Step 3: Test in dev mode**

Run: `pnpm dev`

Action: Open http://localhost:3000 and verify UI looks unchanged

**Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add Seed Design foundation tokens to globals.css

Add Draft brand color tokens (--seed-scale-color-draft-500) to CSS.
Maintain existing HSL/OKLCH tokens for backward compatibility.

Phase 1: Foundation setup - no visual changes expected.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 1.6: Verification & Documentation

**Files:**
- Create: `docs/migration/phase-1-verification.md`

**Step 1: Create verification document**

```markdown
# Phase 1 Verification Checklist

**Date:** 2026-02-13
**Phase:** Seed Foundation Setup

## ✅ Installation Verification

- [ ] `@seed-design/react` installed
- [ ] `@seed-design/css` installed
- [ ] `seed-design.json` created
- [ ] Seed CSS imported in layout.tsx
- [ ] `pnpm build` succeeds
- [ ] `pnpm dev` runs without errors

## ✅ Token Verification

- [ ] `src/shared/config/seed-tokens.ts` created
- [ ] Draft brand colors defined (#FF6600)
- [ ] Tailwind config includes draft color palette
- [ ] globals.css includes Seed tokens

## ✅ UI Regression Check

Test these pages for visual regressions:

- [ ] Home page (경기 목록)
- [ ] Match detail page
- [ ] Match create page
- [ ] Login page
- [ ] My page

**Expected:** All pages look identical to before migration.

## 🔍 Manual Verification Steps

1. Run `pnpm dev`
2. Visit each page above
3. Check primary color still #FF6600
4. Check no layout shifts
5. Check no console errors

## ✅ Sign-off

- [ ] All checks passed
- [ ] Ready for Phase 2

**Verified by:** ________________
**Date:** ________________
```

**Step 2: Run verification**

Run through all checklist items manually

**Step 3: Commit**

```bash
git add docs/migration/phase-1-verification.md
git commit -m "docs: add Phase 1 verification checklist

Document verification steps for Seed Foundation setup.
All existing UI should remain unchanged.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🏗️ Phase 2: FSD Structure Migration (Weeks 2-4)

**Objective:** Create entities, widgets layers and reorganize API following FSD principles.

### Task 2.1: Create entities/match Structure

**Files:**
- Create: `src/entities/match/api/match-service.ts`
- Create: `src/entities/match/api/queries.ts`
- Create: `src/entities/match/api/mutations.ts`
- Create: `src/entities/match/api/keys.ts`
- Create: `src/entities/match/api/index.ts`
- Create: `src/entities/match/model/match-types.ts`
- Create: `src/entities/match/model/index.ts`
- Create: `src/entities/match/index.ts`

**Step 1: Create directory structure**

```bash
mkdir -p src/entities/match/api
mkdir -p src/entities/match/model
mkdir -p src/entities/match/@x
```

**Step 2: Create match-service.ts (unified CRUD)**

```typescript
/**
 * Match Service
 * Unified CRUD for both GUEST_RECRUIT and TEAM_MATCH types
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/database.types';
import { logRequest, logResponse } from '@/shared/lib/logger';

type MatchType = 'GUEST_RECRUIT' | 'TEAM_MATCH';
type MatchStatusValue = 'RECRUITING' | 'CLOSED' | 'CONFIRMED' | 'CANCELED';

export class MatchService {
  private readonly SERVICE_NAME = 'MatchService';

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get matches with optional type filter
   */
  async getMatches(filter?: { type?: MatchType; status?: MatchStatusValue }) {
    logRequest(this.SERVICE_NAME, 'getMatches', filter);

    let query = this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        host:users!host_id (*),
        team:teams!team_id (*)
      `)
      .order('start_time', { ascending: true });

    if (filter?.type) {
      query = query.eq('match_type', filter.type);
    }

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query;

    if (error) {
      logResponse(this.SERVICE_NAME, 'getMatches', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getMatches', { count: data?.length ?? 0 });
    return data ?? [];
  }

  /**
   * Get match detail (type-agnostic)
   */
  async getMatchDetail(id: string) {
    logRequest(this.SERVICE_NAME, 'getMatchDetail', { id });

    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        host:users!host_id (*),
        team:teams!team_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      logResponse(this.SERVICE_NAME, 'getMatchDetail', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getMatchDetail', data);
    return data;
  }

  /**
   * Create match (supports both types)
   */
  async createMatch(data: any) {
    logRequest(this.SERVICE_NAME, 'createMatch', data);

    const { data: match, error } = await this.supabase
      .from('matches')
      .insert(data)
      .select()
      .single();

    if (error) {
      logResponse(this.SERVICE_NAME, 'createMatch', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'createMatch', { matchId: match.id });
    return match;
  }

  /**
   * Update match
   */
  async updateMatch(id: string, data: any) {
    logRequest(this.SERVICE_NAME, 'updateMatch', { id, data });

    const { data: match, error } = await this.supabase
      .from('matches')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logResponse(this.SERVICE_NAME, 'updateMatch', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'updateMatch', { matchId: match.id });
    return match;
  }

  /**
   * Update match status
   */
  async updateStatus(id: string, status: MatchStatusValue) {
    logRequest(this.SERVICE_NAME, 'updateStatus', { id, status });

    const { data, error } = await this.supabase
      .from('matches')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logResponse(this.SERVICE_NAME, 'updateStatus', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'updateStatus', data);
    return data;
  }

  /**
   * Cancel match
   */
  async cancelMatch(id: string) {
    return this.updateStatus(id, 'CANCELED');
  }
}

export function createMatchService(supabase: SupabaseClient<Database>) {
  return new MatchService(supabase);
}
```

**Step 3: Create keys.ts**

```typescript
/**
 * Match Query Keys
 * Structured keys for both GUEST_RECRUIT and TEAM_MATCH
 */

export const matchKeys = {
  all: ['matches'] as const,

  lists: (filter?: { type?: string; status?: string }) =>
    [...matchKeys.all, 'list', filter] as const,

  detail: (id: string) =>
    [...matchKeys.all, 'detail', id] as const,

  // Guest Recruit specific
  guestRecruit: {
    all: ['matches', 'guest-recruit'] as const,
    recruiting: () => [...matchKeys.guestRecruit.all, 'recruiting'] as const,
    detail: (id: string) => [...matchKeys.guestRecruit.all, 'detail', id] as const,
  },

  // Team Match specific
  teamMatch: {
    all: ['matches', 'team-match'] as const,
    upcoming: () => [...matchKeys.teamMatch.all, 'upcoming'] as const,
    detail: (id: string) => [...matchKeys.teamMatch.all, 'detail', id] as const,
  },
} as const;
```

**Step 4: Create queries.ts**

```typescript
/**
 * Match Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from './match-service';
import { matchKeys } from './keys';

type MatchType = 'GUEST_RECRUIT' | 'TEAM_MATCH';

/**
 * Get matches with optional filter
 */
export function useMatches(filter?: { type?: MatchType }) {
  return useQuery({
    queryKey: matchKeys.lists(filter),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createMatchService(supabase);
      return service.getMatches(filter);
    },
  });
}

/**
 * Get match detail
 */
export function useMatch(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createMatchService(supabase);
      return service.getMatchDetail(id);
    },
    enabled: !!id,
  });
}
```

**Step 5: Create mutations.ts**

```typescript
/**
 * Match Mutation Hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from './match-service';
import { matchKeys } from './keys';

export function useCreateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const supabase = getSupabaseBrowserClient();
      const service = createMatchService(supabase);
      return service.createMatch(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      toast.success('경기가 생성되었습니다');
    },
    onError: (error: Error) => {
      toast.error(`경기 생성 실패: ${error.message}`);
    },
  });
}

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createMatchService(supabase);
      return service.updateMatch(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.all });
      toast.success('경기가 수정되었습니다');
    },
    onError: (error: Error) => {
      toast.error(`경기 수정 실패: ${error.message}`);
    },
  });
}
```

**Step 6: Create barrel exports**

```typescript
// src/entities/match/api/index.ts
export * from './match-service';
export * from './queries';
export * from './mutations';
export { matchKeys } from './keys';

// src/entities/match/model/index.ts
export * from './match-types';

// src/entities/match/index.ts
export * from './api';
export * from './model';
```

**Step 7: Commit**

```bash
git add src/entities/match
git commit -m "feat(entities): create entities/match with unified service

Create Match entity layer following FSD architecture:
- Unified MatchService for GUEST_RECRUIT and TEAM_MATCH
- React Query hooks (useMatches, useMatch, useCreateMatch, useUpdateMatch)
- Structured query keys for type-based filtering

Phase 2.1: entities/match foundation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Task 2.2: Migrate features/match to use entities/match

**Files:**
- Modify: `src/app/page.tsx` (home - match list)
- Modify: `src/app/matches/[id]/page.tsx` (match detail)
- Modify: `src/app/matches/create/page.tsx` (match create)

**Step 1: Update home page to use entities/match**

```typescript
// src/app/page.tsx
'use client';

import { useMatches } from '@/entities/match';  // ← NEW: from entities
// OLD: import { useRecruitingMatches } from '@/features/match/api/queries';

export default function Home() {
  const { data: matches, isLoading } = useMatches({
    type: 'GUEST_RECRUIT'
  });  // ← NEW: filtered by type

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {matches?.map(match => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  );
}
```

**Step 2: Test the page**

Run: `pnpm dev`

Action: Visit http://localhost:3000 and verify match list loads

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "refactor: migrate home page to use entities/match

Replace features/match/api with entities/match API.
Use unified useMatches hook with type filter.

Phase 2.2: Migration step 1/3

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

**Note:** This implementation plan is comprehensive and covers all 4 phases. Due to length constraints, I'm showing the detailed pattern for Phase 1 and early Phase 2 tasks. The remaining tasks follow the same bite-sized structure:

- Each task is 2-5 minute action
- Exact file paths and line numbers
- Complete code samples (no "add validation" shortcuts)
- Test commands with expected output
- Commit after each task

Would you like me to:
1. Continue with the complete plan (Tasks 2.3-4.5)?
2. Save this partial plan and provide execution options?
3. Focus on a specific phase in detail?
