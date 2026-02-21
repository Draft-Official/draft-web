import type { AgeRange } from '@/shared/types/jsonb.types';

const PRESET_LOGOS = [
  { id: '01', url: '/logos/preset/logo-01.webp' },
  { id: '02', url: '/logos/preset/logo-02.webp' },
] as const;

export const TEAM_LOGO_OPTIONS = [
  ...PRESET_LOGOS,
  ...PRESET_LOGOS,
  ...PRESET_LOGOS,
  ...PRESET_LOGOS,
].map((logo, index) => ({
  id: `logo-${String(index + 1).padStart(2, '0')}`,
  url: logo.url,
}));

export const TEAM_DURATION_OPTIONS = [
  { label: '1시간', value: '1' },
  { label: '1시간 30분', value: '1.5' },
  { label: '2시간', value: '2' },
  { label: '2시간 30분', value: '2.5' },
  { label: '3시간', value: '3' },
  { label: '3시간 30분', value: '3.5' },
  { label: '4시간', value: '4' },
] as const;

const SHORT_INTRO_EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu;

const AGE_VALUE_MAP: Record<string, number> = {
  '20': 20,
  '30': 30,
  '40': 40,
  '50+': 50,
};

export function sanitizeShortIntro(value: string): string {
  return value.replace(SHORT_INTRO_EMOJI_REGEX, '').slice(0, 15);
}

export function normalizeTimeValue(
  value: string | null | undefined,
  fallback: string
): string {
  if (!value) return fallback;
  return value.length >= 5 ? value.slice(0, 5) : fallback;
}

export function calcDurationFromTimes(
  startTime: string | null,
  endTime: string | null
): string {
  if (!startTime || !endTime) return '2';
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  const diffHours = ((eh * 60 + em) - (sh * 60 + sm)) / 60;

  const matched = TEAM_DURATION_OPTIONS.find(
    (option) => parseFloat(option.value) === diffHours
  );
  return matched?.value ?? '2';
}

export function calcEndTimeFromDuration(
  startTime: string,
  durationValue: string
): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const duration = parseFloat(durationValue);
  const totalMinutes = hours * 60 + minutes + duration * 60;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

export function ageRangeToSelectedAges(ageRange: AgeRange | null): string[] {
  if (!ageRange) return ['any'];

  const maxNumber = ageRange.max ?? 50;
  const selected = Object.entries(AGE_VALUE_MAP)
    .filter(([, value]) => value >= ageRange.min && value <= maxNumber)
    .map(([value]) => value);

  return selected.length > 0 ? selected : ['any'];
}

export function selectedAgesToAgeRange(selectedAges: string[]): AgeRange | null {
  const normalized = selectedAges.filter((age) => age !== 'any');
  if (normalized.length === 0) return null;

  const sorted = [...normalized].sort(
    (a, b) => (AGE_VALUE_MAP[a] ?? 0) - (AGE_VALUE_MAP[b] ?? 0)
  );
  const min = AGE_VALUE_MAP[sorted[0]] ?? 20;
  const last = sorted[sorted.length - 1];
  const max = last === '50+' ? null : (AGE_VALUE_MAP[last] ?? null);

  return { min, max };
}
