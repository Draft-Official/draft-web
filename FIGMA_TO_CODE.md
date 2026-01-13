# Figma UI를 Draft 프로젝트에 적용하는 방법

## 📋 개요

이 문서는 Figma Make로 생성한 UI 코드를 Draft 프로젝트 아키텍처에 맞게 적용하는 방법을 설명합니다.

## 🎯 전제 조건

1. Figma Design이 완성되어 있어야 함
2. Figma Make를 통해 React 코드를 생성했거나 GitHub에 푸시했어야 함
3. Draft 프로젝트의 아키텍처 구조를 이해하고 있어야 함

## 🚀 단계별 가이드

### 1단계: Figma Make 코드 준비

#### 옵션 A: GitHub에 푸시한 경우
```
GitHub 링크를 준비합니다.
예: https://github.com/beom84/Creatematchform
```

#### 옵션 B: 로컬에 코드가 있는 경우
```bash
# Figma Make 코드가 있는 위치
/path/to/figma-make-project/src/pages/YourComponent.tsx
```

### 2단계: Claude Code에 명령하기

다음과 같은 형식으로 명령합니다:

```
안녕 클로드야.
https://github.com/beom84/Creatematchform 이 깃허브 링크는
내가 피그마 메이크를 통해 만든 코드를 push한 파일이야.

내가 보내는 사진과 코드를 통해서 우리의 프로젝트에
UI가 그대로 적용되도록 만들어줘.

너가 똑같이 만들어야 하는 화면은 [화면 이름]이야.
우리 프로젝트의 아키텍처에 맞춰서 만들어봐.
애매한 점이 있다면 물어보고 결정해.
```

### 3단계: Claude가 수행할 작업

Claude는 다음 순서로 작업을 진행합니다:

#### 3.1 코드 분석
- Figma Make 코드 구조 파악
- 사용된 컴포넌트 목록 확인
- 필요한 타입 및 데이터 구조 파악

#### 3.2 프로젝트 아키텍처 매핑
```
Figma Code                 →  Draft Architecture
────────────────────────────────────────────────
src/pages/Component.tsx    →  src/features/[feature]/ui/component-view.tsx
Mock Data                  →  src/features/[feature]/model/mock-data.ts
Types                      →  src/features/[feature]/model/types.ts
UI Components              →  src/components/ui/[component].tsx
```

#### 3.3 필요한 컴포넌트 확인 및 생성
Claude가 자동으로:
- 누락된 shadcn/ui 컴포넌트 확인 (Card, Avatar, Tabs 등)
- 필요한 컴포넌트 자동 생성
- 올바른 import 경로로 수정

#### 3.4 코드 변환
- Figma Make 코드를 Draft 구조에 맞게 변환
- 라우터 변경: `react-router-dom` → `next/navigation`
- 스타일 조정: Figma 스타일 → Tailwind CSS
- 타입 정의 분리

#### 3.5 빌드 및 테스트
- TypeScript 컴파일 확인
- 빌드 성공 여부 확인
- 404 오류 등 라우팅 문제 해결

#### 3.6 컴포넌트 분리 (리팩토링)
- **규칙**: 파일 길이가 300줄을 초과하면 즉시 하위 컴포넌트로 분리합니다.
- **분리 기준**: 도메인 의미 단위 (예: `BasicInfo`, `Facilities`, `Recruitment`)
- `useFormContext` 등을 활용해 Props Drilling을 최소화합니다.

## 4. 구현 원칙 (Implementation Principles)
**CRITICAL**: 다음 규칙을 위반하는 코드는 생성을 금지합니다.

### 4.1 Config-Driven UI 패턴 (반복 요소 제거)
- **규칙**: 리스트, 칩, 라디오 버튼 등 반복되는 UI 요소는 절대 하드코딩하지 않습니다.
- **방식**: 
  1. `config/constants.ts` (또는 해당 파일 상단)에 `const` 배열로 데이터를 정의합니다.
  2. 공통 컴포넌트(`OptionChip` 등)를 만들고 `.map()`으로 렌더링합니다.
- **Why**: 수정 시 UI 코드를 건드리지 않고 `constant` 데이터만 수정하여 유지보수성을 극대화합니다.

### 4.2 State Management (Props Drilling 방지)
- **규칙**: Form 관련 상태는 `useFormContext`를 사용하여 하위 컴포넌트에서 직접 접근합니다.
- 부모에서 `register`나 `control`을 Props로 3단계 이상 내려보내지 않습니다.

## 📝 실제 예시: Host Dashboard 구현

### 요청 메시지
```
안녕 클로드야.
https://github.com/beom84/Creatematchform
이 깃허브링크는 내가 피그마 메이크를 통해 만든 코드를 push한 파일이야.
내가 보내는 사진과 코드를 통해서 우리의 프로젝트에 ui가 그대로 적용되도록 만들어줘.

너가 똑같이 만들어야 하는 화면은 host Dashboard 화면이야.
우리 프로젝트의 아키텍처에 맞춰서 만들어봐.
애매한 점이 있다면 물어보고 결정해.
```

### Claude가 생성한 파일들

#### 1. UI 컴포넌트 추가
```
src/components/ui/
├── card.tsx          ✅ 새로 생성
├── avatar.tsx        ✅ 새로 생성
├── tabs.tsx          ✅ 새로 생성
└── switch.tsx        ✅ 새로 생성
```

