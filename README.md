# DRAFT - 농구 용병 모집 플랫폼

> 누구나 편하게 농구를 접하고, 함께 땀 흘리는 세상

**DRAFT**는 한국 아마추어 농구인들을 위한 게스트 모집 플랫폼입니다. 모바일 최적화된 적응형 웹앱(max-width: 430px)으로 네이티브 앱 수준의 사용자 경험을 제공합니다.

## 🎯 핵심 가치

- **Speed** - 빠른 탐색 (지역/날짜/포지션 필터)
- **Trust** - 신뢰할 수 있는 정보 (경기 상세, 호스트 공지)
- **Convenience** - 쉬운 지원 (간편한 폼, 원클릭 지원)

## 🚀 Quick Start

```bash
# Development
npm run dev          # Start dev server on http://localhost:3000

# Build & Production
npm run build        # Production build
npm start           # Start production server

# Linting
npm run lint        # Run ESLint
```

## 📚 문서

### 주요 문서
- **[CLAUDE.md](CLAUDE.md)** - Claude Code 개발 가이드 (Quick Reference)

### 상세 문서 (docs/)
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - 상세 아키텍처, 기술 스택, 확장 로드맵
- **[project-context.md](docs/project-context.md)** - 프로젝트 비전, MVP 범위, 타겟 사용자
- **[FIGMA_TO_CODE.md](docs/FIGMA_TO_CODE.md)** - Figma → Draft 변환 워크플로우
- **[CHANGELOG.md](docs/CHANGELOG.md)** - 최근 변경사항 및 마일스톤

## 🛠️ 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4 + Shadcn UI
- **Icons**: Lucide React
- **Form**: React Hook Form + Zod

## 🏗️ 아키텍처

Feature-Sliced Design 기반의 확장 가능한 구조:

```
src/
├── features/          # Feature modules (match, auth, user)
│   └── {feature}/
│       ├── ui/        # UI components
│       ├── api/       # API functions (Phase 2)
│       ├── model/     # Types & schemas
│       └── lib/       # Helper functions
├── shared/            # Global resources
├── widgets/           # Layout components
└── components/
    ├── ui/            # shadcn/ui components
    └── registry/      # Figma-imported components
```

## 📱 주요 기능 (MVP)

### Guest (게스트)
- 경기 목록 조회 및 필터링 (지역/날짜/포지션)
- 경기 상세 정보 확인
- 원클릭 경기 신청

### Host (호스트)
- 간편한 경기 생성 (날짜/시간/장소)
- 신청자 관리 대시보드
- 수락/거절 원클릭 처리

## 🎨 Design System

- **Primary Color**: `#FF6600` (Orange)
- **Layout**: Mobile-First (`max-w-[430px]`)
- **Typography**: Pretendard

## 📄 License

© 2026 Draft. All rights reserved.

---

**Last Updated**: 2026-01-14
**Maintainer**: @beom
