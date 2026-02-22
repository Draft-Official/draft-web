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
