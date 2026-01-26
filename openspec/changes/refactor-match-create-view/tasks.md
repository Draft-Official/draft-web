# Tasks: Match Create View 리팩토링

## 1. Phase 1: UI 상태 로컬화 (Quick Wins)

- [x] 1.1 `MatchCreateGameFormat` 컴포넌트 내부로 show 상태 이동
  - [x] 1.1.1 `showGameFormatType`, `showRules`, `showGuaranteed`, `showReferee` 로컬 상태로 이동
  - [x] 1.1.2 match-create-view.tsx에서 해당 상태 및 Props 제거
- [x] 1.2 `MatchCreateFacilities` 컴포넌트 내부로 dialog 상태 이동
  - [x] 1.2.1 `showParkingDialog`, `showCourtSizeDialog` 로컬 상태로 이동
  - [x] 1.2.2 match-create-view.tsx에서 해당 상태 및 Props 제거
- [ ] 1.3 기타 UI 상태 로컬화
  - [ ] 1.3.1 `showTip` → LocalStorage hook으로 추출
  - [ ] 1.3.2 `showRecentMatchesDialog` 유지 (부모에서 제어 필요)

## 2. Phase 1: useLocationSearch 훅 추출

- [x] 2.1 `hooks/use-location-search.ts` 생성
  - [x] 2.1.1 location 관련 상태 5개 이동 (location, locationData, searchResults, isDropdownOpen, isExistingGym)
  - [x] 2.1.2 debounced search 로직 이동
  - [x] 2.1.3 Gym lookup 및 시설 프리필 로직 통합
  - [x] 2.1.4 반환 객체: `{ location, locationData, searchResults, isDropdownOpen, handleSearch, handleSelect, handleClear, gymFacilities }`
- [x] 2.2 match-create-view.tsx 적용
  - [x] 2.2.1 훅 import 및 호출
  - [x] 2.2.2 기존 상태 및 핸들러 제거 (~126줄)
  - [x] 2.2.3 MatchCreateBasicInfo Props 간소화
- [x] 2.3 중복 타입 정리 (추가 작업)
  - [x] 2.3.1 `model/types.ts` 생성 - LocationData, GymFacilities 통합
  - [x] 2.3.2 3개 파일의 중복 interface 제거 및 import 변경

## 3. Phase 2: useRecentMatchPrefill 훅 + Mapper 클래스

- [x] 3.1 `mappers/match-to-prefill-mapper.ts` 생성
  - [x] 3.1.1 MatchToPrefillMapper 클래스 정의
  - [x] 3.1.2 toFormData() 메서드 - 최종 FormData 반환
  - [x] 3.1.3 도메인별 private 메서드 (mapBasicInfo, mapRecruitment, mapSpecs 등)
- [x] 3.2 `hooks/use-recent-match-prefill.ts` 생성
  - [x] 3.2.1 FormMethods를 인자로 받는 훅
  - [x] 3.2.2 Mapper 클래스 사용하여 reset() 호출
  - [x] 3.2.3 반환: fillFromRecentMatch 함수
- [x] 3.3 match-create-view.tsx 적용
  - [x] 3.3.1 훅 import 및 호출
  - [x] 3.3.2 기존 fillFromRecentMatch 함수 제거 (~137줄)
- [x] 3.4 중복 타입 정리 (추가 작업)
  - [x] 3.4.1 recent-matches-dialog.tsx의 중복 MatchWithRelations 제거
  - [x] 3.4.2 shared/types/database.types.ts에서 import

## 4. Phase 2: FormContext 적용 - 각 컴포넌트 리팩토링

- [ ] 4.1 `MatchCreateFacilities` 리팩토링
  - [ ] 4.1.1 useFormContext() 사용
  - [ ] 4.1.2 Controller로 facilities 필드 관리
  - [ ] 4.1.3 Props에서 setter 함수들 제거 (11개 → 1개)
- [ ] 4.2 `MatchCreateRecruitment` 리팩토링
  - [ ] 4.2.1 useFormContext() 사용
  - [ ] 4.2.2 recruitment 관련 Props 제거
- [ ] 4.3 `MatchCreateSpecs` 리팩토링
  - [ ] 4.3.1 useFormContext() 사용
  - [ ] 4.3.2 specs 관련 Props 제거
