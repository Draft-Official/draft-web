export const CREATE_ACTION_OPTIONS = [
  { id: 'guest-match', label: '게스트 경기 생성' },
  { id: 'team-create', label: '팀 생성' },
  { id: 'team-regular', label: '팀 정기운동 생성' },
] as const;

export type CreateActionOptionId = (typeof CREATE_ACTION_OPTIONS)[number]['id'];
