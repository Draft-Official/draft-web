## Context

현재 team 탭의 네비게이션은 `router.back()`, `router.push()`, client-side tab state(Tabs component)를 사용합니다. 이는 일반적인 웹 앱에서는 작동하지만, 모바일 앱과 같은 직관적인 경험을 제공하지 못하는 문제가 있습니다:

1. **Deep Link 시 Back 동작 불명확**: 카카오톡 등으로 공유된 `/team/ABC/settings` 링크를 열면 히스토리가 없어 `router.back()`이 이전 사이트로 이동
2. **Tab State 공유 불가**: Team detail 페이지의 탭(홈/일정/멤버)은 client state로만 관리되어 URL로 공유 불가
3. **Bottom Nav 스택 오염**: 같은 탭을 여러 번 클릭하면 히스토리가 계속 쌓임

**Constraints:**
- Next.js 15 App Router 사용 (useRouter, useSearchParams)
- 모바일 우선 UX (max-w-[430px])
- 기존 코드 패턴 유지 (3-folder architecture)

## Goals / Non-Goals

**Goals:**
- Deep link에서도 일관된 back button 동작 제공
- Team detail 페이지의 탭 상태를 URL로 공유/북마크 가능
- Bottom nav에서 현재 탭 클릭 시 스마트한 동작 (scroll to top / stack reset)
- 모바일 앱과 유사한 직관적인 네비게이션 경험

**Non-Goals:**
- Team list 페이지(/team)의 탭 상태 URL 관리 (항상 "나의 팀" 기본값)
- 다른 feature(match, my 등)의 네비게이션 개선 (추후 확장 가능)
- 전역 네비게이션 상태 관리 (Zustand 등 도입하지 않음)
- 브라우저 히스토리 전체 재작성 (기존 push/replace 패턴 유지)

## Decisions

### 1. Safe Back Navigation: `useSafeBack` Hook

**Decision**: `window.history.state.idx`를 체크하여 히스토리 존재 여부 확인

```typescript
function useSafeBack(fallbackPath: string) {
  const router = useRouter();

  return useCallback(() => {
    const hasHistory = window.history.state?.idx > 0;

    if (hasHistory) {
      router.back();
    } else {
      router.replace(fallbackPath);
    }
  }, [router, fallbackPath]);
}
```

**Rationale:**
- Next.js App Router는 `window.history.state.idx`를 내부적으로 사용하여 히스토리 인덱스 추적
- `idx > 0`이면 최소 1번 이상 push된 상태 (back 가능)
- Fallback으로 `router.replace()` 사용 (히스토리에 추가하지 않음)

**Alternatives Considered:**
- ❌ `window.history.length` 체크: 다른 탭/창의 히스토리도 포함되어 부정확
- ❌ Custom history stack 관리: 복잡도 증가, Next.js와 충돌 가능성
- ❌ Referrer header 체크: 서버 컴포넌트에서만 가능, CSR에서 사용 불가

### 2. Team Detail Tab State: URL Query Params

**Decision**: `?view=home|schedule|members` query param 사용, `router.replace()`로 탭 전환

```typescript
const searchParams = useSearchParams();
const view = searchParams.get('view') || 'home';

const handleTabChange = (newView: string) => {
  const url = newView === 'home'
    ? `/team/${code}`
    : `/team/${code}?view=${newView}`;
  router.replace(url);
};
```

**Rationale:**
- URL에 상태를 저장하여 공유/북마크 가능
- `router.replace()` 사용으로 탭 전환 시 히스토리 오염 방지
- `view=home`은 생략 가능 (default)하여 URL 간결성 유지

**Alternatives Considered:**
- ❌ Client state only (현재): 공유 불가, 새로고침 시 초기화
- ❌ SessionStorage: 공유 불가, URL에 반영되지 않음
- ❌ Hash fragment (`#schedule`): Next.js App Router에서 권장하지 않음
- ❌ Separate routes (`/team/[code]/schedule`): 불필요한 routing 복잡도

### 3. Bottom Nav: Smart Pop on Same Tab Click

