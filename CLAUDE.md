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

**DRAFT** is a basketball guest recruiting platform for Korean amateur basketball players. It's a mobile-first adaptive web app (max-width: 430px) built with Next.js 15 that aims to provide a native app-like experience.

**Target Users**: Basketball enthusiasts (Guests) and team organizers (Hosts)  
**Core Values**: Speed, Trust, Convenience

→ **For detailed business context**: See [docs/project-context.md](docs/project-context.md)

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

This project uses **Feature-Based Architecture** with a 3-folder structure:

```
src/
├── app/                    # Next.js App Router (routing only)
│   ├── page.tsx
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── matches/
│   ├── tournaments/
│   ├── schedule/
│   ├── team/
│   ├── my/
│   └── api/
│
├── features/               # Feature modules (domain logic)
│   ├── auth/               # Authentication
│   │   ├── api/            # API layer (Supabase, React Query)
│   │   ├── model/          # Types, Context
│   │   ├── ui/             # UI components
│   │   └── index.ts        # Barrel export
│   ├── match/              # Match management
│   ├── schedule/           # Schedule management
│   ├── application/        # Application submissions
│   ├── team/               # Team management
│   └── my/                 # User profile
│
└── shared/                 # Cross-cutting resources
    ├── api/                # Infrastructure (Supabase, React Query)
    ├── ui/
    │   ├── base/           # shadcn/ui components
    │   └── layout/         # Layout components
    ├── lib/                # Utilities
    ├── config/             # Global config
    └── types/              # Global types
```

→ **For detailed architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

### Import Path Aliases

Always use these TypeScript path aliases:

```typescript
@/*                    # Root directory (./src/)
@/features/*           # src/features/*
@/shared/*             # src/shared/*
```

### Layer Dependency Rules

```
app/ → features/ + shared/
features/ → shared/
Features DO NOT import from other features
```

**Important**: Features should NOT import from other features. Extract shared logic to `src/shared/`.

---

## File Structure Rules

### 3-Folder Architecture

**app/** - Routing only
- ✅ Page shells, layouts, metadata
- ❌ Business logic, API calls, UI components

**features/** - Domain logic
- Each feature has: `api/`, `ui/`, `model/`, `lib/`
- API layer: `{name}-api.ts`, `{name}-mapper.ts`, `keys.ts`, `queries.ts`, `mutations.ts`
- All features export via `index.ts`

**shared/** - Cross-domain resources
- `api/`: Supabase clients, React Query config
- `ui/base/`: shadcn/ui atomic components
- `ui/layout/`: Header, Sidebar, BottomNav
- `lib/`, `config/`, `types/`

### File Naming Convention

**ALL FILES MUST USE kebab-case:**

```
✅ match-card.tsx
✅ auth-guard.tsx
✅ match-api.ts
✅ profile-setup-modal.tsx

❌ MatchCard.tsx
❌ AuthGuard.tsx
❌ ProfileSetupModal.tsx
```

---

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

---

## React Query Patterns

### API Layer Structure

```typescript
// features/{feature}/api/keys.ts
export const matchKeys = {
  all: ['matches'] as const,
  detail: (id: string) => [...matchKeys.all, 'detail', id] as const,
};

// features/{feature}/api/queries.ts
export function useMatch(id: string) {
  return useQuery({
    queryKey: matchKeys.detail(id),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const row = await getMatch(supabase, id);
      return matchRowToClientMatch(row);
    },
  });
}

// features/{feature}/api/mutations.ts
export function useCreateMatch() {
  return useMutation({
    mutationFn: async (input) => {
      const supabase = getSupabaseBrowserClient();
      return createMatch(supabase, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
    },
  });
}
```

### API Client Pattern

```typescript
// features/{feature}/api/{name}-api.ts
export async function getMatch(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw new AppError(error.message);
  return data;
}
```

### Mapper Pattern

```typescript
// features/{feature}/api/{name}-mapper.ts
export function matchRowToClientMatch(row: MatchRow): ClientMatch {
  return {
    id: row.id,
    title: row.title,
    // ... type conversion
  };
}
```

---

## Key Technical Patterns

### Sticky Positioning Hierarchy
The app uses multiple sticky layers. When adding sticky elements, calculate `top` based on:
- Header: 56px (h-14)
- FilterBar: ~139px (varies with content)
- Always test scroll behavior

### State Management
- **Local state**: React hooks (useState, useReducer)
- **Server state**: TanStack Query (React Query) with Supabase
- **Form state**: React Hook Form + Zod validation

### Responsive Behavior
Desktop: Centered column (max-w-[430px]) with dark background  
Mobile: Full-width app-like experience

```tsx
// Layout wrapper in app/layout.tsx
<div className="w-full max-w-[430px] mx-auto min-h-screen bg-white shadow-2xl">
```

---

## Critical Rules

### DO ✅
- Use 3-folder architecture (`app/`, `features/`, `shared/`)
- Keep routing logic in `app/` directory only
- Use TypeScript path aliases (`@/features/*`, `@/shared/*`)
- ALL filenames in kebab-case
- Access DB through feature API layers
- Use React Query for all data fetching
- Follow mobile-first design (max-w-[430px])
- Use Primary color `#FF6600` for brand elements

### DON'T ❌
- Put business logic in `app/` directory
- Import features from other features
- Use PascalCase for filenames
- Access Supabase directly from UI components
- Use relative imports when aliases exist
- Create components wider than 430px
- Change sticky `top` values without testing scroll

---

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

---

## Reference Documents

For deeper context, refer to:

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Detailed architecture, patterns, examples
- **[docs/project-context.md](docs/project-context.md)** - Project vision, MVP scope, target audience
- **[docs/FIGMA_TO_CODE.md](docs/FIGMA_TO_CODE.md)** - Figma → Draft conversion workflow
- **[openspec/project.md](openspec/project.md)** - Project specifications

---

**Last Updated**: 2026-01-23  
**Maintainer**: @beom  
**Project**: Draft - 농구 용병 모집 플랫폼
