# Design: Match Create View 리팩토링

## Context

`match-create-view.tsx`는 경기 생성 폼을 관리하는 핵심 컴포넌트로, 다음과 같은 복잡성을 갖고 있습니다:
- 6개 섹션 (기본 정보, 시설, 모집, 스펙, 게임 포맷, 운영 정보)
- 43개의 폼 필드
- Kakao Map API 연동
- Gym 데이터 프리필
- 최근 경기 불러오기
- 기본값 저장 기능

현재 구조는 모든 상태와 로직을 단일 컴포넌트에서 관리하여 유지보수성이 저하되어 있으며, 이는 다음과 같은 제약 조건 하에서 개선되어야 합니다:
- 기존 기능 100% 유지 (breaking change 없음)
- 점진적 리팩토링 가능 (단계별 적용)
- 타입 안전성 유지

## Goals / Non-Goals

### Goals
- 코드 길이 72% 감소 (952줄 → ~260줄)
- useState 개수 90% 감소 (43개 → ~5개)
- Props Drilling 제거
- 테스트 가능성 향상
- 신규 개발자 온보딩 시간 단축

### Non-Goals
- UI/UX 변경 없음 (시각적 동작 동일 유지)
- DB 스키마 변경 없음
- 새로운 기능 추가 없음
- 성능 최적화 (리팩토링의 부산물로만 허용)

## Decisions

### Decision 1: react-hook-form을 Full Adoption

**현황**: FormProvider를 사용하지만 대부분 useState로 중복 관리

**결정**: 모든 폼 상태를 react-hook-form으로 통합

**이유**:
1. 이미 의존성으로 포함되어 있음 (추가 비용 없음)
2. FormContext 패턴으로 Props Drilling 자동 해결
3. 검증 로직 통합 (Zod resolver)
4. 성능 최적화 내장 (불필요한 re-render 방지)

**대안 고려**:
- Zustand/Redux: 과도한 복잡성, 폼 관리에 최적화되지 않음
- 현재 useState 유지: Props Drilling 해결 불가
- Context API 직접 구현: react-hook-form이 더 최적화됨

**트레이드오프**:
- 장점: Props 90% 감소, 타입 안전성 향상, 검증 로직 통합
- 단점: 팀원 학습 필요 (FormContext 패턴)
- 완화: 문서화 및 코드 리뷰로 해결

---

### Decision 2: 커스텀 훅으로 비즈니스 로직 추출

**현황**: 25개의 함수가 view 파일 내부에 정의됨

**결정**: 복잡한 로직을 4개의 커스텀 훅으로 추출
- `useLocationSearch` - 장소 검색 (126줄)
- `useRecentMatchPrefill` - 최근 경기 매핑 (137줄)
- `useMatchFormSubmit` - 폼 제출 (233줄)
- `useOperationsDefaults` - 기본값 저장 (83줄)

**이유**:
1. 단일 책임 원칙 (SRP) 적용
2. 테스트 가능성 향상 (컴포넌트 분리 테스트)
3. 재사용성 향상
4. 타입 안전성 강화 (훅의 반환 타입 명시)

**대안 고려**:
- Helper 함수로 분리: 상태 관리 불가, 여전히 view에서 조합 필요
- 하위 컴포넌트로 분리: UI가 없는 로직에는 부적절
- Class 기반 서비스: React Hook 생태계와 불일치

**트레이드오프**:
- 장점: 파일 분리로 각 로직의 책임 명확, 독립적 테스트 가능
- 단점: 파일 개수 증가 (1개 → 5개)
- 완화: hooks/ 디렉토리로 그룹화, 명확한 네이밍

---

### Decision 3: Mapper 클래스로 데이터 변환 분리

**현황**: `fillFromRecentMatch` 함수가 137줄, 12개 섹션 매핑 포함

**결정**: `MatchToPrefillMapper` 클래스 생성

```typescript
class MatchToPrefillMapper {
  constructor(private match: MatchWithRelations) {}
  
  toFormData(): MatchCreateFormData {
    return {
      ...this.mapBasicInfo(),
      ...this.mapRecruitment(),
      ...this.mapSpecs(),
      // ...
    };
  }
  
  private mapBasicInfo() { ... }
  private mapRecruitment() { ... }
  // ...
}
```

**이유**:
1. 복잡한 변환 로직을 구조화
2. 테스트 용이성 (단위 테스트 가능)
3. private 메서드로 섹션별 분리
4. 재사용 가능 (다른 곳에서도 동일 매핑 필요 시)

**대안 고려**:
- 함수형 접근 (pipe/compose): TypeScript 타입 추론 어려움
- 단일 대형 함수 유지: 테스트 및 유지보수 어려움
- 섹션별 개별 함수: 공통 로직 중복 발생

**트레이드오프**:
- 장점: 명확한 구조, 섹션별 독립 테스트, 타입 안전성
- 단점: OOP 패턴 도입 (React 생태계는 주로 함수형)
- 완화: 훅 내부에서만 사용, 외부 API는 함수형 유지

---

### Decision 4: Zod Schema로 검증 통합

**현황**: onSubmit 내부에 수동 if 문 검증 (~50줄)

