## Why

match[id] 상세 페이지에 여러 핵심 기능이 미구현되어 있거나 개선이 필요하다:

1. **공유 기능 부재**: Share2 아이콘은 있지만 실제 기능이 없음 (카카오톡 공유, 링크 복사)
2. **호스트 관리 기능 부재**: 케밥 메뉴 아이콘은 있지만 수정/취소 기능이 없음
3. **운영정보 표시 개선 필요**: 호스트 개인이 아닌 팀 정보를 중심으로 표시해야 함
4. **문의하기 기능 부재**: 버튼만 있고 실제 연락처 표시 기능이 없음
5. **시설 정보 UI 개선 필요**: 스크린샷 기준 세로 리스트 형태로 변경, 필수 항목 우선 표시
6. **지도 연동 부재**: 주소 복사는 있지만 카카오맵 연동 지도보기/길찾기 없음

## What Changes

### 1. 공유 기능 추가
- **카카오톡 공유하기**: Kakao SDK를 통한 카카오톡 공유 (매치 정보 포함)
- **링크 복사**: 클립보드에 매치 상세 URL 복사 + toast 피드백

### 2. 케밥 메뉴 기능 추가 (호스트 전용)
- **경기 수정**: 확정자가 있을 경우 가격/포지션만 수정 가능
- **경기 취소**: 확정자가 있을 경우 취소 불가 (모달로 안내)

### 3. 체육관 섹션 개선
- **지도보기**: 카카오맵 앱/웹으로 이동 (길찾기 포함)

### 4. 모집현황 UI 조정
- 카드 크기 축소 (p-3 → p-2.5, avatar w-10 → w-8 등)

### 5. 매치 조건 표시 개선
- **나이**: `getAgeRangeLabel()` 함수 사용 (matchCreate 로직 일관성)
- **준비물**: 구분자 "/" → "·" 또는 개행으로 변경

### 6. 운영정보(HostSection) → 팀 정보 중심으로 변경
- `team_id` 있으면: 팀 로고 + 팀 이름 표시
- `team_id` 없으면: 기본 로고 + `manualTeamName` 표시
- 호스트 이름 표시 제거

### 7. 문의하기 기능 구현
- **ContactModal**: 저장된 연락처 표시 (contactType, value)
- PHONE: 전화번호 복사 기능
- KAKAO_OPEN_CHAT: 링크 복사 + 클릭시 바로 이동

### 8. 시설 정보 UI 전면 개편
- 그리드 2열 → 세로 리스트 형태로 변경
- 필수 표시 순서: 1) 주차, 2) 샤워, 3) 코트 크기
- **공(ball)** 항목 추가
- **주차**: 유료시 시간당 가격 표시, shadcn Accordion으로 주차 위치 안내
- **코트 크기**: `COURT_SIZE_LABELS` 그대로 사용 (정규/세로 짧음/가로 좁음)

## Capabilities

### New Capabilities

- `share-modal`: 카카오톡 공유 + 링크 복사 모달 컴포넌트
- `kebab-menu`: 호스트 전용 수정/취소 드롭다운 메뉴
- `contact-modal`: 문의하기 연락처 표시 모달

### Modified Capabilities

- `hero-section`: 지도보기 버튼에 카카오맵 연동 추가
- `host-section`: 호스트 → 팀 정보 중심으로 변경, 문의하기 기능 연결
- `facility-section`: 세로 리스트 UI로 전면 개편
- `recruitment-status`: 카드 크기 축소
- `match-info-section`: 나이 표시 로직 변경, 준비물 구분자 변경

## Impact

### 영향받는 코드

| 파일 | 변경 내용 |
|------|----------|
| `src/features/match/ui/match-detail-view.tsx` | 공유/케밥 메뉴 기능 연결, 새 모달 추가 |
| `src/features/match/ui/components/detail/hero-section.tsx` | 카카오맵 연동 추가 |
| `src/features/match/ui/components/detail/host-section.tsx` | 팀 정보 중심 표시, 문의하기 모달 연결 |
| `src/features/match/ui/components/detail/facility-section.tsx` | 세로 리스트 UI, Accordion, 공 항목 추가 |
| `src/features/match/ui/components/detail/recruitment-status.tsx` | 카드 크기 축소 |
| `src/features/match/ui/components/detail/match-info-section.tsx` | 나이 로직 변경, 준비물 구분자 변경 |
| `src/features/match/model/types.ts` | contactInfo, teamId 필드 추가 필요시 |
| `src/features/match/api/match-mapper.ts` | contactInfo, teamId 매핑 추가 |
| `src/shared/config/constants.ts` | PARKING_LABELS, BALL_LABELS 추가 필요시 |

### New Files

| 파일 | 설명 |
|------|------|
| `src/features/match/ui/components/detail/share-modal.tsx` | 공유 옵션 모달 |
| `src/features/match/ui/components/detail/contact-modal.tsx` | 문의하기 연락처 모달 |
| `src/features/match/ui/components/detail/kebab-menu.tsx` | 호스트 전용 드롭다운 메뉴 |

### Breaking Changes

- 없음 (기존 기능에 영향 없이 추가/개선)

### 외부 의존성

- **Kakao JavaScript SDK**: 카카오톡 공유 기능용 (이미 설치 여부 확인 필요)
