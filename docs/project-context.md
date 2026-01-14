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

### Core Vision (Why we exist)
**"누구나 편하게 농구를 접하고, 함께 땀 흘리는 세상"**

우리는 단순히 빈 자리를 채우는 것을 넘어, 농구라는 스포츠에 대한 **접근성을 낮춥니다**.
기존의 폐쇄적인 커뮤니티(BDR 카페, 밴드)를 넘어, **'게스트(용병)' 문화를 모르는 사람들도 직관적으로 경기에 참여**할 수 있게 만듭니다.

### Target Audience (Dual Target)

#### A. Host (공급자 - 최우선 타겟) 🎯
- **기존:** BDR 카페, 소모임 앱에서 수작업으로 글을 올리고 댓글/문자로 용병을 관리하던 팀 운영진
- **Pain Point:** "입금 확인했나요?", "자리 남았나요?" 반복되는 문의와 노쇼(No-Show) 관리의 피로감
- **Goal:** **"글 등록부터 확정까지 1분"** - 이들이 편해야 경기가 올라온다

#### B. Guest (수요자)
- **기존 농구인:** BDR 카페를 매일 새로고침하며 자리를 찾는 열정 동호인
- **잠재적 농구인:** 농구는 하고 싶지만 팀이 없고, 용병 구하는 법도 모르는 일반인
- **Goal:** **"비행기 예매하듯"** - 복잡한 등업이나 인사 없이 즉시 신청 가능

### Core Values
* **Speed** - 빠른 탐색 (지역/날짜/포지션 필터)
* **Trust** - 신뢰할 수 있는 정보 (경기 상세, 호스트 공지)
* **Convenience** - 쉬운 지원 (간편한 폼, 원클릭 지원)

## 2. Technology Stack

우리는 최신 웹 기술을 사용하여 **Native App 수준의 사용자 경험(UX)**을 제공하는 적응형 웹앱을 구축합니다.

* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript (Strict Mode)
* **Styling:** Tailwind CSS 4 + Shadcn UI (Customized)
    * **Global Theme:** Primary Color `#FF6600` (Orange)
    * **Layout:** **Mobile-First Fixed Width** (`max-w-[430px]`, `mx-auto`)
* **Icons:** Lucide React
* **State Management:** React Hooks + Server State (React Query / Phase 2)
* **Development Flow:**
    1.  **Figma First:** 피그마로 시각적 구조 확정
    2.  **Agent Coding:** Claude Code를 활용하여 코드 구현

→ **For detailed tech stack and phases**: See [ARCHITECTURE.md](ARCHITECTURE.md)

## 3. Design Philosophy & UX Rules (Visual Reference)
우리의 UI는 **'당근마켓(지역 기반)', '토스(간결함)', '플랩풋볼(매치 리스트)'**의 장점을 벤치마킹합니다.

## 4. MVP Scope & Goals (Current Phase)

### MVP Strategy: "Host First, Guest Easy"
우리의 1단계(MVP) 목표는 **'게스트 모집 시스템의 완성'**입니다.
하지만 게스트가 편하려면, 먼저 **호스트가 우리 앱을 써야 합니다.**

### ✅ MVP Core Focus (우선순위)

#### 1. Killer Feature for Host (관리 자동화) 🎯
- **복잡한 입력 없이** '날짜/시간/장소'만 찍으면 바로 모집 시작
- 신청자 목록에서 **[수락] / [거절]** 버튼 하나로 관리 끝
- 입금 확인 및 노쇼 관리의 자동화/간편화

**기술적 구현:**
* 간편한 경기 등록 폼 (최소 입력 필드)
* 신청자 관리 대시보드 (실시간 상태 업데이트)
* 자동 알림 시스템 (신청/수락/거절)

#### 2. Visual Discovery for Guest (탐색의 혁신)
- **타임라인 형태**의 직관적인 리스트 (시간 중심)
- "나도 할 수 있을까?"라는 장벽을 낮추는 **친절한 UI**
- 지역/날짜/포지션 필터로 빠른 탐색

**기술적 구현:**
* 홈 화면: 필터링 가능한 경기 목록 (지역/날짜/포지션)
* 경기 상세: 핵심 정보 요약 + 호스트 공지 + 지도
* 직관적인 상태 표시 (모집중/마감임박/마감)
* 간편한 지원 프로세스 (원클릭 신청)

### 📋 세부 기능 명세

#### Guest 화면
1.  **홈 (Match List):**
    * 지역/날짜/포지션 필터링 (포지션은 AND 조건: G+F 동시 구인 가능)
    * 날짜별 그룹핑 (오늘, 내일, 이번 주 등)
    * 실시간 모집 상태 표시
2.  **경기 상세 (Match Detail):**
    * 핵심 정보(시간, 장소, 비용, 주차여부) 요약
    * 호스트 공지사항 (Chat Bubble 스타일)
    * 지도 보기 (카카오맵 연동)
    * 지원하기 버튼 (로그인 후 활성화)

#### Host 화면
3.  **경기 개설 (Match Create):**
    * 간편한 폼 (날짜, 시간, 장소, 비용, 포지션)
    * 자동 주소 검색 (카카오맵 API)
    * 공지사항 작성 (선택)
4.  **신청자 관리 (Dashboard):**
    * 신청자 목록 (실시간 업데이트)
    * 수락/거절 원클릭 처리
    * 확정된 게스트 현황

## 5. Development Workflow

→ **For detailed workflow and architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md) and [CLAUDE.md](../CLAUDE.md)

→ **For Figma UI import**: See [FIGMA_TO_CODE.md](FIGMA_TO_CODE.md)

---

**Last Updated**: 2026-01-14
**Maintainer**: @beom