# AI Agent Workflow Rules

This document outlines the mandatory workflow rules for AI agents (Antigravity/Gemini/Claude) working on the **Draft** project.

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
