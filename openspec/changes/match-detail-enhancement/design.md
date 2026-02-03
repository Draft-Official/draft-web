## Context

현재 match[id] 상세 페이지 구조:

```
MatchDetailView
├── Header
│   ├── Back button
│   ├── Share2 icon (미구현)
│   └── MoreVertical icon (미구현)
├── HeroSection (체육관, 주소, 가격)
├── RecruitmentStatus (모집 현황)
├── MatchInfoSection (매치 조건)
├── MatchRuleSection (경기 운영)
├── HostSection (운영 정보 - 현재 호스트 중심)
└── FacilitySection (시설 정보 - 2열 그리드)
```

DB 스키마 관련 필드:
- `operation_info.contact`: `{ type: ContactTypeValue, value: string }` 형태
- `team_id`: 팀 연결시 존재
- `manual_team_name`: 팀 없이 개인 주최시 수동 입력 팀명
- `gym.facilities`: 시설 정보 JSONB
  - `court_size_type`: 코트 크기 (REGULAR/SHORT/NARROW) - constants.ts 참조

**참고**: `Match.courtType`은 사용되지 않으므로 제거 대상. 코트 크기는 `facilities.court_size_type`(REGULAR/SHORT/NARROW)만 사용.

## Goals / Non-Goals

**Goals:**
- 공유 기능 (카카오톡, 링크 복사) 완전 구현
- 호스트 전용 케밥 메뉴 (수정/취소) 구현
- 카카오맵 연동 지도보기/길찾기 구현
- 문의하기 모달 구현 (연락처 표시, 복사, 이동)
- 시설 정보를 세로 리스트 형태로 재구성
- 팀 정보 중심으로 운영정보 섹션 변경
- 모집현황 카드 크기 축소

**Non-Goals:**
- 경기 수정 페이지 구현 (케밥 메뉴에서 라우팅만)
- 결제 환불 로직 (취소 API만 호출)
- 카카오 SDK 설치 (이미 있다고 가정, 없으면 태스크에 추가)

## Decisions

### 1. 공유 기능 구현 방식

**결정**: 모달 방식 + Kakao SDK

```typescript
// ShareModal 컴포넌트
interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  matchTitle: string;
  matchDate: string;
  location: string;
}
```

**구현 방식:**
- 카카오톡 공유: `Kakao.Share.sendDefault()` API 사용
- 링크 복사: `navigator.clipboard.writeText()` + toast 피드백

**대안 고려:**
- ~~Web Share API~~ → iOS/Android 네이티브 공유지만 카카오톡 특화 메시지 불가
- ~~Bottom Sheet~~ → 옵션이 2개뿐이라 모달이 더 적합

### 2. 케밥 메뉴 구현 방식

**결정**: shadcn DropdownMenu 사용 (이미 설치됨: `src/shared/ui/shadcn/dropdown-menu.tsx`)

```typescript
interface KebabMenuProps {
  matchId: string;
  isHost: boolean;
  hasConfirmedGuests: boolean;  // 확정자 존재 여부
  onEdit: () => void;
  onCancel: () => void;
}
```

**비즈니스 로직:**
- `isHost`가 false면 메뉴 숨김
- `hasConfirmedGuests`가 true면:
  - 수정: 가격/포지션만 수정 가능 안내 (라우팅은 동일)
  - 취소: 비활성화 + "확정자가 있어 취소할 수 없습니다" 툴팁

### 3. 카카오맵 연동 방식

**결정**: 카카오맵 웹 URL 스킴 사용

```typescript
// 지도보기 URL
const mapUrl = `https://map.kakao.com/link/map/${encodeURIComponent(gymName)},${latitude},${longitude}`;

// 길찾기 URL (현재 위치 → 목적지)
const directionUrl = `https://map.kakao.com/link/to/${encodeURIComponent(gymName)},${latitude},${longitude}`;
```

**대안 고려:**
- ~~카카오맵 앱 딥링크~~ → 앱 미설치시 fallback 필요, 웹 URL이 더 범용적

### 4. 시설 정보 UI 구조

**결정**: 세로 리스트 형태 + Accordion for 주차

```tsx
// 표시 순서 (필수 항목 우선)
const facilityOrder = [
  'parking',      // 1. 주차 (필수)
  'shower',       // 2. 샤워 (필수)
  'courtSize',    // 3. 코트 크기 (필수)
  'waterPurifier', // 4. 정수기
  'ball',         // 5. 공
  'airConditioner' // 6. 냉난방
];

// 각 항목 UI
<div className="flex justify-between items-center py-3 border-b">
  <span className="text-slate-600">주차</span>
  <span className="text-slate-900 font-medium">유료 (30대)</span>
</div>

// 주차 상세 (Accordion)
<Accordion type="single" collapsible>
  <AccordionItem value="parking">
    <AccordionTrigger>주차 안내</AccordionTrigger>
    <AccordionContent>
      {/* 주차 위치, 요금 상세 */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

### 5. 운영정보(HostSection) 변경

**결정**: 팀 정보 중심으로 재구성

```typescript
// Before
<Avatar src={match.hostImage} />
<div>{match.teamName}</div>
<div>호스트 {match.hostName}</div>

// After
<Avatar src={match.teamLogo || DEFAULT_TEAM_LOGO} />
<div>{match.teamId ? match.teamName : match.manualTeamName}</div>
// 호스트 이름 제거
```

**Rationale**: 게스트 입장에서 팀 정보가 더 중요하고, 개인정보 노출 최소화

### 6. 문의하기 모달 구현

**결정**: Dialog + 연락처 타입별 UI

```typescript
interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactType: ContactTypeValue;  // 'PHONE' | 'KAKAO_OPEN_CHAT'
  contactValue: string;
}

// PHONE: 전화번호 표시 + 복사 버튼
// KAKAO_OPEN_CHAT: 링크 + 복사 버튼 + "열기" 버튼 (새 탭)
```

### 7. 데이터 흐름 변경

**결정**: Match 타입에 필요한 필드 추가

```typescript
// types.ts - Match 인터페이스 확장
interface Match {
  // ... existing fields
  teamId?: string;
  manualTeamName?: string;
  contactInfo?: {
    type: ContactTypeValue;
    value: string;
  };
  latitude?: number;
  longitude?: number;
}
```

**Mapper 변경:**
```typescript
// match-mapper.ts - guestListMatchToMatch 함수 확장
return {
  // ... existing mappings
  teamId: data.teamId,
  manualTeamName: data.manualTeamName,
  contactInfo: data.contactInfo,
  latitude: data.location.latitude,
  longitude: data.location.longitude,
};
```

## Risks / Trade-offs

### Kakao SDK 의존성
**Risk**: 프로젝트에 Kakao SDK가 없을 경우 추가 설치 필요

**Mitigation**:
- 태스크에서 SDK 설치 여부 확인 후 진행
- 없으면 링크 복사만 먼저 구현, 카카오 공유는 추후 추가

### 확정자 확인 로직
**Risk**: `hasConfirmedGuests` 판단을 위해 추가 API 호출 필요

**Mitigation**:
- match detail 쿼리에서 confirmed_count 같이 가져오도록 수정
- 또는 recruitment_setup.current_count > 0 으로 대체

### 시설 정보 필드 누락
**Risk**: DB에 ball 필드가 없을 수 있음

**Mitigation**:
- gym.facilities 스키마 확인 필요
- 없으면 constants에 추가하고 migration 계획
