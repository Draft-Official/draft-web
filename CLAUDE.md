# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DRAFT** is a basketball guest recruiting platform for Korean amateur basketball players. It's a mobile-first adaptive web app (max-width: 430px) built with Next.js 16 that aims to provide a native app-like experience.

**Target Users**: Basketball enthusiasts (Guests) and team organizers (Hosts)
**Core Values**: Speed, Trust, Convenience

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

## Architecture

This project uses a **simplified Feature-Sliced Design** pattern for scalability and maintainability.

### Directory Structure

```
app/                    # Next.js App Router (routing only)
├── page.tsx           # Home - Match list
├── guest/[id]/        # Match detail page
├── match/create/      # Host create match
└── layout.tsx         # Root layout with Header + BottomNav

src/
├── features/          # Feature modules (isolated business logic)
│   ├── match/         # Match-related features
│   │   ├── ui/        # Match UI components (FilterBar, MatchListItem, etc.)
│   │   ├── api/       # API functions (queries.ts, mutations.ts)
│   │   ├── model/     # Types & schemas (types.ts, schema.ts)
│   │   └── lib/       # Helper functions
│   ├── auth/          # Authentication
│   └── user/          # User profile
│
├── shared/            # Global shared resources
│   ├── lib/           # Utilities (utils.ts, supabase.ts, query-client.ts)
│   ├── config/        # Constants
│   └── types/         # Global types
│
├── widgets/           # Composite layout components
│   ├── header.tsx     # App header
│   └── bottom-nav.tsx # Bottom navigation
│
└── components/
    ├── ui/            # shadcn/ui components (button, card, etc.)
    └── registry/      # Figma-imported UI components

.claude/
├── agents/            # Custom Claude Code agents
│   ├── figma-ui-importer.md   # Figma → Draft converter
│   └── pipeline-designer.md   # Implementation planner
└── docs/              # Agent documentation
```

### Import Path Aliases

Always use these TypeScript path aliases (defined in tsconfig.json):

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
Use Pretendard font (imported in globals.css):
```css
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css");
```

### Component Conventions
- shadcn/ui components: kebab-case filenames (`button.tsx`)
- Feature UI components: PascalCase filenames (`MatchListItem.tsx`)
- Registry components: kebab-case folders (`match-create-form/`)

## Feature Development Workflow

### Adding a New Feature

1. **Create feature structure**:
   ```bash
   mkdir -p src/features/{feature-name}/{ui,api,model,lib}
   ```

2. **Define types** in `model/types.ts`:
   ```typescript
   export interface Feature {
     id: string;
     // ...
   }
   ```

3. **Create UI components** in `ui/`:
   - Use PascalCase filenames
   - Import from `@/components/ui` for base components

4. **Add API functions** (when Supabase is connected) in `api/`:
   - `queries.ts` for GET operations (React Query)
   - `mutations.ts` for POST/PUT/DELETE

5. **Connect to App Router**:
   ```tsx
   // app/(...)/page.tsx
   import Component from '@/features/{feature}/ui/Component';
   ```

### Working with Figma Components

Use the `figma-ui-importer` agent when importing UI from Figma:

```
"Import the HostCreateMatch component from Figma to Draft"
```

The agent will:
1. Convert Figma Make code to Draft structure
2. Place in `src/components/registry/`
3. Update import paths
4. Check for TypeScript errors

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
- **Server state** (future): React Query with Supabase
- **Form state**: React Hook Form + Zod validation

### Responsive Behavior
Desktop: Centered column (max-w-[430px]) with dark background
Mobile: Full-width app-like experience

The layout wrapper in `app/layout.tsx`:
```tsx
<div className="w-full max-w-[430px] mx-auto min-h-screen bg-white shadow-2xl">
```

## Future Backend Integration (Supabase)

When connecting to Supabase (Phase 2):

1. Install dependencies:
   ```bash
   npm install @supabase/supabase-js @supabase/ssr @tanstack/react-query
   ```

2. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   ```

3. Create client in `src/shared/lib/supabase.ts`
4. Set up React Query in `src/shared/lib/query-client.ts`
5. Add API functions in feature `api/` folders

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
- Modify `src/components/registry/` files manually (use agent)
- Use relative imports when aliases exist
- Create components wider than 430px
- Change sticky `top` values without testing scroll

## Claude Code Agents

This project includes custom agents in `.claude/agents/`:

- **figma-ui-importer**: Converts Figma Make components to Draft structure
- **pipeline-designer**: Plans implementation workflows

These agents are automatically invoked by Claude Code when appropriate tasks are detected.

## Reference Documents

For deeper architectural context:
- `project-context.md` - Project vision and MVP scope
- `ARCHITECTURE.md` - Detailed architecture documentation
- `.claude/docs/sub-agent.md` - Agent usage guide