**결정**: Zod Schema + zodResolver 사용

```typescript
export const matchCreateSchema = z.object({
  basicInfo: z.object({
    selectedDate: z.string().min(1, "날짜를 선택해주세요."),
    location: z.object({
      kakaoPlaceId: z.string().min(1, "장소를 검색하여 선택해주세요.")
    })
  }),
  // ...
});
```

**이유**:
1. 검증 로직과 UI 로직 분리
2. 타입과 검증 스키마 동기화
3. 재사용 가능 (API 요청 전 재검증)
4. 에러 메시지 중앙 관리

**대안 고려**:
- Yup: 번들 크기 더 큼, Zod가 TypeScript 통합 우수
- react-hook-form 내장 검증: 복잡한 조건부 검증 어려움
- 수동 검증 유지: 코드 중복, 타입 불일치 위험

**트레이드오프**:
- 장점: 선언적 검증, 타입 안전성, 코드 감소
- 단점: 새로운 의존성 추가 (~14KB gzipped)
- 완화: 이미 다른 곳에서 Zod 사용 중 (추가 비용 없음)

---

### Decision 5: UI 상태 로컬화

**현황**: show/hide 플래그가 부모에서 관리되어 Props로 전달

**결정**: 각 컴포넌트 내부로 상태 이동

**이유**:
1. 컴포넌트 자율성 향상
2. Props 개수 감소
3. 리렌더 범위 최소화 (부모 리렌더 불필요)
4. 단일 책임 원칙 (컴포넌트가 자신의 UI 상태 관리)

**예외**: 부모가 명시적으로 제어해야 하는 경우만 Props 사용
- `showRecentMatchesDialog` - 부모의 "불러오기" 버튼으로 제어

**대안 고려**:
- 모든 상태 부모에서 관리: Props Drilling 지속, 리렌더 증가
- Context로 공유: 과도한 복잡성, UI 상태에는 부적절

**트레이드오프**:
- 장점: Props 40% 감소, 성능 향상 (부분 리렌더)
- 단점: 부모에서 상태 직접 접근 불가
- 완화: 필요 시 ref로 제어 가능

## Risks / Trade-offs

### Risk 1: 기존 기능 손상

**영향도**: 높음

**완화 전략**:
1. Phase별 E2E 테스트 필수
2. 각 Phase 완료 후 QA 확인
3. Storybook으로 컴포넌트 단위 검증
4. Feature flag로 점진적 롤아웃 (필요 시)

### Risk 2: react-hook-form 마이그레이션 복잡도

**영향도**: 중간

**완화 전략**:
1. 섹션별 점진적 적용 (한 번에 모든 필드 변경 X)
2. 기존 useState와 병행 사용 허용 (과도기)
3. Phase 4까지 도달하지 못해도 Phase 1-3만으로도 효과

### Risk 3: 팀원 학습 곡선

**영향도**: 낮음

**완화 전략**:
1. 커스텀 훅 JSDoc 문서화
2. 코드 리뷰에서 패턴 설명
3. 예제 코드 제공
4. react-hook-form은 이미 프로젝트에서 사용 중

### Risk 4: 일정 지연

**영향도**: 중간

**완화 전략**:
1. Week 1-2만 필수 (Quick Wins)
2. Week 3-4는 선택적 진행 (리소스 여유 시)
3. Phase별 독립적 배포 가능

## Migration Plan

### Phase 1 (Week 1): Quick Wins - 부작용 최소
- UI 상태 로컬화
- `useLocationSearch` 훅 추출
- 배포: 즉시 가능
- 롤백: 쉬움 (독립적 변경)

### Phase 2 (Week 2): 핵심 로직 분리
- `useRecentMatchPrefill` 훅 + Mapper
- FormContext 적용 시작
- 배포: Phase별 확인 후
- 롤백: 중간 난이도 (일부 Props 복원 필요)

### Phase 3 (Week 3): 검증 및 구조 개선
- Zod Schema 도입
- 도메인별 상태 그룹화
- 배포: 충분한 테스트 후
- 롤백: 어려움 (Schema 의존성)

### Phase 4 (Week 4): 최종 통합
- react-hook-form 완전 통합
- 남은 useState 제거
- 배포: 전체 E2E 테스트 후
- 롤백: 매우 어려움 (전체 되돌려야 함)

**Rollback Strategy**:
- Git feature branch로 작업
- 각 Phase별 별도 PR
- Phase 3 이후부터는 feature flag 고려

## Open Questions

1. **Q**: Zod 대신 다른 검증 라이브러리 고려?
   - **A**: Zod로 결정 (TypeScript 통합, 이미 사용 중)

2. **Q**: Phase 4까지 모두 완료해야 하나?
   - **A**: Phase 1-2만으로도 50% 개선. Phase 3-4는 리소스 여유 시

3. **Q**: 다른 feature (match-detail 등)도 동일 패턴 적용?
   - **A**: match-create 완료 후 평가. 필요 시 별도 proposal

4. **Q**: 성능 모니터링 필요?
   - **A**: Phase별 Lighthouse 점수 확인. React DevTools Profiler로 리렌더 측정
