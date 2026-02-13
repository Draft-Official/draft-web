/**
 * Seed Design Token Configuration
 * Draft 브랜드 컬러로 커스터마이징된 Seed Design 토큰
 */

// Draft Brand Colors (replacing Carrot)
export const draftColors = {
  draft: {
    50: '#FFF5EB',
    100: '#FFE5CC',
    200: '#FFCC99',
    300: '#FFB366',
    400: '#FF9933',
    500: '#FF6600',  // Primary Brand Color
    600: '#E65C00',
    700: '#CC5200',
    800: '#B34700',
    900: '#993D00',
  },
} as const;

// Semantic Color Mapping
export const semanticColors = {
  primary: 'var(--seed-scale-color-draft-500)',
  primaryForeground: 'var(--seed-scale-color-gray-00)',
} as const;
