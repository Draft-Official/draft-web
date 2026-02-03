## 0. 사전 확인

- [x] 0.1 Kakao JavaScript SDK 설치 여부 확인 → **REST API 사용 (JS SDK 불필요)**
- [x] 0.2 shadcn Accordion 컴포넌트 설치 여부 확인 → **설치 완료**
- [x] 0.3 shadcn DropdownMenu 컴포넌트 설치 여부 확인 → **이미 설치됨** (`src/shared/ui/shadcn/dropdown-menu.tsx`)
- [x] 0.4 `gym.facilities` DB 스키마에서 `ball` 필드 존재 여부 확인 → **존재함** (`GymFacilities.ball`)
- [x] 0.5 `operation_info.contact` 필드 구조 확인 → **OperationInfo { type, phone, url }**
- [x] 0.6 `Match.courtType` 위치 확인 → **사용되지 않음, 제거 대상**

## 1. 타입 및 상수 추가

- [x] 1.1 `constants.ts`에 `PARKING_TYPE_VALUES`, `PARKING_TYPE_LABELS` 추가 (FREE/PAID/IMPOSSIBLE)
- [x] 1.2 `constants.ts`에 `BALL_LABELS` 추가 (PROVIDED/NOT_PROVIDED)
- [x] 1.3 `types.ts` Match 인터페이스에 `teamId`, `manualTeamName`, `contactInfo`, `latitude`, `longitude` 필드 추가
- [x] 1.4 `types.ts` Match 인터페이스에서 `courtType` 필드 제거 (사용되지 않음)
- [x] 1.5 `types.ts` GuestListMatch 인터페이스에서 `courtType` 필드 제거
- [x] 1.6 `match-mapper.ts`에서 `courtType` 관련 매핑 코드 제거
- [x] 1.7 `match-mapper.ts`에서 새 필드들 매핑 추가 (teamId, contactInfo, latitude, longitude)

## 2. 공유 기능 구현

- [x] 2.1 `share-modal.tsx` 컴포넌트 생성 (`src/features/match/ui/components/detail/`)
- [x] 2.2 카카오톡 공유 기능 구현 (navigator.share 또는 링크 복사 대체)
- [x] 2.3 링크 복사 기능 구현 (navigator.clipboard + toast)
- [x] 2.4 `match-detail-view.tsx` 헤더의 Share2 아이콘에 ShareModal 연결

## 3. 케밥 메뉴 구현

- [x] 3.1 `kebab-menu.tsx` 컴포넌트 생성
  - shadcn DropdownMenu 사용 (`import { DropdownMenu, ... } from '@/shared/ui/shadcn/dropdown-menu'`)
- [x] 3.2 호스트 여부 판단 로직 추가 (`match.hostId === user?.id`)
- [x] 3.3 확정자 존재 여부 판단 로직 추가
- [x] 3.4 "수정" 메뉴 항목 (확정자 있으면 안내 메시지 포함)
- [x] 3.5 "경기 취소" 메뉴 항목 (확정자 있으면 비활성화)
- [x] 3.6 `match-detail-view.tsx` 헤더의 MoreVertical 아이콘에 KebabMenu 연결

## 4. 체육관 섹션 (HeroSection) 개선

- [x] 4.1 "지도보기" 버튼에 카카오맵 URL 연동 (`https://map.kakao.com/link/map/...`)
- [x] 4.2 길찾기 옵션 추가 고려 (지도보기 클릭시 길찾기 URL로 이동)
- [x] 4.3 주소 복사 성공 시 toast 피드백 추가 (현재 없음)

## 5. 모집현황 (RecruitmentStatus) 크기 축소

- [x] 5.1 카드 패딩 축소: `p-3` → `p-2.5`
- [x] 5.2 아바타 크기 축소: `w-10 h-10` → `w-8 h-8`
- [x] 5.3 폰트 크기 조정: 현재/최대 인원 `text-lg` → `text-base`
- [x] 5.4 전체 섹션 padding 조정: `py-6` → `py-5`

