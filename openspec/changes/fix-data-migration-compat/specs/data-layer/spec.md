# Data Layer Spec Delta

## ADDED Requirements

### Requirement: JSONB Field Access Pattern
The system SHALL access JSONB fields using optional chaining to handle null values safely:

```typescript
// User JSONB access
user?.account_info?.bank
user?.operation_info?.type
user?.operation_info?.notice

// Team JSONB access
team?.account_info?.bank
team?.operation_info?.notice
```

#### Scenario: Reading user account info
- **WHEN** accessing user's account info
- **THEN** code MUST use `user?.account_info?.bank` pattern
- **AND** code MUST NOT use `user?.default_account_bank` (removed field)

#### Scenario: Reading team operation info
- **WHEN** accessing team's operation info
- **THEN** code MUST use `team?.operation_info?.notice` pattern
- **AND** code MUST NOT use `team?.host_notice` (removed field)

### Requirement: JSONB Field Update Pattern
The system SHALL update JSONB fields as complete objects, not individual properties:

```typescript
// Correct: Update entire JSONB object
await supabase.from('users').update({
  account_info: {
    bank: 'KB국민',
    number: '123-456-789',
    holder: '홍길동',
  },
  operation_info: {
    type: 'KAKAO_OPEN_CHAT',
    url: 'https://open.kakao.com/xxx',
    notice: '오픈채팅으로 연락주세요',
  },
});

// Wrong: Update individual fields (not supported)
await supabase.from('users').update({
  'account_info.bank': 'KB국민',  // ❌
});
```

#### Scenario: Updating user default info
- **WHEN** user saves their default operation/account info
- **THEN** code MUST construct complete JSONB objects for `account_info` and `operation_info`
- **AND** code MUST pass the complete object to the update query

### Requirement: Documentation Alignment
Project documentation (CLAUDE.md, ARCHITECTURE.md) SHALL reflect the Data Layer specification:

- JSONB type layer (Layer 1.5) MUST be documented
- JSONB field naming conventions MUST be documented
- Import paths for JSONB types MUST be documented

#### Scenario: Developer looking for JSONB type location
- **WHEN** developer asks "where do I define JSONB interfaces?"
- **THEN** documentation MUST point to `@/shared/types/jsonb.types.ts`

## REMOVED Requirements

### Requirement: Legacy Field Access Pattern
**Reason**: Legacy columns have been removed by data migration

**Migration:**
- `user.default_account_bank` → `user.account_info?.bank`
- `user.default_account_number` → `user.account_info?.number`
- `user.default_account_holder` → `user.account_info?.holder`
- `user.default_contact_type` → `user.operation_info?.type`
- `user.kakao_open_chat_url` → `user.operation_info?.url`
- `user.default_host_notice` → `user.operation_info?.notice`
- `team.account_bank` → `team.account_info?.bank`
- `team.account_number` → `team.account_info?.number`
- `team.account_holder` → `team.account_info?.holder`
- `team.host_notice` → `team.operation_info?.notice`
- `team.contact_link` → `team.operation_info?.url`

#### Scenario: Migrating legacy field usage
- **WHEN** code references a legacy field (e.g., `user.default_account_bank`)
- **THEN** it MUST be updated to the new JSONB path (e.g., `user.account_info?.bank`)
