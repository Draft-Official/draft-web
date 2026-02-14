# FSD + Seed Design Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate Draft project to FSD architecture with Seed Design system

**Architecture:** Hybrid FSD structure + strict boundary rule. Entities stay table-scoped and independent, while features own JOIN queries, composition, and DTO contracts. Seed Design integration remains Foundation-first.

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

**Objective:** Align with strict FSD boundaries.
- **Entities** = 자기 테이블만 (완전 독립)
- **Features** = JOIN query + 조합 + DTO

### Task 2.1: Create Entity Foundations (No Cross-import)

**Files:**
- Create/Modify: `src/entities/match/api/{match-service.ts,mapper.ts,keys.ts}`
- Create/Modify: `src/entities/application/api/{application-service.ts,keys.ts}`
- Create/Modify: `src/entities/team/api/{team-service.ts,mapper.ts,keys.ts}`
- Create/Modify: `src/entities/*/model/types.ts`, `src/entities/*/index.ts`

**Rules:**
1. `entities/*`는 자기 테이블만 조회/수정 (`select('*')` 기준)
2. `entities/*` 내부에서 다른 `@/entities/*` import 금지
3. `src/entities/*/@x` 폴더 생성 금지

**Verification:**
```bash
find src/entities -type d -name '@x'
rg -n "from '@/entities/" src/entities --glob '*.ts'
```

---

### Task 2.2: Move Query/Mutation Orchestration to Features

**Files:**
- Modify: `src/features/match/api/queries.ts`
- Modify: `src/features/application/api/{queries.ts,mutations.ts}`
- Modify: `src/features/schedule/api/queries.ts`
- Modify: `src/features/team/api/{team-info,membership,match}/*`

**Steps:**
1. Feature layer에서 필요한 JOIN query를 실행
2. DB Row -> Entity mapper (`entities/*/api/mapper.ts`) 적용
3. Entity -> DTO mapper (`features/*/lib/mappers.ts`) 적용
4. Hook 반환 타입을 DTO로 고정

---

### Task 2.3: Match DTO Pattern as Baseline

**Files:**
- `src/features/match/model/types.ts`
- `src/features/match/lib/mappers.ts`
- `src/features/match/api/queries.ts`
- `src/features/match/ui/*`

**Contract:**
- `MatchListItemDTO`, `MatchDetailDTO` 중심
- Flat DTO only (UI는 nested DB row/Entity shape 직접 소비 금지)
- JOIN 위치는 `features/match/api/queries.ts`

---

### Task 2.4: Route-level Consumers Use Feature Hooks

**Files:**
- `src/app/page.tsx`
- `src/app/matches/[id]/page.tsx`
- `src/app/matches/create/page.tsx`

**Rule:**
- App route는 feature 공개 API(`@/features/*`)를 통해 DTO hook 사용
- Entity query hook 직접 의존을 신규로 추가하지 않음

---

### Task 2.5: Spread Same DTO Pipeline to Schedule/Team

**Schedule:**
- `features/schedule/api/queries.ts` -> DTO 반환
- `features/schedule/ui/*` -> DTO만 소비

**Team:**
- `features/team/api/*/queries.ts` -> DTO 반환
- `features/team/ui/*` -> DTO만 소비

---

## ✅ Phase 2 Verification Checklist

1. **Architecture Rules**
- [ ] `src/entities`에 `@x` 폴더 없음
- [ ] entities 내부 cross-import 없음
- [ ] 조합/오케스트레이션은 feature hook에서만 수행

2. **Type Rules**
- [ ] feature query hook의 공개 반환 타입은 DTO
- [ ] UI에서 DB row 타입 직접 import 없음

3. **Build Gates**
- [ ] `npm run lint`
- [ ] `npm run build`

---

## 📌 Migration Notes (Updated 2026-02-14)

- 이 문서의 Phase 2는 `docs/plans/complete/2026-02-14-phase3-remove-cross-imports.md`의 원칙(라인 68-69)과 일치하도록 갱신됨.
- Match 기준 DTO 흐름(`JOIN in feature -> Entity mapping -> DTO mapping -> UI`)은 `docs/plans/complete/2026-02-14-match-feature-dto-refactoring-design.md`를 단일 기준으로 사용.
- 구버전 지시(`entities/*/@x`, entities 중심 query orchestration)는 더 이상 적용하지 않음.