## 6. 매치 조건 (MatchInfoSection) 개선

- [x] 6.1 나이 표시 로직 변경: `getAgeRangeLabel()` 함수 사용 → **mapper의 ageRange 필드 사용**
- [x] 6.2 준비물 구분자 변경: `join(' / ')` → `join(' · ')` 또는 개별 Chip으로

## 7. 운영정보 (HostSection) → 팀 정보 중심 변경

- [x] 7.1 "운영 정보" 섹션 제목 유지 또는 "팀 정보"로 변경
- [x] 7.2 Avatar: `match.hostImage` → `match.teamLogo || DEFAULT_TEAM_LOGO`
- [x] 7.3 팀명: `match.teamId ? match.teamName : match.manualTeamName`
- [x] 7.4 "호스트 {hostName}" 라인 제거
- [x] 7.5 DEFAULT_TEAM_LOGO 상수 정의 (기본 팀 아이콘 또는 이니셜)

## 8. 문의하기 모달 구현

- [x] 8.1 `contact-modal.tsx` 컴포넌트 생성
- [x] 8.2 연락처 타입별 UI 분기 (PHONE vs KAKAO_OPEN_CHAT)
- [x] 8.3 PHONE: 전화번호 표시 + "번호 복사" 버튼
- [x] 8.4 KAKAO_OPEN_CHAT: 링크 표시 + "링크 복사" + "열기" 버튼
- [x] 8.5 복사 성공 시 toast 피드백
- [x] 8.6 HostSection의 "문의하기" 버튼에 ContactModal 연결

## 9. 시설 정보 (FacilitySection) 전면 개편

- [x] 9.1 그리드 2열 → 세로 리스트 레이아웃으로 변경
- [x] 9.2 표시 순서 변경: 주차 → 샤워 → 코트크기 → 정수기 → 공 → 냉난방
- [x] 9.3 주차 항목 개선:
  - [x] 9.3.1 유료시 "(시간당 X원)" 형식으로 표시
  - [x] 9.3.2 shadcn Accordion으로 주차 위치 상세 안내
- [x] 9.4 코트 크기: `COURT_SIZE_LABELS` 사용 (정규/세로짧음/가로좁음)
- [x] 9.5 공(ball) 항목 추가: "제공" / "미제공"
- [x] 9.6 각 항목 UI: `<div className="flex justify-between py-3 border-b">...</div>`
- [x] 9.7 필수 항목(주차/샤워/코트) 항상 표시, 나머지는 값 있을 때만

## 10. 데이터 흐름 수정

- [x] 10.1 `matchRowToGuestListMatch`에서 `operation_info.contact` 매핑 → **buildContactInfo 함수 추가**
- [x] 10.2 `matchRowToGuestListMatch`에서 `team_id`, `manual_team_name` 매핑
- [x] 10.3 `guestListMatchToMatch`에서 새 필드들 포함
- [x] 10.4 확정자 수 조회를 위한 쿼리 수정 → **match-detail-view.tsx에서 구현**

## 11. 검증

- [x] 11.1 TypeScript 빌드 성공 확인 (`npm run build`) → **빌드 성공**
- [ ] 11.2 공유 모달 열림/닫힘 확인
- [ ] 11.3 카카오톡 공유 동작 확인 (모바일/데스크톱)
- [ ] 11.4 링크 복사 + toast 확인
- [ ] 11.5 케밥 메뉴 호스트 전용 표시 확인
- [ ] 11.6 확정자 있을 때 취소 비활성화 확인
- [ ] 11.7 지도보기 → 카카오맵 이동 확인
- [ ] 11.8 문의하기 모달 연락처 표시 확인
- [ ] 11.9 시설 정보 세로 리스트 레이아웃 확인
- [ ] 11.10 주차 Accordion 동작 확인
- [ ] 11.11 모집현황 크기 축소 시각적 확인
