export interface SkillLevel {
  level: number;
  name: string;
  description: string;
  color: string;
}

export const SKILL_LEVELS: SkillLevel[] = [
  { level: 1, name: '초보1', description: '드리블 슛 등 기초 기술을 익히는 단계입니다.', color: '#22C55E' },
  { level: 2, name: '초보2', description: '이제 정식 5대5 경기에 입문하는 단계입니다.', color: '#22C55E' },
  { level: 3, name: '중급1', description: '지역방어의 위치를 알고 수비할 수 있습니다.', color: '#EAB308' },
  { level: 4, name: '중급2', description: '수비 소통과 스크린 플레이 등 팀 전술 수행이 가능합니다.', color: '#EAB308' },
  { level: 5, name: '상급1', description: '자신만의 득점 루트를 보유하고 있습니다.', color: 'var(--color-fg-brand)' },
  { level: 6, name: '상급2', description: '메이저 대회 주전급 실력입니다.', color: 'var(--color-fg-brand)' },
  { level: 7, name: '선출', description: '대학 선수 출신 또는 프로에 준하는 실력입니다.', color: '#EF4444' },
];

export const SKILL_LEVEL_NAMES: Record<number, string> = {
  1: '초보1',
  2: '초보2',
  3: '중급1',
  4: '중급2',
  5: '상급1',
  6: '상급2',
  7: '선출',
};

export function getLevelLabel(level: number | string, fallback = ''): string {
  const normalized = typeof level === 'string' ? Number(level) : level;
  if (!Number.isFinite(normalized)) return fallback;
  return SKILL_LEVEL_NAMES[normalized] ?? fallback;
}
