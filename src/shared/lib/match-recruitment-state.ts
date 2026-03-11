const RECRUITMENT_CLOSED_STATUSES = new Set([
  'CLOSED',
  'CONFIRMED',
  'ONGOING',
  'FINISHED',
  'COMPLETED',
  'CANCELED',
]);

type MatchStateInput = {
  status?: string | null;
  startTimeISO?: string | null;
};

function parseDateTimeISO(dateTimeISO?: string | null): Date | null {
  if (!dateTimeISO) return null;

  const parsed = new Date(dateTimeISO);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed;
}

export function hasMatchStarted(
  startTimeISO?: string | null,
  now: Date = new Date()
): boolean {
  const start = parseDateTimeISO(startTimeISO);
  if (!start) return false;

  return now >= start;
}

export function canCreateMatchAt(
  startTimeISO?: string | null,
  now: Date = new Date()
): boolean {
  const start = parseDateTimeISO(startTimeISO);
  if (!start) return false;

  return now < start;
}

export function isRecruitmentClosed(
  { status, startTimeISO }: MatchStateInput,
  now: Date = new Date()
): boolean {
  if (status && RECRUITMENT_CLOSED_STATUSES.has(status)) return true;
  return hasMatchStarted(startTimeISO, now);
}

export function isTeamVotingClosed(
  { status, startTimeISO }: MatchStateInput,
  now: Date = new Date()
): boolean {
  if (status === 'CLOSED') return true;
  return hasMatchStarted(startTimeISO, now);
}
