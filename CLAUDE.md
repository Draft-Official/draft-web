<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

**DRAFT** is a basketball guest recruiting platform for Korean amateur basketball players. It's a mobile-first adaptive web app (max-width: 430px) built with Next.js 15.5.9 that aims to provide a native app-like experience.

**Target Users**: Basketball enthusiasts (Guests) and team organizers (Hosts)
**Core Values**: Speed, Trust, Convenience

→ **For detailed business context**: See [project-context.md](docs/project-context.md)

## Development Commands

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build & Production
npm run build        # Production build
npm start           # Start production server

# Linting
npm run lint        # Run ESLint
```

## Architecture (Quick Reference)

This project uses **simplified Feature-Sliced Design**:

```
app/                    # Next.js App Router (routing only)
src/
├── features/          # Feature modules (match, auth, user)
│   └── {feature}/
│       ├── ui/        # UI components
│       ├── api/       # API functions (Phase 2)
│       ├── model/     # Types & schemas
│       └── lib/       # Helper functions
├── shared/            # Global resources
├── widgets/           # Layout components (Header, BottomNav)
└── components/
    ├── ui/            # shadcn/ui components
    └── registry/      # Figma-imported components
```

→ **For detailed architecture**: See [ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Import Path Aliases

Always use these TypeScript path aliases:

```typescript
@/*                    # Root directory
@/components/*         # src/components/*
@/features/*           # src/features/*
@/shared/*             # src/shared/*
@/widgets/*            # src/widgets/*
```

### Layer Dependency Rules

```
Features → Shared
App → Features/Widgets/Components
Widgets → Features/Shared/Components
```

**Important**: Features should NOT import from other features. Extract shared logic to `src/shared/`.

## Design System

### Brand Colors
- **Primary**: `#FF6600` (Orange) - Defined as `hsl(24 95% 53%)` in CSS variables
- Access via: `text-primary`, `bg-primary`, `border-primary`

### Layout Requirements
- **Mobile-First**: All UI must fit within `max-w-[430px]`
- **Sticky Positioning**:
  - Header: `top-0` (h-14)
  - FilterBar: `top-14` (below header)
  - Date section headers: `top-[195px]` (below FilterBar)

### Typography
Use Pretendard font (imported in globals.css)

### Component Conventions
- shadcn/ui components: kebab-case filenames (`button.tsx`)
- Feature UI components: PascalCase filenames (`MatchListItem.tsx`)
- Registry components: kebab-case folders (`match-create-form/`)

## Figma Design Implementation

### Pixel-Perfect Implementation Rules

When implementing from Figma designs:

1. **Prioritize Figma over GitHub code** - Always reference the actual Figma design
2. **Match exact component order** - Follow Figma's top-to-bottom layout structure
3. **Symmetric spacing** - Dividers must have equal spacing above and below (use `my-X` not `mb-X`)
4. **Precise sizing** - Adjust text sizes in 1px increments (e.g., `text-[21px]`)
5. **Tight spacing control** - Card padding, gaps, and margins should match Figma exactly
6. **Visual hierarchy** - Font weights, colors, and sizes must match design specs

### Common Figma-to-Code Patterns

```tsx
// Dividers with symmetric spacing
<div className="h-px bg-slate-100 my-4" />  // ✅ Equal top/bottom

// Precise text sizing
<h1 className="text-[21px]">  // ✅ Exact 21px

// Color opacity matching
<div className="bg-orange-50/30">  // ✅ Exact opacity
```

### Figma UI Import Workflow

→ **For complete workflow**: See [FIGMA_TO_CODE.md](docs/FIGMA_TO_CODE.md)

**Quick command**:
```
"Figma Make 코드를 Draft로 import 해줘"
```

## Feature Development Workflow

### Adding a New Feature

1. **Create feature structure**:
   ```bash
   mkdir -p src/features/{feature-name}/{ui,api,model,lib}
   ```

2. **Define types** in `model/types.ts`

3. **Create UI components** in `ui/`

4. **Add API functions** (Phase 2) in `api/`

5. **Connect to App Router**:
   ```tsx

### Workflow Rules (Mandatory)
1. **Read Documentation First**: Before starting any task, ALWAYS read relevant `.md` files (CLAUDE.md, docs/*) to align with architectural and design guidelines.
2. **Commit by Feature**: When finishing work, group commits by feature (e.g., `feat(match)`, `ui(filter-bar)`). Do NOT squash unrelated changes into one commit.


## Git Commit Guidelines

When completing tasks, commits should include Claude attribution:

```bash
git commit -m "$(cat <<'EOF'
feat: Add feature description

- Detail 1
- Detail 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

## Key Technical Patterns

### Sticky Positioning Hierarchy
The app uses multiple sticky layers. When adding sticky elements, calculate `top` based on:
- Header: 56px (h-14)
- FilterBar: ~139px (varies with content)
- Always test scroll behavior

### State Management
- **Local state**: React hooks (useState, useReducer)
- **Server state** (Phase 2): React Query with Supabase
- **Form state**: React Hook Form + Zod validation

### Responsive Behavior
Desktop: Centered column (max-w-[430px]) with dark background
Mobile: Full-width app-like experience

```tsx
// Layout wrapper in app/layout.tsx
<div className="w-full max-w-[430px] mx-auto min-h-screen bg-white shadow-2xl">
```

## Key Files Reference

**Types**:
- Common types: `src/shared/types/match.ts`
- Feature types: `src/features/{feature}/model/types.ts`

**Validation**:
- Match Create: `src/features/match/create/model/schema.ts`

**API** (Phase 2):
- Kakao Maps: `app/api/search-places/route.ts`, `src/shared/api/kakao-map.ts`

**Mock Data**:
- Host Dashboard: `src/features/host/model/mock-data.ts`
- Match List: `src/features/match/model/mock-data.ts`

## Supabase 개발 설정 (⚠️ 임시)

### RLS 정책 변경 사항
개발 테스트를 위해 다음 RLS 정책이 임시로 변경됨:

```sql
-- ❌ 비활성화된 프로덕션 정책:
-- create policy "Users can create matches" on matches for insert with check (auth.uid() = host_id);

-- ✅ 현재 활성화된 개발용 정책:
create policy "Anyone can create matches (DEV ONLY)" on matches for insert with check (true);
```

**복구 방법** (OAuth 설정 완료 후):
```sql
DROP POLICY IF EXISTS "Anyone can create matches (DEV ONLY)" ON matches;
CREATE POLICY "Users can create matches" ON matches FOR INSERT WITH CHECK (auth.uid() = host_id);
```

### 테스트 유저
- Email: `test@naver.com`
- UUID: `d1011295-3375-41f4-83c7-9663dc00becf`
- mutations.ts에서 임시 하드코딩됨 (OAuth 설정 후 제거 필요)

## Critical Rules

### DO ✅
- Use Feature-Sliced Design structure
- Keep routing logic in `app/` directory only
- Use TypeScript path aliases
- Follow mobile-first design (max-w-[430px])
- Use Primary color `#FF6600` for brand elements
- Test sticky positioning when modifying layout

### DON'T ❌
- Put business logic in `app/` directory
- Import features from other features
- Modify `src/components/registry/` files manually
- Use relative imports when aliases exist
- Create components wider than 430px
- Change sticky `top` values without testing scroll

## Reference Documents

For deeper context, refer to:

- **[project-context.md](docs/project-context.md)** - Project vision, MVP scope, target audience
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Detailed architecture, tech stack phases, expansion roadmap
- **[FIGMA_TO_CODE.md](docs/FIGMA_TO_CODE.md)** - Figma → Draft conversion workflow
- **[CHANGELOG.md](docs/CHANGELOG.md)** - Recent changes and milestones

---

**Last Updated**: 2026-01-14
**Maintainer**: @beom
**Project**: Draft - 농구 용병 모집 플랫폼
