# Change: Fix Data Migration Compatibility Issues

## Why
데이터 마이그레이션 (`20260126_refactor_data_layer.sql`)이 적용된 후, 기존 코드에서 제거된 레거시 컬럼을 참조하여 빌드 오류가 발생하고 있습니다. 새로운 JSONB 구조(`operation_info`, `account_info`)를 사용하도록 코드를 업데이트해야 합니다.

## What Changes

### 1. 코드 호환성 수정
- `match-create-operations.tsx`: users/teams의 새 JSONB 필드 사용
- `match-create-view.tsx`: users/teams 업데이트 로직을 새 필드로 변경
- `team-api.ts`: teams의 레거시 필드를 JSONB 필드로 변경

### 2. 문서 업데이트
- `CLAUDE.md`: Data Layer 규칙 추가 (JSONB 필드 접근 패턴)
- `ARCHITECTURE.md`: 타입 시스템 섹션에 JSONB 타입 레이어 설명 추가

### 제거되는 레거시 컬럼 참조:

**users 테이블:**
- `default_account_bank` → `account_info.bank`
- `default_account_number` → `account_info.number`
- `default_account_holder` → `account_info.holder`
- `default_contact_type` → `operation_info.type`
- `kakao_open_chat_url` → `operation_info.url`
- `default_host_notice` → `operation_info.notice`

**teams 테이블:**
- `account_bank` → `account_info.bank`
- `account_number` → `account_info.number`
- `account_holder` → `account_info.holder`
- `host_notice` → `operation_info.notice`
- `contact_link` → `operation_info.url`

## Impact
- Affected specs: `data-layer`
- Affected code:
  - `src/features/match-create/ui/match-create-view.tsx`
  - `src/features/match-create/ui/components/match-create-operations.tsx`
  - `src/features/team/api/team-api.ts`
  - `docs/CLAUDE.md`
  - `docs/ARCHITECTURE.md`
