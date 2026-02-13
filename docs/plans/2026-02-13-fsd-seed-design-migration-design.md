# FSD + Seed Design 마이그레이션 설계

**작성일**: 2026-02-13
**작성자**: Claude Sonnet 4.5 with @beom
**상태**: Design Approved

---

## 📋 Overview

Draft 프로젝트의 파편화된 컴포넌트와 아키텍처를 **FSD (Feature-Sliced Design) + Seed Design**으로 체계화하는 마이그레이션 프로젝트.

### 현재 문제점
- AI 기반 빠른 개발로 인한 컴포넌트 파편화
- 아키텍처 불일치 (3-Folder vs 완전 분리)
- 디자인 시스템 혼재 (shadcn/ui + base/ui)
- 중복된 보일러플레이트 코드
- API 호출 중복 (match/api, match-create/api, schedule/api)

### 목표
1. **FSD 구조 도입**: 점진적 혼합 방식 (Hybrid Approach)
2. **Seed Design 통합**: Daangn의 디자인 시스템으로 통일
3. **API 중복 제거**: 카카오페이 FSD 패턴 적용
4. **타입 명확화**: Match/Application 타입별 구분

---

## 🎯 Architecture Decisions

### 1. FSD 구조 방식

**결정**: **Hybrid Approach (점진적 혼합)** ✅

- 현재 3-Folder 구조 유지
- FSD 원칙 적용 (entities, widgets 추가)
- 향후 완전 전환 가능하도록 설계

**이유**:
- 기존 코드 대부분 동작 유지
- 위험 최소화 (Radical 방식 대비)
- 팀원 학습 곡선 완만

### 2. Seed Design 통합 방식

**결정**: **병렬 진행 (Parallel)** ✅

1. Seed Foundation 먼저 적용 (CSS 토큰)
2. FSD 구조 개편과 동시 진행
3. Seed CLI로 컴포넌트 점진 교체

**이유**:
- Seed Foundation이 폴더 구조에 영향
- 동시 진행 시 중복 작업 방지

### 3. Seed 컬러 시스템

**결정**: **Seed 컬러 시스템 완전 채택 + 브랜드 네이밍 변경** ✅

```css
/* Before (Seed 기본) */
--seed-scale-color-carrot-500: #FF6F0F;

/* After (Draft 브랜드) */
--seed-scale-color-draft-500: #FF6F0F;  /* Draft Primary */
```

### 4. 컴포넌트 교체 방식

**결정**: **Seed CLI 방식 (Copy & Customize)** ✅

```bash
pnpm dlx @seed-design/cli@latest add ui:button
```

**교체 우선순위**: 사용 빈도 기준 (High Impact First)
1. Button, Chip, Input, Dialog
2. Card, Badge, Checkbox, Radio
3. Select, Tabs, Sheet, Dropdown
4. SkillSlider, BankCombobox (Draft 전용 → widgets/)

### 5. API 배치 원칙

**결정**: **카카오페이 방식 (재사용 범위 기준)** ✅

- **entities**: 여러 곳에서 재사용되는 CRUD
- **features**: 특정 기능 전용 로직
- **shared**: Infrastructure (Supabase, Auth, Notification)

### 6. OAuth 처리

