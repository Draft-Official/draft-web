# Notification Feature DTO Refactoring Design

## Goal
Refactor `features/notification` to DTO-first contracts while preserving all current notification behavior.

- Keep routing/read-mark semantics identical
- Align with match/schedule/application DTO pipeline
- Keep DB-row concerns out of UI

## Scope
- `src/features/notification/*`
- `src/entities/notification/*` (new)
- `src/features/schedule` notification type consumption alignment

Out of scope:
- Notification UX redesign
- New notification business rules

## Constraints
1. Existing notification click behavior must not change.
2. Existing polling/query-key/invalidation behavior must not change.
3. Schedule notification badge behavior must remain identical.
4. DTO flow must be explicit: `row -> entity -> feature DTO -> UI`.

## Architecture
### Layer responsibilities
- `entities/notification`: DB row mapping + service access
- `features/notification/model/types.ts`: DTO contracts
- `features/notification/lib/mappers.ts`: entity -> DTO mapping
- `features/notification/api/queries.ts`: query orchestration and DTO return
- `features/notification/ui/*`: DTO consumption only

### Data flow
1. Query rows from `notifications`
2. Convert `row -> NotificationEntity`
3. Enrich announcement messages in feature query boundary
4. Convert `entity -> NotificationListItemDTO` / `UnreadMatchNotificationDTO`
5. Render UI from DTO fields only

## DTO Set
1. `NotificationListItemDTO`
- list item rendering contract
- includes `title`, `description`, `targetPath`

2. `UnreadMatchNotificationDTO`
- schedule card badge/grouping contract
- includes `id`, `type`, `matchId`, `isRead`, `createdAt`

## Verification
1. `npm run lint` (warnings allowed)
2. `npm run build`
3. Smoke checks:
- notification bell count unchanged
- notifications list label/description/time unchanged
- click routes unchanged (`/matches/:id` vs `/matches/:id/manage`)
- schedule unread badge grouping unchanged
