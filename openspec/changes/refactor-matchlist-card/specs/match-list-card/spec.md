# Spec: Match List Card

## Overview

매치 리스트에서 사용되는 카드 컴포넌트의 UI 구조 및 데이터 요구사항을 정의합니다.

## Card Structure

```
┌─────────────────────────────────────────────────────────┐
│ [날짜+시간]                                      [가격] │
│ 1월 28일 (화) 19:00 ~ 21:00 [NEW]              10,000원 │
├─────────────────────────────────────────────────────────┤
│ [체육관 이름] · 📍 [주소]                               │
│ 강남구민회관 · 📍 서울 강남구                          │
├─────────────────────────────────────────────────────────┤
│ [팀 로고/이모지] [팀 이름]                              │
│ [🏀 또는 팀로고] 강남픽업                              │
├─────────────────────────────────────────────────────────┤
│ [포지션] [성별] [게임방식]                  [액션버튼]  │
│ [포지션 무관] [남성] [5:5]                [신청하기]   │
│ 또는                                    [승인대기]    │
│ [가드 2/3] [포워드 1/2] [센터 0/1]       [참여확정]   │
└─────────────────────────────────────────────────────────┘
```

## Props Interface

```typescript
interface MatchListItemProps {
  match: {
    id: string;
    dateISO: string;           // YYYY-MM-DD
    startTime: string;         // HH:mm
    endTime: string;           // HH:mm
    createdAt: string;         // ISO timestamp (NEW 뱃지용)

    price: string;             // "10,000원" | "무료" | "음료수 2병"
    priceNum?: number;         // 필터링용 숫자값

    title: string;             // 체육관 이름
    location: string;          // 주소 (시/구)

    teamName?: string;         // 팀 이름 또는 manual_team_name
    teamLogo?: string;         // 팀 로고 URL
    isPersonalHost?: boolean;  // 개인 주최 여부 (🏀 표시용)

    gender: 'MALE' | 'FEMALE' | 'MIXED';
    matchFormat: MatchFormatValue;  // 'FIVE_ON_FIVE' | 'THREE_ON_THREE' etc.

    positions: {
      all?: PositionStatusUI;  // 포지션 무관
      g?: PositionStatusUI;    // 가드
      f?: PositionStatusUI;    // 포워드
      c?: PositionStatusUI;    // 센터
    };

    isClosed?: boolean;        // 모집 마감 여부
  };

  applicationStatus?: ApplicationStatusValue;  // 사용자 신청 상태
}

interface PositionStatusUI {
  status: 'open' | 'closed';
  max: number;
  current: number;
}
```

## Display Rules

### 날짜+시간 표시
- 형식: `{월}월 {일}일 ({요일}) {시작시간} ~ {종료시간}`
- 예: `1월 28일 (화) 19:00 ~ 21:00`
- NEW 뱃지: `createdAt`이 1시간 이내인 경우 표시

### 가격 표시
- 유료: `{금액}원` (천 단위 콤마)
- 무료: `무료`
- 음료: `음료수 {개수}병`

### 체육관/주소 표시
- 형식: `{체육관 이름} · 📍 {주소}`
- 주소는 시/구 단위로 축약

### 팀 정보 표시
- `team_id` 있음: 팀 로고 이미지 + 팀 이름
- `team_id` 없음 (개인 주최): 🏀 이모지 + `manual_team_name`
- 팀 로고 없음: 팀 이름 첫 글자로 fallback

### 포지션 표시
- `positions.all` 존재: "포지션 무관" chip만 표시
- `positions.all` 없음: G/F/C 각각 표시
- 형식: `{라벨} {현재}/{최대}`
- 마감된 포지션: 회색 처리

### 성별 chip
- MALE: "남성" (blue)
- FEMALE: "여성" (pink)
- MIXED: "성별 무관" (purple)

### 게임 방식 chip
- FIVE_ON_FIVE: "5:5"
- THREE_ON_THREE: "3:3"
- etc.

### 액션 버튼/Badge
| 상태 | 표시 | 스타일 |
|------|------|--------|
| 미신청 | "신청하기" Button | Primary (orange) |
| PENDING | "승인대기" Badge | Yellow |
| PAYMENT_PENDING | "입금대기" Badge | Blue |
| CONFIRMED | "참여확정" Badge | Green |
| isClosed | "모집 마감" Badge | Gray |

## Interaction

- 카드 전체 클릭: `/matches/{id}` 상세 페이지로 이동
- 신청하기 버튼 클릭: `/matches/{id}` 상세 페이지로 이동 (동일)
- Badge 클릭: 동작 없음 (상태 표시만)

## Responsive

- max-width: 430px (모바일 기준)
- 카드 전체 너비 사용
- 포지션 chips: 줄바꿈 허용 (flex-wrap)

## Accessibility

- 카드: `role="article"`, `aria-label="{체육관} - {날짜} {시간}"`
- 버튼/Badge: 적절한 `aria-label`
- 색상 대비: WCAG 2.1 AA 기준 충족
