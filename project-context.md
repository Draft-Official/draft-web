This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---
# Project Context: DRAFT (Basketball Guest Recruiting Platform)

## 1. Project Identity & Vision
**"DRAFT"**는 대한민국 아마추어 농구인들을 위한 **가장 빠르고 직관적인 게스트(용병) 모집 플랫폼**입니다.
기존의 파편화된 커뮤니티(Bdr 카페, 밴드)의 비효율을 해결하고, "비행기 티켓을 예매하듯" 쉽고 빠르게 경기에 참여할 수 있는 경험을 제공합니다.

* **Target:** 2030 농구 동호인 (게스트) & 팀 운영진 (호스트).
* **Core Value:** Speed (빠른 탐색), Trust (신뢰할 수 있는 정보), Convenience (쉬운 지원).

## 2. Technology Stack & Architecture
우리는 최신 웹 기술을 사용하여 **Native App 수준의 사용자 경험(UX)**을 제공하는 적응형 웹앱을 구축합니다.

* **Framework:** Next.js 14 (App Router)
* **Language:** TypeScript (Strict Mode)
* **Styling:** Tailwind CSS + Shadcn UI (Customized)
    * **Global Theme:** Primary Color `#FF6600` (Orange).
    * **Layout:** **Mobile-First Fixed Width** (`max-w-[430px]`, `mx-auto`). PC에서는 웹 / 폰에서는  모바일 앱 뷰로 만듭니다 -> 적응형으로 만듬
* **Icons:** Lucide React
* **State Management:** React Hooks + Server State (React Query / RSC Pattern)
* **Development Flow:**
    1.  **Figma First:** 피그마(또는 AI 이미지)로 시각적 구조 확정.
    2.  **Agent Coding:** `.claude/` 폴더의 Claude Sub-agents를 활용하여 코드 구현.

## 3. Design Philosophy & UX Rules (Visual Reference)
우리의 UI는 **'당근마켓(지역 기반)', '토스(간결함)', '플랩풋볼(매치 리스트)'**의 장점을 벤치마킹합니다.

## 4. MVP Scope & Goals (Current Phase)
우리의 1차 목표는 **"게스트 모집과 지원의 완결성"**을 검증하는 것입니다.

### ✅ MVP 기능 (우선순위 높음)
1.  **홈 (Guest Match List):**
    * 지역/날짜/포지션 필터링 (포지션은 AND 조건: G+F 동시 구인 가능).
    * 직관적인 상태 표시 (모집중/마감임박/마감).
2.  **경기 상세 (Match Detail):**
    * 핵심 정보(시간, 장소, 비용, 주차여부) 요약.
    * 호스트 공지사항(Chat Bubble 스타일).
    * 지도 보기.
3.  **호스트 기능:**
    * 간편한 경기 등록 (Form).
    * 신청자 관리 대시보드 (수락/거절).

## 5. Development Workflow (with Agents)

1.  **Planning:** `pipeline-designer` 에이전트로 구현 설계를 먼저 진행합니다.
2.  **Tooling:** 반복 작업은 `agent-creator`로 전용 에이전트를 만들어 처리합니다.
3.  **Implementation:** `feature-implementor`가 실제 코드를 작성하며, 항상 `project-context.md`의 규칙(모바일 퍼스트, 테일윈드 등)을 준수합니다.