interface TeamVoteReminderMessageInput {
  teamName: string;
  matchDateTime: string;
  pendingCount: number;
  voteUrl: string;
  attendingCount: number;
  notAttendingCount: number;
  maybeCount: number;
}

export function buildTeamVoteReminderMessage(input: TeamVoteReminderMessageInput): string {
  return [
    `[${input.teamName}] ${input.matchDateTime}`,
    '',
    '운동 인원 확정을 위해 투표 부탁드립니다',
    '',
    `미투표: ${Math.max(0, input.pendingCount)}명`,
    `투표 링크: ${input.voteUrl}`,
    `투표 결과: 참석 ${input.attendingCount} / 불참 ${input.notAttendingCount} / 미정 ${input.maybeCount}`,
  ].join('\n');
}

export function toKakaoShareText(message: string, maxLength: number = 200): string {
  if (maxLength <= 1) return '…';
  if (message.length <= maxLength) return message;
  return `${message.slice(0, maxLength - 1)}…`;
}
