import { getKSTDateParts } from '@/shared/lib/datetime';
import { buildDaumCafeRecruitTitle } from './daum-cafe-title';
import { formatDaumCafeHourMinute, parseDaumCafeTimeParts } from './daum-cafe-time';

const FULL_WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

export interface DaumCafeRecruitTemplateInput {
  dateISO: string;
  startTime: string;
  endTime: string;
  placeName: string;
  address?: string | null;
  teamName: string;
  recruitmentText: string;
  costText: string;
  contactText: string;
  notesText: string;
  shareUrl?: string;
  requiredInfoText?: string;
}

export interface DaumCafeRecruitTemplateOutput {
  title: string;
  body: string;
  fullText: string;
}

function formatDateTimeLine(dateISO: string, startTime: string, endTime: string): string {
  const parsed = getKSTDateParts(`${dateISO}T12:00:00+09:00`);
  const start = parseDaumCafeTimeParts(startTime);
  const end = parseDaumCafeTimeParts(endTime);

  const timeRange = `${formatDaumCafeHourMinute(start.hour, start.minute)} ~ ${formatDaumCafeHourMinute(end.hour, end.minute)}`;

  if (!parsed) {
    return `${dateISO} ${timeRange}`;
  }

  const weekday = FULL_WEEKDAY_LABELS[parsed.weekday] ?? '요일미정';
  return `${parsed.month}월 ${parsed.day}일 ${weekday} ${timeRange}`;
}

export function buildDaumCafeRecruitBody(input: DaumCafeRecruitTemplateInput): string {
  const dateTimeLine = formatDateTimeLine(input.dateISO, input.startTime, input.endTime);
  const requiredInfoText = input.requiredInfoText ?? '(이름/나이/키/포지션 등)';
  const locationLine = input.address
    ? `${input.placeName} (${input.address})`.trim()
    : input.placeName;
  const notesLines = input.notesText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const notesBlock = notesLines.length > 0
    ? notesLines.map((line) => `     ${line}`).join('\n')
    : '     없음';

  const sections = [
    `1. HOME 팀명 : ${input.teamName}`,
    `2. 일시 : ${dateTimeLine}`,
    `3. 장소 : ${locationLine}`,
    `4. 게스트 모집 인원 : ${input.recruitmentText}`,
    `5. 게스트 비용 : ${input.costText}`,
    `6. 연락처 : ${input.contactText}`,
    `7. 게스트 신청 시 필수 정보 : ${requiredInfoText}`,
    `8. 기타 참고 사항:\n${notesBlock}`,
  ];

  if (input.shareUrl) {
    sections.push(`짧은 링크 : ${input.shareUrl}`);
  }

  return sections.join('\n\n');
}

export function buildDaumCafeRecruitTemplate(
  input: DaumCafeRecruitTemplateInput
): DaumCafeRecruitTemplateOutput {
  const title = buildDaumCafeRecruitTitle({
    dateISO: input.dateISO,
    startTime: input.startTime,
    endTime: input.endTime,
    placeName: input.teamName,
    address: input.address,
  });

  const body = buildDaumCafeRecruitBody(input);
  const fullText = `${title}\n\n${body}`;

  return { title, body, fullText };
}