**결정**: **shared/api/auth/** ✅

FSD 공식 권장사항:
> "공유/api에 요청함수들을 보관하면 토큰이 다른 인증 요청에 자유롭게 제공된다"

### 7. Notification 처리

**결정**: **shared/api/notifications/** ✅

**이유**: 횡단 관심사 (cross-cutting concern)

### 8. Match/Application 타입 구분

**결정**: **공통 로직 + 타입별 확장** ✅

```typescript
entities/match/api/
├── match-service.ts          # 공통 CRUD (80%)
├── guest-recruit-ext.ts      # 용병 전용 (10%)
└── team-match-ext.ts         # 팀 경기 전용 (10%)
```

**이유**:
- 80% 로직 공통 → 중복 최소화
- 파일 크기 관리 가능 (각 300줄 이내)
- TypeScript Discriminated Union으로 타입 안전성

### 9. 엔티티 간 관계

**결정**: **@x 패턴 (Cross-import API)** ✅

```typescript
entities/match/@x/
├── with-team.ts              # Match + Team 조합
└── with-applicants.ts        # Match + Applications 조합
```

FSD 공식 권장:
> "연결된 엔티티는 함께 리팩토링되어야 하므로, 연결을 명시적으로 만드는 것이 최선입니다."

---

## 📁 FSD Structure

### 최종 폴더 구조

```
src/
├── shared/
│   ├── api/
│   │   ├── supabase/              # Infrastructure
│   │   ├── query-client.ts        # React Query 설정
│   │   ├── auth/                  # OAuth (FSD 권장)
│   │   │   ├── auth-client.ts
│   │   │   └── token-storage.ts
│   │   ├── notifications/         # 횡단 관심사
│   │   │   ├── notification-service.ts
│   │   │   ├── queries.ts
│   │   │   └── mutations.ts
│   │   ├── gym/                   # 외부 API
│   │   └── kakao-map/
│   │
│   ├── ui/
│   │   ├── seed/                  # Seed CLI 컴포넌트
│   │   ├── custom/                # Draft 커스텀
│   │   └── layout/                # Header, BottomNav
│   │
│   ├── lib/                       # Utilities
│   ├── config/
│   │   ├── match-constants.ts
│   │   └── seed-tokens.ts         # Seed Design 토큰
│   └── types/
│
├── entities/
│   ├── match/
│   │   ├── api/
│   │   │   ├── match-service.ts          # 공통 CRUD
│   │   │   ├── guest-recruit-ext.ts      # 용병 전용
│   │   │   ├── team-match-ext.ts         # 팀 경기 전용
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   └── keys.ts
│   │   ├── model/
│   │   │   ├── match-types.ts            # Discriminated Union
│   │   │   ├── guest-recruit-types.ts
│   │   │   └── team-match-types.ts
│   │   └── @x/
│   │       ├── with-team.ts
│   │       └── with-applicants.ts
│   │
│   ├── application/
│   │   ├── api/
│   │   │   ├── application-service.ts    # 공통 CRUD
│   │   │   ├── guest-application-ext.ts  # 게스트 신청
│   │   │   ├── team-vote-ext.ts          # 팀 투표
│   │   │   ├── queries.ts
│   │   │   ├── mutations.ts
│   │   │   └── keys.ts
│   │   ├── model/
│   │   │   ├── application-types.ts      # Discriminated Union
│   │   │   ├── guest-application-types.ts
│   │   │   └── team-vote-types.ts
│   │   └── @x/
│   │       ├── with-match.ts
│   │       └── with-user.ts
│   │
│   ├── team/
│   │   ├── api/
│   │   │   ├── team-service.ts
│   │   │   └── queries.ts
│   │   └── model/
│   │
│   └── user/
│       ├── api/
│       │   ├── user-service.ts
│       │   ├── queries.ts
│       │   └── mutations.ts
│       └── model/
│
├── widgets/
│   ├── skill-selector/          # 농구 실력 선택
│   │   ├── ui/
│   │   │   ├── skill-slider.tsx
│   │   │   └── skill-range-slider.tsx
│   │   └── index.ts
│   ├── bank-selector/           # 은행 선택
│   │   ├── ui/
│   │   │   └── bank-combobox.tsx
│   │   └── index.ts
│   └── time-selector/           # 시간 선택
│       ├── ui/
│       │   └── time-picker-select.tsx
│       └── index.ts
│
├── features/
│   ├── auth/                    # 인증 UI
│   │   ├── ui/
│   │   │   ├── login-modal.tsx
│   │   │   └── auth-guard.tsx
│   │   └── model/
│   │       └── auth-context.tsx
│   │
│   ├── match/
│   │   ├── @x/                  # Sliced-group
│   │   │   ├── list/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── match-list.tsx
│   │   │   │   │   ├── match-filter.tsx
│   │   │   │   │   └── match-card.tsx    # 공통 (조건부)
│   │   │   │   └── lib/
│   │   │   ├── detail/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── match-detail.tsx  # 공통
│   │   │   │   │   ├── guest-recruit-section.tsx
│   │   │   │   │   └── team-match-section.tsx
│   │   │   │   └── lib/
│   │   │   ├── create/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── match-create-form.tsx
│   │   │   │   │   ├── match-type-select.tsx
│   │   │   │   │   ├── guest-recruit-step.tsx
│   │   │   │   │   └── team-match-step.tsx
│   │   │   │   └── model/
│   │   │   │       └── match-schema.ts
│   │   │   └── apply/
│   │   │       ├── ui/
│   │   │       │   ├── guest-apply-modal.tsx
│   │   │       └── lib/
│   │   └── index.ts
│   │
│   ├── team/
│   │   ├── @x/
│   │   │   ├── dashboard/
│   │   │   ├── match-list/
│   │   │   └── vote/
│   │   │       ├── ui/
│   │   │       │   ├── team-vote-modal.tsx
│   │   │       │   └── vote-change-dialog.tsx
│   │   │       └── lib/
│   │   └── index.ts
│   │
│   └── schedule-manage/         # 경기 관리
│       ├── ui/
│       │   ├── host-dashboard.tsx
│       │   ├── guest-dashboard.tsx
│       │   ├── applicant-list.tsx
│       │   └── payment-management.tsx
│       ├── lib/
│       │   ├── mappers.ts
│       │   └── status-utils.ts
│       └── index.ts
│
└── app/                         # Next.js App Router (routing only)
```

---

## 🎨 Seed Design Integration

### Foundation 교체

```diff
# globals.css
- @import "tailwindcss";
+ @import "@seed-design/stylesheet/global";

# Seed Design 토큰
+ --seed-scale-color-draft-500: #FF6600;  /* Draft Primary */
+ --seed-semantic-color-primary: var(--seed-scale-color-draft-500);
```

### Tailwind Config

```javascript
// tailwind.config.ts
import { seedDesignPreset } from '@seed-design/design-token';