**Decision**: 현재 경로 체크하여 동작 분기

```typescript
const handleNavClick = (href: string) => {
  if (pathname === href) {
    // 같은 탭: scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    // 다른 탭: push
    router.push(href);
  }
};
```

**Rationale:**
- Instagram/Twitter 등 모바일 앱의 표준 UX 패턴
- 같은 탭 클릭 = "처음으로 돌아가기" 의도
- 히스토리 스택 초기화는 하지 않음 (UX 혼란 방지)

**Alternatives Considered:**
- ❌ 항상 replace: 뒤로가기 불가능해져 UX 저하
- ❌ History stack 완전 초기화: 복잡도 높고 예측 불가능한 동작
- ✅ **Hybrid approach (채택)**: 같은 탭이면 scroll, 다른 탭이면 push

### 4. Share Functionality: Web Share API with Clipboard Fallback

**Decision**: Web Share API 우선, 미지원 시 clipboard 사용

```typescript
const handleShare = async () => {
  const url = `${window.location.origin}/team/${code}?view=${currentView}`;

  if (navigator.share) {
    await navigator.share({ title: team.name, url });
  } else {
    await navigator.clipboard.writeText(url);
    toast.success('링크가 복사되었습니다');
  }
};
```

**Rationale:**
- 모바일에서 Web Share API는 네이티브 공유 시트 제공 (KakaoTalk, SMS 등)
- Desktop/미지원 브라우저에서는 clipboard fallback
- 현재 탭 상태(`?view=`)를 포함하여 정확한 상태 공유

**Alternatives Considered:**
- ❌ Clipboard만 사용: 모바일에서 UX 저하
- ❌ KakaoTalk SDK: 불필요한 외부 의존성
- ❌ QR Code: 복잡도 증가, 현재 요구사항 불명확

## Risks / Trade-offs

### [Risk] `window.history.state.idx`가 브라우저마다 다를 수 있음
**Mitigation**: Next.js가 공식적으로 사용하는 내부 구현이므로 일관성 보장됨. 혹시 변경되더라도 Next.js 업데이트 시 대응 가능.

### [Risk] Query param이 늘어나면 URL이 복잡해질 수 있음
**Mitigation**: 현재는 `view` 하나만 사용. 추후 필요하면 여러 param 조합 가능하지만, 현재 scope에서는 문제 없음.

### [Trade-off] Tab 전환 시 `router.replace()` 사용으로 히스토리 미생성
**Impact**: 탭 간 전환 후 뒤로가기하면 이전 페이지로 이동 (이전 탭이 아님). 하지만 이는 의도된 동작이며, 모바일 앱 UX와 일치.

### [Risk] 비멤버가 `?view=schedule` 접근 시 처리
**Mitigation**: TeamDetailView에서 `isMember` 체크 후 해당 탭을 렌더링하지 않으므로, 강제로 URL 입력해도 보이지 않음. 추가 validation 불필요.

### [Trade-off] Bottom Nav에서 scroll-to-top만 수행 (stack reset 없음)
**Impact**: 사용자가 깊이 들어간 페이지에서 빠져나오려면 여러 번 back 필요. 하지만 stack reset은 예측 불가능한 동작을 야기할 수 있어 현재 scope에서 제외.

## Migration Plan

**Rollout Strategy:**
1. Phase 1: `useSafeBack` hook 생성 및 team feature에 적용
2. Phase 2: Team detail tab URL sync 구현
3. Phase 3: Bottom nav smart behavior 적용
4. Phase 4: Share functionality 추가

**Rollback:**
- 각 phase는 독립적으로 동작하므로 개별 rollback 가능
- URL query param은 기존 코드와 호환 (없으면 default 동작)
- `useSafeBack`은 기존 `router.back()`과 동일한 signature

**Testing:**
- Deep link 시나리오 (카카오톡 공유 → 접근 → back)
- Tab 상태 공유 및 새로고침
- Bottom nav 중복 클릭 테스트
- 비멤버의 제한된 탭 접근 테스트

## Open Questions

None - 요구사항이 명확하고 기술적 결정이 완료됨.
