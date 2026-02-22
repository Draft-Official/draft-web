/**
 * Seed-style token reference map used in this project.
 * Keys follow the "$category..." format from the design-token reference docs.
 */

const colorTokenReference = {
  '$color.fg.brand': { cssVar: '--color-fg-brand' },
  '$color.fg.brand-contrast': { cssVar: '--color-fg-brand-contrast' },
  '$color.fg.neutral': { cssVar: '--color-fg-neutral' },
  '$color.fg.neutral-muted': { cssVar: '--color-fg-neutral-muted' },
  '$color.fg.neutral-subtle': { cssVar: '--color-fg-neutral-subtle' },
  '$color.fg.neutral-inverted': { cssVar: '--color-fg-neutral-inverted' },
  '$color.fg.disabled': { cssVar: '--color-fg-disabled' },
  '$color.fg.placeholder': { cssVar: '--color-fg-placeholder' },
  '$color.fg.critical': { cssVar: '--color-fg-critical' },
  '$color.fg.critical-contrast': { cssVar: '--color-fg-critical-contrast' },
  '$color.fg.warning': { cssVar: '--color-fg-warning' },
  '$color.fg.warning-contrast': { cssVar: '--color-fg-warning-contrast' },
  '$color.fg.informative': { cssVar: '--color-fg-informative' },
  '$color.fg.informative-contrast': { cssVar: '--color-fg-informative-contrast' },
  '$color.fg.positive': { cssVar: '--color-fg-positive' },
  '$color.fg.positive-contrast': { cssVar: '--color-fg-positive-contrast' },
  '$color.fg.kakao': { cssVar: '--color-fg-kakao' },
  '$color.fg.ink': { cssVar: '--color-fg-ink' },

  '$color.bg.brand-solid': { cssVar: '--color-bg-brand-solid' },
  '$color.bg.brand-solid-pressed': { cssVar: '--color-bg-brand-solid-pressed' },
  '$color.bg.brand-weak': { cssVar: '--color-bg-brand-weak' },
  '$color.bg.brand-weak-pressed': { cssVar: '--color-bg-brand-weak-pressed' },
  '$color.bg.layer-basement': { cssVar: '--color-bg-layer-basement' },
  '$color.bg.layer-default': { cssVar: '--color-bg-layer-default' },
  '$color.bg.layer-default-pressed': { cssVar: '--color-bg-layer-default-pressed' },
  '$color.bg.layer-fill': { cssVar: '--color-bg-layer-fill' },
  '$color.bg.layer-floating': { cssVar: '--color-bg-layer-floating' },
  '$color.bg.layer-floating-pressed': { cssVar: '--color-bg-layer-floating-pressed' },
  '$color.bg.app-root': { cssVar: '--color-bg-app-root' },
  '$color.bg.neutral-solid': { cssVar: '--color-bg-neutral-solid' },
  '$color.bg.neutral-solid-muted': { cssVar: '--color-bg-neutral-solid-muted' },
  '$color.bg.neutral-solid-muted-pressed': { cssVar: '--color-bg-neutral-solid-muted-pressed' },
  '$color.bg.neutral-inverted': { cssVar: '--color-bg-neutral-inverted' },
  '$color.bg.neutral-inverted-pressed': { cssVar: '--color-bg-neutral-inverted-pressed' },
  '$color.bg.neutral-weak': { cssVar: '--color-bg-neutral-weak' },
  '$color.bg.neutral-weak-pressed': { cssVar: '--color-bg-neutral-weak-pressed' },
  '$color.bg.neutral-weak-alpha': { cssVar: '--color-bg-neutral-weak-alpha' },
  '$color.bg.neutral-weak-alpha-pressed': { cssVar: '--color-bg-neutral-weak-alpha-pressed' },
  '$color.bg.critical-solid': { cssVar: '--color-bg-critical-solid' },
  '$color.bg.critical-solid-pressed': { cssVar: '--color-bg-critical-solid-pressed' },
  '$color.bg.critical-weak': { cssVar: '--color-bg-critical-weak' },
  '$color.bg.critical-weak-pressed': { cssVar: '--color-bg-critical-weak-pressed' },
  '$color.bg.warning-solid': { cssVar: '--color-bg-warning-solid' },
  '$color.bg.warning-solid-pressed': { cssVar: '--color-bg-warning-solid-pressed' },
  '$color.bg.warning-weak': { cssVar: '--color-bg-warning-weak' },
  '$color.bg.warning-weak-pressed': { cssVar: '--color-bg-warning-weak-pressed' },
  '$color.bg.informative-solid': { cssVar: '--color-bg-informative-solid' },
  '$color.bg.informative-solid-pressed': { cssVar: '--color-bg-informative-solid-pressed' },
  '$color.bg.informative-weak': { cssVar: '--color-bg-informative-weak' },
  '$color.bg.informative-weak-pressed': { cssVar: '--color-bg-informative-weak-pressed' },
  '$color.bg.positive-solid': { cssVar: '--color-bg-positive-solid' },
  '$color.bg.positive-solid-pressed': { cssVar: '--color-bg-positive-solid-pressed' },
  '$color.bg.positive-weak': { cssVar: '--color-bg-positive-weak' },
  '$color.bg.positive-weak-pressed': { cssVar: '--color-bg-positive-weak-pressed' },
  '$color.bg.disabled': { cssVar: '--color-bg-disabled' },
  '$color.bg.overlay': { cssVar: '--color-bg-overlay' },
  '$color.bg.overlay-muted': { cssVar: '--color-bg-overlay-muted' },
  '$color.bg.transparent': { cssVar: '--color-bg-transparent' },
  '$color.bg.transparent-pressed': { cssVar: '--color-bg-transparent-pressed' },
  '$color.bg.magic-weak': { cssVar: '--color-bg-magic-weak' },
  '$color.bg.kakao': { cssVar: '--color-bg-kakao' },

  '$color.stroke.brand-solid': { cssVar: '--color-stroke-brand-solid' },
  '$color.stroke.brand-weak': { cssVar: '--color-stroke-brand-weak' },
  '$color.stroke.neutral-contrast': { cssVar: '--color-stroke-neutral-contrast' },
  '$color.stroke.neutral-muted': { cssVar: '--color-stroke-neutral-muted' },
  '$color.stroke.neutral-solid': { cssVar: '--color-stroke-neutral-solid' },
  '$color.stroke.neutral-subtle': { cssVar: '--color-stroke-neutral-subtle' },
  '$color.stroke.neutral-weak': { cssVar: '--color-stroke-neutral-weak' },
  '$color.stroke.critical': { cssVar: '--color-stroke-critical' },
  '$color.stroke.critical-solid': { cssVar: '--color-stroke-critical-solid' },
  '$color.stroke.critical-weak': { cssVar: '--color-stroke-critical-weak' },
  '$color.stroke.warning': { cssVar: '--color-stroke-warning' },
  '$color.stroke.warning-solid': { cssVar: '--color-stroke-warning-solid' },
  '$color.stroke.warning-weak': { cssVar: '--color-stroke-warning-weak' },
  '$color.stroke.informative': { cssVar: '--color-stroke-informative' },
  '$color.stroke.informative-solid': { cssVar: '--color-stroke-informative-solid' },
  '$color.stroke.informative-weak': { cssVar: '--color-stroke-informative-weak' },
  '$color.stroke.positive': { cssVar: '--color-stroke-positive' },
  '$color.stroke.positive-solid': { cssVar: '--color-stroke-positive-solid' },
  '$color.stroke.positive-weak': { cssVar: '--color-stroke-positive-weak' },
} as const;

