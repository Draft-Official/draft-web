/**
 * Seed Design Token Configuration
 * Draft 브랜드 컬러로 커스터마이징된 Seed Design 토큰
 */

// Draft Brand Colors (replacing Carrot)
export const draftColors = {
  draft: {
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

// Semantic Color Mapping
export const semanticColors = {
  primary: 'var(--color-palette-draft-600)',
  primaryForeground: 'var(--color-fg-neutral-inverted)',
} as const;