#### 2. Feature 구조 생성
```
src/features/host/
├── model/
│   ├── types.ts          ✅ 타입 정의
│   └── mock-data.ts      ✅ Mock 데이터
└── ui/
    └── host-dashboard-view.tsx  ✅ 메인 컴포넌트
```

#### 3. 페이지 연결
```typescript
// app/host/dashboard/page.tsx
'use client';

import { HostDashboardView } from '@/features/host/ui/host-dashboard-view';

export default function HostDashboardPage() {
  return <HostDashboardView />;
}
```

### 결과물

#### 변환 전 (Figma Make)
```typescript
// src/pages/HostDashboard.tsx
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner@2.0.3';

export const HostDashboard = () => {
  const navigate = useNavigate();
  // ...
}
```

#### 변환 후 (Draft)
```typescript
// src/features/host/ui/host-dashboard-view.tsx
'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { Match } from '../model/types';
import { MOCK_MATCHES } from '../model/mock-data';

export function HostDashboardView() {
  const router = useRouter();
  // ...
}
```

## ✅ 체크리스트

작업 완료 후 다음을 확인하세요:

### 필수 확인 사항
- [ ] `npm run build` 성공
- [ ] TypeScript 에러 없음
- [ ] 해당 페이지 접속 시 404 오류 없음
- [ ] UI가 Figma 디자인과 일치함

### 아키텍처 확인
- [ ] Feature-Sliced Design 구조 준수
- [ ] 타입이 `model/types.ts`에 정의됨
- [ ] Mock 데이터가 `model/mock-data.ts`에 분리됨
- [ ] UI 컴포넌트가 `ui/` 폴더에 위치함
- [ ] 페이지 파일이 `app/` 디렉토리에만 존재함

### 코드 품질
- [ ] Import 경로가 `@/` alias 사용
- [ ] 'use client' 지시문이 필요한 곳에 추가됨
- [ ] Tailwind CSS 스타일 적용
- [ ] 모바일 퍼스트 디자인 (max-w-[760px])

## 🔧 자주 발생하는 문제 해결

### 1. 404 오류 발생
```
원인: 페이지 파일(page.tsx)이 없음
해결: app/ 디렉토리에 올바른 경로로 page.tsx 생성
```

### 2. UI 컴포넌트 Import 오류
```
원인: shadcn/ui 컴포넌트가 없음
해결: Claude에게 "누락된 UI 컴포넌트를 추가해줘" 요청
```

### 3. TypeScript 타입 오류
```
원인: Figma Make 코드의 타입이 명확하지 않음
해결: Claude가 자동으로 타입 추론 및 정의
```

### 4. 라우터 오류
```
원인: react-router-dom → next/navigation 변환 누락
해결: Claude가 자동으로 변환 처리
```

## 📚 추가 참고 자료

- [CLAUDE.md](CLAUDE.md) - 프로젝트 전체 가이드
- [ARCHITECTURE.md](ARCHITECTURE.md) - 아키텍처 상세 설명
- [project-context.md](project-context.md) - 프로젝트 비전 및 MVP 범위

## 💡 팁

### 명확한 요청 방법
```
✅ 좋은 예:
"HostDashboard 화면을 Figma 코드와 똑같이 구현해줘"
"신청자 관리 모달의 Traffic Light 버튼 상태 변경 기능 추가"

❌ 나쁜 예:
"화면 만들어줘"
"대충 비슷하게"
```

### 단계적 접근
1. 먼저 기본 레이아웃 구현
2. 세부 컴포넌트 추가
3. 인터랙션 기능 추가
4. 스타일 미세 조정

### Claude와 협업
- 애매한 부분은 질문하도록 유도
- 여러 옵션이 있다면 선택하도록 함
- 결과물을 확인하고 피드백 제공

## 🎓 학습 자료

### Figma → Draft 매핑 패턴

| Figma 요소 | Draft 구현 |
|-----------|----------|
| Frame/Container | `<div className="...">` |
| Auto Layout | Flexbox/Grid with Tailwind |
| Colors | Tailwind color classes |
| Typography | Tailwind text utilities |
| Components | React Components |
| Variants | Conditional rendering |

### 코드 스타일 가이드

```typescript
// ✅ Draft 스타일
export function ComponentName() {
  // 'use client' if needed
  const router = useRouter();

  return (
    <div className="bg-white p-4">
      {/* Component content */}
    </div>
  );
}

// ❌ Figma Make 스타일 (변환 필요)
export const ComponentName = () => {
  const navigate = useNavigate();

  return (
    <div style={{background: 'white', padding: '16px'}}>
      {/* Component content */}
    </div>
  );
}
```

## 📞 문제 발생 시

1. **먼저 확인**: 빌드 및 타입 에러 확인
2. **Claude에게 보고**: "404 에러가 발생했어" 등 구체적으로 설명
3. **문서 참조**: CLAUDE.md, ARCHITECTURE.md 확인
4. **재시도**: Claude가 자동으로 문제 파악 및 해결

---

**마지막 업데이트**: 2026-01-08
**작성자**: Claude Code + @beom
**프로젝트**: DRAFT - 농구 용병 모집 플랫폼
