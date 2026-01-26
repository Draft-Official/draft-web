# Tasks: Add Recruitment Position Tracking

## 1. 타입 정의 수정
- [x] 1.1 `jsonb.types.ts`에서 RecruitmentSetup 타입 수정 (current_count 추가)
- [x] 1.2 Position 매핑 헬퍼 함수 작성 (F,C → B 변환 등)

## 2. Supabase RPC 함수 생성
- [x] 2.1 `increment_recruitment_count` RPC 함수 작성 (POSITION 타입용)
- [x] 2.2 `increment_recruitment_total` RPC 함수 작성 (ANY 타입용)
- [x] 2.3 `confirm_application_with_count` RPC 함수 작성 (트랜잭션 보장)
- [x] 2.4 SQL 마이그레이션 파일 생성

## 3. Application API 수정
- [x] 3.1 `confirmApplication`에 count 업데이트 로직 추가
- [x] 3.2 `cancelApplication`에 count 감소 로직 추가
- [x] 3.3 이미 확정된 신청 재처리 방지 로직 추가 (RPC 함수에서 처리)
- [x] 3.4 동반인(participants_info 배열) 전체 처리 로직 추가

## 4. Match Create/Edit 수정
- [x] 4.1 매치 생성 시 current 값 0으로 초기화 보장
- [x] 4.2 매치 수정 시 current 값 보존 로직
- [x] 4.3 모집 모드 변경 시 경고 및 current 초기화

## 5. current_players_count 참조 제거
- [x] 5.1 `match-mapper.ts`에서 current_players_count 참조 제거 (fallback 유지)
- [x] 5.2 `mappers.ts`에서 current_players_count 참조 제거
- [x] 5.3 recruitment_setup에서 current 값 읽도록 변경

## 6. UI 업데이트
- [x] 6.1 `host-match-detail-view.tsx`에서 recruitment_setup 기준으로 표시 (매퍼로 자동 반영)
- [ ] 6.2 `recruitment-status-card.tsx` 업데이트 (별도 작업 필요시)
- [ ] 6.3 게스트 신청 화면에서 남은 자리 표시 (별도 작업 필요시)

## 7. 데이터 마이그레이션
- [x] 7.1 기존 current_players_count → recruitment_setup.current_count 마이그레이션 스크립트 (SQL 포함)
- [ ] 7.2 기존 CONFIRMED 신청 기반으로 current 값 재계산 스크립트 (배포 후 수동 실행 필요)

## 8. 테스트 및 검증
- [ ] 8.1 확정 시 current 증가 확인
- [ ] 8.2 취소 시 current 감소 확인
- [ ] 8.3 동시 확정 시 race condition 테스트
- [ ] 8.4 동반인 포함 신청 처리 테스트
- [ ] 8.5 모집 모드별(ANY/POSITION) 정상 작동 확인

---

## 구현 완료된 파일 목록

### 신규 파일
- `src/shared/lib/recruitment.ts` - Position 매핑 및 RecruitmentSetup 헬퍼 함수
- `supabase/migrations/20260126_add_recruitment_tracking.sql` - RPC 함수 및 마이그레이션

### 수정된 파일
- `src/shared/types/jsonb.types.ts` - RecruitmentSetup 타입 확장
- `src/shared/types/database.types.ts` - RecruitmentSetup에 current_count 추가
- `src/features/application/api/application-api.ts` - confirm/cancel에 RPC 호출 추가
- `src/features/match-create/api/match-create-mapper.ts` - ANY 타입에 current_count: 0 추가
- `src/features/match/api/match-mapper.ts` - recruitment_setup.current_count 사용
- `src/features/schedule/lib/mappers.ts` - getTotalCurrentFromSetup 헬퍼 추가
- `src/features/schedule/ui/detail/host-match-detail-view.tsx` - current 값 보존 로직
