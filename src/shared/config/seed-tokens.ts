/**
 * Seed Design Token Configuration
 * Foundation CSS와 동일한 기준의 토큰 상수.
 * Source of truth는 CSS 변수이며, 이 파일은 코드 참조용이다.
 */

// Base palette
export const paletteColors = {
  carrot: {
    100: '#FFF2EC',
    200: '#FFD9C8',
    300: '#FFB999',
    400: '#FF905C',
    500: '#FF6F0F',
    600: '#E65200',
    700: '#FF6600',
    800: '#A53E00',
    900: '#8A3300',
    1000: '#702A00',
  },
} as const;

// Brand alias: draft -> carrot
export const draftColors = {
  draft: paletteColors.carrot,
} as const;

// Semantic Color Mapping
export const semanticColors = {
  primary: 'var(--color-fg-brand)',
  primaryForeground: 'var(--color-fg-neutral-inverted)',
} as const;

export const typographyTokens = {
  fontSize: {
    caption: 'var(--font-size-caption)',
    bodySm: 'var(--font-size-body-sm)',
    bodyMd: 'var(--font-size-body-md)',
    titleSm: 'var(--font-size-title-sm)',
    titleMd: 'var(--font-size-title-md)',
    titleLg: 'var(--font-size-title-lg)',
  },
  lineHeight: {
    caption: 'var(--line-height-caption)',
    bodySm: 'var(--line-height-body-sm)',
    bodyMd: 'var(--line-height-body-md)',
    titleSm: 'var(--line-height-title-sm)',
    titleMd: 'var(--line-height-title-md)',
    titleLg: 'var(--line-height-title-lg)',
  },
  weight: {
    regular: 'var(--typo-weight-regular)',
    medium: 'var(--typo-weight-medium)',
    semibold: 'var(--typo-weight-semibold)',
    bold: 'var(--typo-weight-bold)',
    extrabold: 'var(--typo-weight-extrabold)',
  },
} as const;

export const iconSizeTokens = {
  xs: 'var(--icon-size-xs)',
  sm: 'var(--icon-size-sm)',
  md: 'var(--icon-size-md)',
  lg: 'var(--icon-size-lg)',
  xl: 'var(--icon-size-xl)',
} as const;