export default {
  presets: [seedDesignPreset],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        draft: {
          500: '#FF6600',  // Brand color
        },
      },
    },
  },
};
```

### 컴포넌트 교체 매핑

| 현재 | Seed Design | 우선순위 |
|------|------------|---------|
| `base/button.tsx` | `@seed-design/react/button` | 1순위 |
| `base/chip.tsx` | `@seed-design/react/chip` | 1순위 |
| `base/input.tsx` | `@seed-design/react/text-input` | 1순위 |
| `shadcn/dialog.tsx` | `@seed-design/react/bottom-sheet` | 1순위 |
| `base/card.tsx` | 커스텀 유지 or Seed 조합 | 2순위 |
| `base/skill-slider.tsx` | `widgets/skill-selector/` 이동 | 4순위 |

---

## 🔄 Migration Strategy

### Phase 1: Foundation 준비 (1주)

**목표**: Seed Design Foundation 적용

1. Seed Design 패키지 설치
   ```bash
   pnpm add @seed-design/react @seed-design/stylesheet @seed-design/design-token
   ```

2. Foundation 설정
   - `globals.css` 교체
   - `tailwind.config.ts` Seed preset 적용
   - 브랜드 컬러 토큰 설정 (carrot → draft)

3. 검증
   - 기존 UI 깨지지 않는지 확인
   - 브랜드 컬러 정상 작동 확인

### Phase 2: FSD 구조 개편 (2-3주)

**목표**: entities, widgets 레이어 추가

#### Step 1: entities/match 생성
1. `entities/match/api/` 생성
2. `match/api/` + `match-create/api/` 통합
3. `guest-recruit-ext.ts`, `team-match-ext.ts` 분리
4. `@x/with-team.ts` 추가

#### Step 2: entities/application 생성
1. `entities/application/api/` 생성
2. `application/api/` + `schedule/api/application-mutations.ts` 통합
3. `guest-application-ext.ts`, `team-vote-ext.ts` 분리
4. `@x/with-match.ts`, `@x/with-user.ts` 추가

#### Step 3: entities/user, team 생성
1. `entities/user/api/` 생성 (auth에서 이동)
2. `entities/team/api/` 생성

#### Step 4: shared/api 정리
1. `shared/api/auth/` 생성 (OAuth 이동)
2. `shared/api/notifications/` 생성

#### Step 5: widgets 생성
1. `widgets/skill-selector/` 생성
2. `base/skill-slider.tsx` 이동
3. `widgets/bank-selector/`, `widgets/time-selector/` 생성

#### Step 6: features 정리
1. `features/match/@x/` Sliced-group 적용
2. `features/schedule-manage/` 생성 (schedule 통합)
3. API 제거 (entities 사용)

### Phase 3: Seed 컴포넌트 교체 (3-4주)

**우선순위별 교체**

**1순위** (1주): Core UI
- Button, Chip, Input, Dialog
- 사용처 많음 → 즉시 효과

**2순위** (1주): Common
- Card, Badge, Checkbox, Radio
- 중간 빈도

**3순위** (1주): Interactive
- Select, Tabs, Sheet, Dropdown

**4순위** (1주): Specialized
- SkillSlider, BankCombobox → widgets 이동
- Seed 조합으로 구현 or 커스텀 유지

### Phase 4: 검증 및 정리 (1주)

1. 전체 기능 테스트
2. 사용하지 않는 파일 삭제
3. Import 경로 정리
4. 문서 업데이트

**총 소요 기간**: 7-9주

---

## ⚠️ Risk Mitigation

### Risk 1: 대규모 Breaking Change

**위험도**: High
**대응책**:
- Phase별 점진적 진행
- 각 Phase마다 기능 테스트
- Git branch 전략 (feature/fsd-migration)

### Risk 2: Seed Design 컴포넌트 부족

**위험도**: Medium
**대응책**:
- Seed + Radix UI 조합으로 커스텀
- 필요 시 기존 컴포넌트 유지
- Draft 전용 컴포넌트는 widgets로

### Risk 3: 팀원 학습 곡선

**위험도**: Medium
**대응책**:
- FSD 문서 공유
- Pair programming 진행
- 점진적 도입으로 적응 시간 확보

### Risk 4: 성능 저하

**위험도**: Low
**대응책**:
- Bundle size 모니터링
- Code splitting 적용
- Lazy loading 활용

### Risk 5: 타입 에러 대량 발생

**위험도**: Medium
**대응책**:
- Discriminated Union으로 타입 안전성 확보
- Mapper에서 타입 변환 집중 관리
- TypeScript strict mode 유지

---

## 📊 Success Metrics

### 정량적 지표

- [ ] 중복 코드 50% 감소
- [ ] 파일 개수 30% 감소
- [ ] Bundle size 20% 감소
- [ ] Build time 10% 개선

### 정성적 지표

- [ ] 컴포넌트 재사용성 향상
- [ ] 코드 가독성 향상
- [ ] 신규 기능 개발 속도 증가
- [ ] 디자인 일관성 확보

---

## 📚 References

### FSD 공식 문서
- [Feature-Sliced Design](https://feature-sliced.design/)
- [FSD with React Query](https://feature-sliced.design/docs/guides/tech/with-react-query)
- [FSD Authentication Guide](https://feature-sliced.design/docs/guides/examples/auth)

### Seed Design
- [Seed Design Docs](https://seed-design.io/docs)
- [Seed Design React Components](https://seed-design.io/react/llms-full.txt)
- [Seed Design GitHub](https://github.com/daangn/seed-design)

### 참고 프로젝트
- [IT-Bookstore (FSD 예제)](https://github.com/UmttikhinaDasha/IT-Bookstore)
- [카카오페이 FSD 적용 사례](https://tech.kakaopay.com/post/fsd/)

---

**Last Updated**: 2026-02-13
**Next Review**: 2026-02-20 (Phase 1 완료 후)
