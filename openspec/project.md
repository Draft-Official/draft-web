# Project Context

## Purpose

**DRAFT** is a basketball guest recruiting platform (농구 용병 모집 플랫폼) for Korean amateur basketball players.

### Vision
"누구나 편하게 농구를 접하고, 함께 땀 흘리는 세상" — Making basketball accessible by lowering barriers to entry beyond closed communities (BDR 카페, 밴드).

### Target Users
- **Host (공급자)**: Team organizers who manually post on forums and manage guests via comments/messages. Pain point: repetitive inquiries and no-show management.
- **Guest (수요자)**: Basketball enthusiasts looking for games, and newcomers who don't know how to find pickup games.

### Core Values
- **Speed** — Fast discovery via location/date/position filters
- **Trust** — Reliable match info and host announcements
- **Convenience** — Simple forms, one-click applications

## Tech Stack

### Framework & Language
- **Next.js 15.5.9** (App Router)
- **TypeScript** (Strict Mode)
- **React 19**

### Styling & UI
- **Tailwind CSS 4** + custom configuration
- **shadcn/ui** + Radix UI (customized)
- **Lucide React** for icons
- **Pretendard** font

### Backend & Data
- **Supabase** (Auth + PostgreSQL + Storage)
- **React Query** (`@tanstack/react-query`) for server state
- **React Hook Form** + **Zod** for form validation

### External APIs
- **Kakao Maps API** for location search

## Project Conventions

### Code Style

#### File Naming
| Location | Convention | Example |
|----------|-----------|---------|
| `src/features/*/ui/` | PascalCase | `MatchListItem.tsx` |
| `src/features/*/api/` | kebab-case | `queries.ts`, `mutations.ts` |
| `src/services/*` | kebab-case | `match.service.ts` |
| `src/components/ui/` | kebab-case | `button.tsx` (shadcn) |

#### Import Aliases
Always use TypeScript path aliases:
```typescript
@/*           // Root directory
@/components  // src/components
@/features    // src/features
@/shared      // src/shared
@/widgets     // src/widgets
```

### Architecture Patterns

#### Simplified Feature-Sliced Design
```
app/                    # Next.js App Router (routing only)
src/
├── features/           # Feature modules (match, auth, user)
│   └── {feature}/
│       ├── ui/         # UI components
│       ├── api/        # React Query hooks
│       ├── model/      # Types & schemas
│       └── lib/        # Helper functions
├── services/           # Data access layer (Supabase)
├── lib/                # Infrastructure (Supabase clients)
├── shared/             # Global resources
├── widgets/            # Layout components (Header, BottomNav)
└── components/ui/      # shadcn/ui components
```

#### 3-Tier Architecture
```
UI Layer (features/*/ui/)
    ↓
API Layer (features/*/api/) — React Query hooks
    ↓
Service Layer (services/) — Supabase DB access
    ↓
Infrastructure (lib/) — Supabase clients
```

#### Layer Dependencies
- Features → Shared (allowed)
- Features → Features (NOT allowed)
- App → Features/Widgets/Components (allowed)
- UI → Supabase directly (NOT allowed, use services)

### Testing Strategy
- Currently no automated tests (MVP phase)
- Manual testing with mobile viewport (430px max-width)
- Future: Vitest + React Testing Library

### Git Workflow

#### Branch Strategy
- Feature branches from main
- PR-based workflow

#### Commit Convention
```bash
git commit -m "$(cat <<'EOF'
feat(match): Add feature description

- Detail 1
- Detail 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

Commit types: `feat`, `fix`, `refactor`, `ui`, `docs`, `chore`

## Domain Context

### Key Domain Terms
- **Host (호스트)**: Team organizer who creates matches and manages guest applications
- **Guest (게스트/용병)**: Individual player who applies to join matches
- **Match (경기)**: A basketball game session with specific time, location, and requirements
- **Position (포지션)**: G (Guard), F (Forward), C (Center)

### Match Lifecycle
1. Host creates match → Status: `recruiting`
2. Guests apply → Applications pending
3. Host accepts/rejects → Applications updated
4. Match time arrives → Status: `completed`

### Core Features (MVP)
1. **Match List**: Filterable list by region/date/position
2. **Match Detail**: Info summary + host notice + map
3. **Match Create**: Simple form for hosts
4. **Application Management**: Accept/reject dashboard for hosts

## Important Constraints

### UI Constraints
- **Mobile-first fixed width**: `max-w-[430px]` centered layout
- **Primary brand color**: `#FF6600` (Orange)
- **Sticky header hierarchy**:
  - Header: `top-0` (h-14 = 56px)
  - FilterBar: `top-14`
  - Date sections: `top-[195px]`

### Technical Constraints
- No business logic in `app/` directory (routing only)
- Never import features from other features
- Never modify `src/components/registry/` files (Figma imports)
- All component widths must fit within 430px

### Development Phase
- Currently in **MVP Phase 2** (Supabase integration)
- Auth: OAuth setup pending, using test user for development
- RLS policies temporarily relaxed for development testing

## External Dependencies

### Supabase
- **Auth**: Email/password + OAuth (Kakao, Google planned)
- **Database**: PostgreSQL with RLS policies
- **Storage**: For future image uploads

### Kakao Maps API
- Location search via `/api/search-places` proxy route
- Map display in match detail pages

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
KAKAO_REST_API_KEY=xxx
```

## Development Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
npm start        # Production server
```

---

**Last Updated**: 2026-01-23
**Maintainer**: @beom