- [ ] 4.4 `MatchCreateGameFormat` 리팩토링
  - [ ] 4.4.1 useFormContext() 사용
  - [ ] 4.4.2 gameFormat 관련 Props 제거

## 5. Phase 3: Zod Schema 검증

- [ ] 5.1 `model/match-create-validation.ts` 생성
  - [ ] 5.1.1 matchCreateSchema 정의
  - [ ] 5.1.2 basicInfo 검증 (date, location required)
  - [ ] 5.1.3 recruitment 검증 (discriminated union, 최소 1명)
  - [ ] 5.1.4 operations 검증 (selectedHost, account, contact required)
- [ ] 5.2 match-create-view.tsx에 zodResolver 적용
  - [ ] 5.2.1 useForm에 resolver 옵션 추가
  - [ ] 5.2.2 onSubmit의 수동 검증 블록 제거 (~50줄)
  - [ ] 5.2.3 에러 메시지를 react-hook-form errors로 교체

## 6. Phase 3: 도메인별 상태 그룹화

- [ ] 6.1 FormData 타입 재구조화
  - [ ] 6.1.1 FacilitiesState 타입 정의 (parking, amenities, equipment, courtSize)
  - [ ] 6.1.2 SpecsState 타입 정의 (matchType, gameFormat, level, gender, ageRange)
  - [ ] 6.1.3 RecruitmentState 타입 정의 (discriminated union)
- [ ] 6.2 기본 schema.ts 업데이트
  - [ ] 6.2.1 새로운 구조로 Zod schema 업데이트
  - [ ] 6.2.2 기존 mapper와의 호환성 확인

## 7. Phase 4: useMatchFormSubmit 훅 + 기본값 저장

- [ ] 7.1 `hooks/use-operations-defaults.ts` 생성
  - [ ] 7.1.1 saveUserDefaults 함수
  - [ ] 7.1.2 saveTeamDefaults 함수
  - [ ] 7.1.3 반환: saveDefaults(operationsData)
- [ ] 7.2 `hooks/use-match-form-submit.ts` 생성
  - [ ] 7.2.1 createMatch mutation 호출
  - [ ] 7.2.2 saveDefaults 호출 (조건부)
  - [ ] 7.2.3 router.push('/') 실행
  - [ ] 7.2.4 에러 핸들링
- [ ] 7.3 match-create-view.tsx 적용
  - [ ] 7.3.1 훅 import 및 호출
  - [ ] 7.3.2 기존 onSubmit 함수 제거 (233줄 → handleSubmit 호출만)

## 8. Phase 4: react-hook-form 완전 통합

- [ ] 8.1 useState → useForm defaultValues 마이그레이션
  - [ ] 8.1.1 selectedDate → form.watch('basicInfo.selectedDate')
  - [ ] 8.1.2 feeType → form.watch('basicInfo.feeType')
  - [ ] 8.1.3 기타 남은 상태들 확인 및 이동
- [ ] 8.2 불필요한 상태 제거
  - [ ] 8.2.1 operationsData (FormContext로 대체)
  - [ ] 8.2.2 중복 상태 정리

## 9. 테스트 및 검증

- [ ] 9.1 E2E 테스트 작성
  - [ ] 9.1.1 기본 경기 생성 플로우
  - [ ] 9.1.2 최근 경기 불러오기 플로우
  - [ ] 9.1.3 검증 에러 핸들링
- [ ] 9.2 단위 테스트
  - [ ] 9.2.1 useLocationSearch 테스트
  - [ ] 9.2.2 MatchToPrefillMapper 테스트
  - [ ] 9.2.3 matchCreateSchema 테스트
- [ ] 9.3 빌드 및 타입 체크
  - [ ] 9.3.1 `npm run build` 성공
  - [ ] 9.3.2 TypeScript 에러 0개
  - [ ] 9.3.3 ESLint 경고 확인

## 10. 문서화

- [ ] 10.1 새로운 훅 사용법 JSDoc 추가
- [ ] 10.2 Mapper 클래스 문서화
- [ ] 10.3 리팩토링 전후 비교 문서 업데이트
