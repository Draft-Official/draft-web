interface TeamVoteReminderMessageInput {
  teamName: string;
  matchDateTime: string;
  pendingVoterNames: string[];
  voteUrl: string;
  attendingCount: number;
  notAttendingCount: number;
  maybeCount: number;
}

function toMention(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

function dedupePreservingOrder(values: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }

  return result;
}

export function buildTeamVoteReminderMessage(input: TeamVoteReminderMessageInput): string {
  const pendingMentions = dedupePreservingOrder(
    input.pendingVoterNames
      .map(toMention)
      .filter((name): name is string => !!name)
  );

  const pendingLine = pendingMentions.length > 0
    ? pendingMentions.join(' ')
    : '(전원 투표 완료)';

  return [
    `[${input.teamName}] ${input.matchDateTime}`,
    '',
    '운동 인원 확정을 위해 투표 부탁드립니다',
    '',
    `미투표: ${pendingLine}`,
    `투표 링크: ${input.voteUrl}`,
    `투표 결과: 참석 ${input.attendingCount} / 불참 ${input.notAttendingCount} / 미정 ${input.maybeCount}`,
  ].join('\n');
}

export function toKakaoShareText(message: string, maxLength: number = 200): string {
  if (maxLength <= 1) return '…';
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength - 1)}…`;
}
