# Implementation Tasks

## 1. 코드 호환성 수정

### 1.1 match-create-operations.tsx 수정
- [ ] 1.1.1 User에서 기존 정보 확인 로직 수정
  - `user?.default_account_bank` → `user?.account_info?.bank`
  - `user?.default_account_number` → `user?.account_info?.number`
  - `user?.default_account_holder` → `user?.account_info?.holder`
  - `user?.default_contact_type` → `user?.operation_info?.type`
  - `user?.kakao_open_chat_url` → `user?.operation_info?.url`
  - `user?.default_host_notice` → `user?.operation_info?.notice`
- [ ] 1.1.2 Team에서 기존 정보 확인 로직 수정
  - `team.account_bank` → `team.account_info?.bank`
  - `team.account_number` → `team.account_info?.number`
  - `team.account_holder` → `team.account_info?.holder`
  - `team.host_notice` → `team.operation_info?.notice`
- [ ] 1.1.3 JSONB 타입 import 추가 (AccountInfo, OperationInfo)

### 1.2 match-create-view.tsx 수정
- [ ] 1.2.1 User 업데이트 로직 수정 (레거시 필드 → JSONB 필드)
  ```typescript
  // 기존
  default_account_bank: operationsData.accountInfo.bank,
  default_account_number: operationsData.accountInfo.number,
  // 변경
  account_info: {
    bank: operationsData.accountInfo.bank,
    number: operationsData.accountInfo.number,
    holder: operationsData.accountInfo.holder,
  },
  operation_info: {
    type: operationsData.contactInfo.type,
    url: operationsData.contactInfo.type === 'KAKAO_OPEN_CHAT' ? operationsData.contactInfo.content : null,
    notice: operationsData.hostNotice,
  }
  ```
- [ ] 1.2.2 Team 업데이트 로직 수정 (동일하게 JSONB 구조로)

### 1.3 team-api.ts 수정
- [ ] 1.3.1 TeamUpdateData 인터페이스에서 레거시 필드 제거
- [ ] 1.3.2 새로운 JSONB 필드 추가 (account_info, operation_info)

## 2. 문서 업데이트

### 2.1 CLAUDE.md 업데이트
- [ ] 2.1.1 Data Layer 규칙 섹션 추가
  - JSONB 필드 접근 패턴 설명
  - operation_info, account_info 구조 설명
  - 타입 import 경로 (`@/shared/types/jsonb.types`)

### 2.2 ARCHITECTURE.md 업데이트
- [ ] 2.2.1 타입 시스템 섹션에 JSONB 타입 레이어 추가
  - Layer 1.5 (jsonb.types.ts) 설명
  - JSONB 필드 통합 패턴 설명

## 3. 검증
- [ ] 3.1 `npm run build` 성공 확인
- [ ] 3.2 `npm run lint` 성공 확인
- [ ] 3.3 기능 테스트 (경기 생성, 운영 정보 저장)
