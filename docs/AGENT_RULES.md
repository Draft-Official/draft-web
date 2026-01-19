# AI Agent Workflow Rules

This document outlines the mandatory workflow rules for AI agents (Antigravity/Gemini) working on the **Draft** project.

## 1. Documentation First
Before starting any implementation or refactoring task, you MUST read the relevant documentation:
- `CLAUDE.md` (Project overview & commands)
- `docs/ARCHITECTURE.md` (Development patterns & structure)
- `docs/project-context.md` (Domain knowledge)
- `docs/FIGMA_TO_CODE.md` (UI implementation rules)

## 2. Commit Strategy
Adhere to the following commit rules:
- **Feature-based Grouping**: Do not squash unrelated changes. Group commits by their functional scope (e.g., `feat(match)`, `refactor(ui)`, `docs(guidelines)`).
- **Atomic Commits**: Each commit should represent a complete, working unit of change.

## 3. Architecture Compliance
- Follow **Feature-Sliced Design**.
- Adhere to the `app/` (routing) vs `src/` (logic) separation.
- Use `src/shared` for cross-feature utilities.

## 4. Service Layer Rules
- **Never call Supabase directly from UI components.**
- Use Service Layer (`src/services/`) for all DB access.
- Use React Query hooks (`src/features/*/api/`) for data fetching in components.
- Type conversions must go through mappers (`*.mapper.ts`).

```typescript
// ❌ Bad: Direct DB call in component
const { data } = await supabase.from('matches').select();

// ✅ Good: Through service layer
const matchService = createMatchService(supabase);
const matches = await matchService.getRecruitingMatches();
```

## 5. Auth Rules
- Protected routes are defined in `app/middleware.ts`.
- Use `useAuth()` hook to access auth state.
- Use `<AuthGuard>` component for conditional rendering based on auth.
