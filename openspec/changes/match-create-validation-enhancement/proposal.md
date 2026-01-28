# Proposal: Match Create 유효성 검증 및 UX 개선

## Why

매치 생성 폼에서 입력값 유효성 검증이 부족하고, 선택 사항인 필드에 불필요한 기본값이 서버로 전송되는 문제가 있습니다. 또한 사용자 입력 편의성과 데이터 정확성을 위해 양식 검증 강화가 필요합니다.

### 현재 문제점

1. **주차비 입력**: 음수값(`-`) 입력 가능 → 양의 정수만 허용해야 함
2. **참가비 입력**: 음수/0원 입력 가능 → 현금은 양의 정수, 음료는 1개 이상만 허용
3. **무료 표시 부재**: 0원 입력 시 "무료" 라벨이 표시되지 않음
4. **쿼터 진행방식 기본값**: 선택 사항임에도 기본값이 서버로 전송됨
5. **계좌 정보 양식 미검증**: 예금주 이름, 계좌번호 형식 검증 부재
6. **전화번호 양식 미검증**: 전화 선택 시 올바른 전화번호 형식 검증 부재
7. **주최정보 안내 문구**: DRAFT 플랫폼의 장점을 더 잘 전달할 수 있는 문구 필요

## What Changes

### 1. 숫자 입력 검증 강화

#### 주차비 (Parking Cost)
- **현재**: 음수 포함 모든 숫자 입력 가능
- **변경**: 양의 정수(0 포함)만 입력 가능
- **UI**: `-` 키 입력 차단, 붙여넣기 시 음수 제거
- **Schema**: `z.number().int().min(0)` 또는 `z.string().regex(/^\d*$/)`

#### 참가비 - 현금 (Fee - Money)
- **현재**: 0원 포함 모든 숫자 입력 가능
- **변경**: 양의 정수만 입력 가능 (0원 입력 시 "무료" 표시)
- **Schema**: `z.number().int().min(0)`
- **UI 표시**: 0원 입력 시 "무료" 라벨 표시

#### 참가비 - 음료 (Fee - Beverage)
- **현재**: 0개 입력 가능
- **변경**: 1개 이상만 입력 가능
- **Schema**: `z.number().int().min(1)`

### 2. 무료 표시 UX 개선

- 참가비 0원 입력 시: Input 하단 또는 우측에 "무료" 라벨 표시
- 주차비 0원 입력 시: Chip에 "무료" 표시 (현재 "0원 (무료)" → 유지)

### 3. 쿼터 진행방식 기본값 제거

- **현재**: `gameFormat`, `rules.quarterTime/quarterCount/fullGames`, `referee`에 default 값 존재
- **변경**: 사용자가 선택하지 않으면 `undefined`/`null`로 서버 전송
- **UI 동작**: "추가" 버튼 클릭 전까지 해당 필드 미전송
- **Schema 변경**: `.default()` 제거, `.optional()` 유지

```typescript
// Before
gameFormat: z.enum(PLAY_STYLE_VALUES).default('INTERNAL_2WAY')

// After
gameFormat: z.enum(PLAY_STYLE_VALUES).optional()
```

### 4. 계좌 정보 양식 검증

#### 예금주 (Account Holder)
- **규칙**: 한글 2-10자 (공백 불가, 특수문자 불가)
- **Schema**: `z.string().regex(/^[가-힣]{2,10}$/, '예금주는 한글 2-10자로 입력해주세요')`

#### 계좌번호 (Account Number)
- **규칙**: 숫자만 10-16자리 (하이픈 불가)
- **Schema**: `z.string().regex(/^\d{10,16}$/, '계좌번호는 숫자 10-16자리로 입력해주세요')`
- **UI**: placeholder 변경 "계좌번호 (- 없이)" → "계좌번호 (숫자만)"

### 5. 전화번호 양식 검증

- **규칙**: 한국 휴대폰 번호 형식 (010-XXXX-XXXX 또는 01XXXXXXXXX)
- **Schema**: `z.string().regex(/^01[0-9]-?\d{3,4}-?\d{4}$/, '올바른 전화번호 형식으로 입력해주세요')`
- **UI**: 자동 하이픈 포맷팅 (선택적)

### 6. 주최정보 안내 문구 개선

현재 문구:
```
💡 팀을 생성하면 팀을 관리하고 게스트를 편하게 모집할 수 있어요
```

개선 문구 (DRAFT 장점 강조):
```
💡 팀을 만들면 매치 정보가 자동 저장되고, 신청자 관리도 한 곳에서 할 수 있어요
```

또는:
```
💡 팀을 만들면 계좌·연락처가 자동 입력되고, 게스트 신청도 한눈에 관리할 수 있어요
```

## Capabilities

### Modified Capabilities
- `match-create-form`: 폼 유효성 검증 및 UX 요구사항 업데이트

## Impact

### Affected Files

**Schema 변경:**
- `src/features/match-create/model/schema.ts`
  - 주차비, 참가비 숫자 검증 강화
  - 계좌 정보 양식 검증 추가
  - 전화번호 양식 검증 추가
  - 쿼터 진행방식 기본값 제거

**UI 컴포넌트 변경:**
- `src/features/match-create/ui/components/match-create-basic-info.tsx`
  - 참가비 입력 필드 유효성 검증
  - 0원 입력 시 "무료" 라벨 표시
  - 음수 입력 차단

- `src/features/match-create/ui/components/match-create-facilities.tsx`
  - 주차비 입력 필드 유효성 검증
  - 음수 입력 차단

- `src/features/match-create/ui/components/match-create-game-format.tsx`
  - 닫기(제거) 시 기본값이 아닌 undefined 전송
  - 쿼터 진행방식 상태 초기화 로직 수정

- `src/features/match-create/ui/components/match-create-operations.tsx`
  - 예금주 입력 양식 검증
  - 계좌번호 입력 양식 검증
  - 전화번호 입력 양식 검증 (전화 선택 시)
  - 주최정보 안내 문구 변경

### Schema Changes
- DB 스키마 변경 없음 (클라이언트 검증만 강화)

### Dependencies
- 기존 데이터 호환성 유지 (서버 측 추가 검증 권장)

## Validation Rules Summary

| 필드 | 현재 | 변경 후 |
|------|------|---------|
| 주차비 | 모든 숫자 | 양의 정수 (0 이상) |
| 참가비 (현금) | 모든 숫자 | 양의 정수 (0 이상), 0원=무료 표시 |
| 참가비 (음료) | 모든 숫자 | 양의 정수 (1 이상) |
| 예금주 | 문자열 | 한글 2-10자 |
| 계좌번호 | 숫자+하이픈 | 숫자만 10-16자리 |
| 전화번호 | 문자열 | 01X-XXXX-XXXX 형식 |
| 쿼터 진행방식 | default 값 전송 | 선택 시만 전송 (undefined) |
