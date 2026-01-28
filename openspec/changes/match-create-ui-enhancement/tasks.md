# Tasks: Match Create UI Enhancement

## 1. UI 스타일 개선

- [ ] 1.1 Chip 컴포넌트에 `navy` variant 추가
  - [ ] 1.1.1 `src/shared/ui/base/chip.tsx`에 navy variant 정의 추가
  - [ ] 1.1.2 비활성: `bg-white text-slate-600 border-slate-200`
  - [ ] 1.1.3 활성: `bg-slate-900 text-white border-slate-900`
- [ ] 1.2 문의하기 토글 스타일 통일
  - [ ] 1.2.1 `match-create-operations.tsx`의 Switch 스타일 변경
  - [ ] 1.2.2 `data-[state=checked]:bg-[#FF6600] data-[state=unchecked]:bg-slate-200` 적용
- [ ] 1.3 "문의하기 (연락처)" → "문의연락처"로 레이블 변경
  - [ ] 1.3.1 `match-create-operations.tsx`의 Label 텍스트 수정

## 2. 매치 조건 섹션 변경

- [ ] 2.1 권장 나이 범위 70대 제거
  - [ ] 2.1.1 `src/shared/config/constants.ts`의 `AGE_VALUES`에서 '70' 제거
  - [ ] 2.1.2 `age-selector.tsx`에서 70대 관련 로직 확인 및 정리
- [ ] 2.2 실력 범위 슬라이더 컴포넌트 생성
  - [ ] 2.2.1 `src/shared/ui/base/skill-range-slider.tsx` 신규 생성
  - [ ] 2.2.2 Props 인터페이스 정의: `minValue`, `maxValue`, `onChange`
  - [ ] 2.2.3 범위 슬라이더 UI 구현 (두 개의 핸들)
  - [ ] 2.2.4 레벨별 색상 표시 (초보:녹색, 중급:노랑, 상급:주황, 선출:빨강)
  - [ ] 2.2.5 선택된 범위 설명 카드 표시
- [ ] 2.3 `match-create-specs.tsx`에 실력 범위 슬라이더 적용
  - [ ] 2.3.1 기존 `SkillSlider` → `SkillRangeSlider`로 교체
  - [ ] 2.3.2 상태 관리: `level: number` → `levelMin: number, levelMax: number`
  - [ ] 2.3.3 Props 인터페이스 업데이트

## 3. 경기 진행 방식 섹션 변경

- [ ] 3.1 보장 쿼터 UI 제거
  - [ ] 3.1.1 `match-create-game-format.tsx`에서 보장 쿼터 `GameFormatItem` 제거
  - [ ] 3.1.2 관련 상태 및 Props 제거: `guaranteedQuarters`, `setGuaranteedQuarters`
- [ ] 3.2 매치 생성 mapper에서 보장 쿼터 필드 제거
  - [ ] 3.2.1 `match-create-mapper.ts`에서 `guaranteed_quarters` 필드 제거 (또는 null 설정)

## 4. 운영 정보 섹션 변경

- [ ] 4.1 개인 주최 시 팀 이름 입력 필드 추가
  - [ ] 4.1.1 `match-create-operations.tsx`에 조건부 Input 필드 추가
  - [ ] 4.1.2 `selectedHost === 'me'`일 때만 표시
  - [ ] 4.1.3 필수 입력(*) 표시 및 validation 추가
  - [ ] 4.1.4 placeholder: "예: 강남픽업, 수요농구회"
- [ ] 4.2 팀 생성 이점 문구 업데이트
  - [ ] 4.2.1 기존 문구를 "팀을 생성하면 팀을 관리하고 게스트를 편하게 모집할 수 있어요"로 변경
- [ ] 4.3 은행 선택 Combobox 구현
  - [ ] 4.3.1 `src/shared/config/bank-constants.ts` 생성 (은행 목록)
  - [ ] 4.3.2 `src/shared/ui/base/bank-combobox.tsx` 신규 생성
  - [ ] 4.3.3 shadcn/ui Combobox 패턴 적용 (검색 가능)
  - [ ] 4.3.4 자주 사용 은행 상단 정렬
  - [ ] 4.3.5 접근성: 키보드 탐색, ARIA 레이블
- [ ] 4.4 `match-create-operations.tsx`에 BankCombobox 적용
  - [ ] 4.4.1 기존 은행명 Input → BankCombobox로 교체
  - [ ] 4.4.2 React Hook Form 연동 확인

## 5. 데이터 레이어 변경

- [ ] 5.1 Form schema 업데이트
  - [ ] 5.1.1 `levelMin`, `levelMax` 필드 추가
  - [ ] 5.1.2 `guaranteedQuarters` 필드 제거
  - [ ] 5.1.3 개인 주최 시 `manualTeamName` 필수 validation 추가
- [ ] 5.2 매치 생성 mapper 업데이트
  - [ ] 5.2.1 실력 범위 → `skill_level_min`, `skill_level_max` 매핑
  - [ ] 5.2.2 개인 주최 시 `manual_team_name` 매핑
- [ ] 5.3 최근 매치 프리필 mapper 업데이트
  - [ ] 5.3.1 `match-to-prefill-mapper.ts`에서 실력 범위 역매핑

## 6. 테스트 및 검증

- [ ] 6.1 빌드 검증
  - [ ] 6.1.1 `npm run build` 성공 확인
  - [ ] 6.1.2 TypeScript 에러 0개 확인
- [ ] 6.2 기능 테스트
  - [ ] 6.2.1 Navy Chip 스타일 확인
  - [ ] 6.2.2 실력 범위 슬라이더 동작 확인
  - [ ] 6.2.3 은행 Combobox 검색/선택 확인
  - [ ] 6.2.4 개인 주최 시 팀 이름 필드 표시/validation 확인
  - [ ] 6.2.5 매치 생성 → DB 저장 확인
- [ ] 6.3 UI 일관성 검증
  - [ ] 6.3.1 토글 스타일 통일 확인
  - [ ] 6.3.2 모바일 (max-w-[430px]) 레이아웃 확인
