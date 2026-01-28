# Proposal: Match Create UI Enhancement

## Why

매치 생성 폼의 사용성과 데이터 정확성을 개선하기 위한 UI/UX 변경이 필요합니다. 현재 Chip 스타일 불일치, 실력/나이 선택의 제한적 표현, 개인 주최 시 식별 정보 부재, 은행 입력의 불편함 등 여러 사용성 이슈가 있습니다.

## What Changes

### UI 스타일 개선
- **Navy Chip variant 추가**: 날짜 선택과 동일한 solid 스타일 (`bg-slate-900 text-white`) Chip variant 추가
- **문의하기 토글 스타일 통일**: 현재 다른 스타일의 Switch를 포지션 무관/포지션별 토글과 동일하게 변경 (`data-[state=checked]:bg-[#FF6600]`)

### 매치 조건 섹션
- **실력 범위 Min-Max 선택**: 단일 실력값 선택에서 최소~최대 범위 선택으로 변경 (예: "중급1 ~ 상급1")
- **권장 나이 범위 축소**: 70대 옵션 제거, 20~60대만 선택 가능하도록 변경

### 경기 진행 방식 섹션
- **보장 쿼터 항목 삭제**: UI 및 DB schema에서 완전 제거

### 운영 정보 섹션
- **개인 주최 시 팀/모임 이름 필수 입력**: "개인" 선택 시 별도 Input 필드로 임시 팀 이름 기입 유도
- **팀 생성 이점 문구 개선**: "팀을 생성하면 팀을 관리하고 게스트를 편하게 모집할 수 있어요"로 변경
- **은행명 검색 Combobox**: 텍스트 입력 대신 검색 가능한 Combobox로 은행 선택
- **네이밍 변경**: "문의하기 (연락처)" → "문의연락처"

## Capabilities

### New Capabilities
- `match-create-form`: 매치 생성 폼 UI 컴포넌트 및 입력 필드 요구사항 정의
- `skill-range-selector`: 실력 범위(min-max) 선택 컴포넌트 요구사항
- `bank-combobox`: 검색 가능한 은행 선택 Combobox 컴포넌트

### Modified Capabilities
_없음 - 기존 openspec/specs/ 에 정의된 스펙 없음_

## Impact

### Affected Files
- `src/shared/ui/base/chip.tsx` - navy variant 추가
- `src/shared/ui/base/skill-slider.tsx` → `skill-range-slider.tsx`로 변경
- `src/shared/config/constants.ts` - AGE_VALUES에서 '70' 제거
- `src/shared/config/skill-constants.ts` - 범위 선택 지원 타입 추가
- `src/features/match-create/ui/components/match-create-specs.tsx` - 실력 범위, 나이 변경 적용
- `src/features/match-create/ui/components/match-create-game-format.tsx` - 보장 쿼터 제거
- `src/features/match-create/ui/components/match-create-operations.tsx` - 팀 이름 필드, 은행 Combobox, 토글 스타일, 네이밍 변경
- `src/shared/ui/base/bank-combobox.tsx` - 신규 컴포넌트

### Schema Changes
- `matches` 테이블: `guaranteed_quarters` 컬럼 사용 중단 (또는 제거)
- `matches` 테이블: `skill_level` → `skill_level_min`, `skill_level_max`로 변경 고려
- `matches` 테이블: 개인 주최 시 `temp_team_name` 필드 추가 고려

### Dependencies
- 기존 매치 데이터 마이그레이션 필요 (skill_level 단일값 → 범위)
- 보장 쿼터 데이터 처리 방안 결정 필요
