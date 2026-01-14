export const MATCH_TYPE_OPTIONS = [
  { value: '5vs5', label: '5vs5' },
  { value: '3vs3', label: '3vs3' }
] as const;

export const GENDER_OPTIONS = [
  { value: 'men', label: '남성' },
  { value: 'women', label: '여성' },
  { value: 'mixed', label: '성별 무관' }
] as const;

export const LEVEL_OPTIONS = [
  { value: 'low', label: '초보', color: '#22C55E' },
  { value: 'middle', label: '중급', color: '#EAB308' },
  { value: 'high', label: '상급', color: '#FF6600' },
  { value: 'pro', label: '프로', color: '#EF4444' }
] as const;

export const AGE_OPTIONS = [
  { value: '20', label: '20대' },
  { value: '30', label: '30대' },
  { value: '40', label: '40대' },
  { value: '50', label: '50대' },
  { value: '60', label: '60대' },
  { value: '70', label: '70대' }
] as const;

export const GAME_FORMAT_OPTIONS = [
  { value: 'internal_2', label: '자체전(2파전)' },
  { value: 'internal_3', label: '자체전(3파전)' },
  { value: 'exchange', label: '팀 교류전' },
  { value: 'practice', label: '연습/레슨' }
] as const;

export const REFEREE_OPTIONS = [
  { value: 'self', label: '자체콜' },
  { value: 'member', label: '게스트/팀원' },
  { value: 'pro', label: '전문 심판' }
] as const;

export const SHOWER_OPTIONS = [
  { value: 'free', label: '무료' },
  { value: 'paid', label: '유료' }
] as const;

export const COURT_SIZE_OPTIONS = [
  { value: 'regular', label: '정규 사이즈', description: '표준 코트입니다' },
  { value: 'short', label: '세로가 좀 짧아요', description: '정규보다 짧습니다' },
  { value: 'narrow', label: '가로가 좀 좁아요', description: '정규보다 좁습니다' }
] as const;