const dimensionTokenReference = {
  '$dimension.x1_5': { cssVar: '--dimension-x1_5', value: '6px' },
  '$dimension.x2': { cssVar: '--dimension-x2', value: '8px' },
  '$dimension.x3': { cssVar: '--dimension-x3', value: '12px' },
  '$dimension.x4': { cssVar: '--dimension-x4', value: '16px' },
  '$dimension.x5': { cssVar: '--dimension-x5', value: '20px' },
  '$dimension.x14': { cssVar: '--dimension-x14', value: '56px' },
  '$dimension.spacing-x.between-chips': {
    cssVar: '--dimension-spacing-x-between-chips',
    aliasOf: '$dimension.x2',
  },
  '$dimension.spacing-x.global-gutter': {
    cssVar: '--dimension-spacing-x-global-gutter',
    aliasOf: '$dimension.x4',
  },
  '$dimension.spacing-y.component-default': {
    cssVar: '--dimension-spacing-y-component-default',
    aliasOf: '$dimension.x3',
  },
  '$dimension.spacing-y.nav-to-title': {
    cssVar: '--dimension-spacing-y-nav-to-title',
    aliasOf: '$dimension.x5',
  },
  '$dimension.spacing-y.screen-bottom': {
    cssVar: '--dimension-spacing-y-screen-bottom',
    aliasOf: '$dimension.x14',
  },
  '$dimension.spacing-y.between-text': {
    cssVar: '--dimension-spacing-y-between-text',
    aliasOf: '$dimension.x1_5',
  },
} as const;

