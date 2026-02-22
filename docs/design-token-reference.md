# Design Token Reference

Seed Design 스타일의 `$token.path`를 프로젝트 CSS 변수로 매핑한 참조 문서입니다.

전체 매핑 소스:
- `src/shared/config/token-reference.ts`
- 사용 상황 조회 함수:
  - `resolveTokenUsage('$color.bg.positive-solid-pressed')`

## Color FG

| Seed Token | CSS Variable |
| --- | --- |
| `$color.fg.brand` | `--color-fg-brand` |
| `$color.fg.brand-contrast` | `--color-fg-brand-contrast` |
| `$color.fg.neutral` | `--color-fg-neutral` |
| `$color.fg.neutral-muted` | `--color-fg-neutral-muted` |
| `$color.fg.neutral-subtle` | `--color-fg-neutral-subtle` |
| `$color.fg.neutral-inverted` | `--color-fg-neutral-inverted` |
| `$color.fg.disabled` | `--color-fg-disabled` |
| `$color.fg.placeholder` | `--color-fg-placeholder` |
| `$color.fg.critical` | `--color-fg-critical` |
| `$color.fg.critical-contrast` | `--color-fg-critical-contrast` |
| `$color.fg.warning` | `--color-fg-warning` |
| `$color.fg.warning-contrast` | `--color-fg-warning-contrast` |
| `$color.fg.informative` | `--color-fg-informative` |
| `$color.fg.informative-contrast` | `--color-fg-informative-contrast` |
| `$color.fg.positive` | `--color-fg-positive` |
| `$color.fg.positive-contrast` | `--color-fg-positive-contrast` |

## Color BG

| Seed Token | CSS Variable |
| --- | --- |
| `$color.bg.brand-solid` | `--color-bg-brand-solid` |
| `$color.bg.brand-solid-pressed` | `--color-bg-brand-solid-pressed` |
| `$color.bg.brand-weak` | `--color-bg-brand-weak` |
| `$color.bg.brand-weak-pressed` | `--color-bg-brand-weak-pressed` |
| `$color.bg.layer-default` | `--color-bg-layer-default` |
| `$color.bg.layer-default-pressed` | `--color-bg-layer-default-pressed` |
| `$color.bg.layer-fill` | `--color-bg-layer-fill` |
| `$color.bg.layer-floating` | `--color-bg-layer-floating` |
| `$color.bg.neutral-solid` | `--color-bg-neutral-solid` |
| `$color.bg.neutral-weak` | `--color-bg-neutral-weak` |
| `$color.bg.critical-solid` | `--color-bg-critical-solid` |
| `$color.bg.critical-solid-pressed` | `--color-bg-critical-solid-pressed` |
| `$color.bg.warning-solid` | `--color-bg-warning-solid` |
| `$color.bg.informative-solid` | `--color-bg-informative-solid` |
| `$color.bg.positive-solid` | `--color-bg-positive-solid` |
| `$color.bg.positive-solid-pressed` | `--color-bg-positive-solid-pressed` |
| `$color.bg.disabled` | `--color-bg-disabled` |
| `$color.bg.overlay` | `--color-bg-overlay` |
| `$color.bg.transparent` | `--color-bg-transparent` |

## Color Stroke

| Seed Token | CSS Variable |
| --- | --- |
| `$color.stroke.brand-solid` | `--color-stroke-brand-solid` |
| `$color.stroke.brand-weak` | `--color-stroke-brand-weak` |
| `$color.stroke.neutral-contrast` | `--color-stroke-neutral-contrast` |
| `$color.stroke.neutral-muted` | `--color-stroke-neutral-muted` |
| `$color.stroke.neutral-solid` | `--color-stroke-neutral-solid` |
| `$color.stroke.neutral-subtle` | `--color-stroke-neutral-subtle` |
| `$color.stroke.neutral-weak` | `--color-stroke-neutral-weak` |
| `$color.stroke.critical-solid` | `--color-stroke-critical-solid` |
| `$color.stroke.warning-solid` | `--color-stroke-warning-solid` |
| `$color.stroke.informative-solid` | `--color-stroke-informative-solid` |
| `$color.stroke.positive-solid` | `--color-stroke-positive-solid` |

## Dimension Scale

| Seed Token | CSS Variable | Value |
| --- | --- | --- |
| `$dimension.x1_5` | `--dimension-x1_5` | `6px` |
| `$dimension.x2` | `--dimension-x2` | `8px` |
| `$dimension.x3` | `--dimension-x3` | `12px` |
| `$dimension.x4` | `--dimension-x4` | `16px` |
| `$dimension.x5` | `--dimension-x5` | `20px` |
| `$dimension.x14` | `--dimension-x14` | `56px` |

## Semantic Spacing

| Seed Token | CSS Variable | Alias |
| --- | --- | --- |
| `$dimension.spacing-x.between-chips` | `--dimension-spacing-x-between-chips` | `$dimension.x2` |
| `$dimension.spacing-x.global-gutter` | `--dimension-spacing-x-global-gutter` | `$dimension.x4` |
| `$dimension.spacing-y.component-default` | `--dimension-spacing-y-component-default` | `$dimension.x3` |
| `$dimension.spacing-y.nav-to-title` | `--dimension-spacing-y-nav-to-title` | `$dimension.x5` |
| `$dimension.spacing-y.screen-bottom` | `--dimension-spacing-y-screen-bottom` | `$dimension.x14` |
| `$dimension.spacing-y.between-text` | `--dimension-spacing-y-between-text` | `$dimension.x1_5` |

## Usage

```tsx
import { resolveTokenVar, resolveTokenUsage } from '@/shared/config/token-reference';

const bg = resolveTokenVar('$color.bg.positive-solid-pressed');
// bg === "var(--color-bg-positive-solid-pressed)"

const when = resolveTokenUsage('$color.bg.positive-solid-pressed');
// when === "성공/확인/긍정 상태 요소의 pressed(눌림) 배경"
```