export const tokenReference = {
  ...colorTokenReference,
  ...dimensionTokenReference,
} as const;

export type TokenReferenceKey = keyof typeof tokenReference;

export const resolveTokenVar = (token: TokenReferenceKey): string => `var(${tokenReference[token].cssVar})`;

/**
 * Explicit usage scenarios.
 * If a token is missing here, `resolveTokenUsage` falls back to rule-based guidance.
 */
export const tokenUsageReference: Partial<Record<TokenReferenceKey, string>> = {
  '$color.bg.positive-solid-pressed': '성공/확인/긍정 상태 요소의 pressed(눌림) 배경',
  '$color.bg.positive-solid': '성공/완료 상태의 기본 강조 배경',
  '$color.bg.warning-solid': '주의/경고 상태의 기본 강조 배경',
  '$color.bg.critical-solid': '오류/위험 상태의 기본 강조 배경',
  '$color.bg.brand-solid': '브랜드 CTA, 핵심 액션 배경',
  '$color.fg.neutral': '기본 본문 텍스트/아이콘',
  '$color.fg.neutral-muted': '보조 텍스트/보조 아이콘',
  '$color.stroke.neutral-weak': '일반 카드/필드의 기본 경계선',
  '$color.stroke.neutral-subtle': '아주 약한 구분선',
  '$dimension.spacing-x.between-chips': 'Chip 사이 수평 간격',
  '$dimension.spacing-x.global-gutter': '화면 기본 좌우 패딩',
  '$dimension.spacing-y.component-default': '컴포넌트 블록 간 기본 세로 간격',
  '$dimension.spacing-y.nav-to-title': 'Top Navigation과 Page Title 사이 간격',
  '$dimension.spacing-y.screen-bottom': '화면 하단 안전 여백',
  '$dimension.spacing-y.between-text': '텍스트 줄/라벨 사이 세로 간격',
};

export const resolveTokenUsage = (token: TokenReferenceKey): string => {
  const explicit = tokenUsageReference[token];
  if (explicit) return explicit;

  if (token.startsWith('$color.fg.')) {
    if (token.endsWith('-contrast')) return '강조된 배경 위 텍스트/아이콘 대비용 전경색';
    if (token.endsWith('-inverted')) return '반전 테마(어두운 배경)에서의 전경색';
    return '텍스트/아이콘 전경색에 사용';
  }

  if (token.startsWith('$color.bg.')) {
    if (token.endsWith('-pressed')) return '사용자 press(눌림) 인터랙션 상태 배경';
    if (token.includes('-weak')) return '약한 강조/서브 배경';
    if (token.includes('overlay')) return '모달/시트 뒤 오버레이 배경';
    return '컴포넌트/레이어 배경에 사용';
  }

  if (token.startsWith('$color.stroke.')) {
    if (token.includes('-weak')) return '약한 보더/구분선';
    if (token.includes('-solid')) return '강한 보더/강조 외곽선';
    return '보더/구분선/윤곽선에 사용';
  }

  if (token.startsWith('$dimension.spacing-x.')) return '수평 간격 규칙에 사용';
  if (token.startsWith('$dimension.spacing-y.')) return '수직 간격 규칙에 사용';
  if (token.startsWith('$dimension.x')) return '기본 spacing scale 단위값';

  return '해당 의미의 semantic token으로 사용';
};
