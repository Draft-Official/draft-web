import type { Team as TeamEntity, TeamMember as TeamMemberEntity } from '@/entities/team';
import type { Match as MatchEntity } from '@/entities/match';
import type { Gym as GymEntity } from '@/entities/gym';
import type { User as UserEntity } from '@/entities/user';
import type { Application as ApplicationEntity } from '@/entities/application';
import {
  MATCH_STATUS_LABELS,
  type MatchStatusValue,
} from '@/shared/config/match-constants';
import type { TeamRoleValue, TeamVoteStatusValue } from '@/shared/config/team-constants';
import type {
  MyPendingTeamVoteMatchDTO,
  MyTeamListItemDTO,
  TeamInfoDTO,
  TeamMatchDetailDTO,
  TeamMembershipDTO,
  TeamScheduleMatchItemDTO,
  TeamVoteDTO,
} from '../model/types';
import {
  formatTeamAgeRange,
  formatTeamLevelRange,
  formatTeamMatchDate,
  formatTeamMatchTime,
  formatTeamRegion,
  formatTeamRegularSchedule,
} from './formatters';

type TeamMemberUserInput = {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  positions: string[] | null;
  height: number | null;
  weight: number | null;
};
type TeamVoteUserInput = Pick<UserEntity, 'nickname' | 'avatarUrl'>;

function toTeamVoteStatus(status: string | null): TeamVoteStatusValue {
  switch (status) {
    case 'CONFIRMED':
    case 'LATE':
    case 'NOT_ATTENDING':
    case 'MAYBE':
      return status;
    case 'PENDING':
    default:
      return 'PENDING';
  }
}

function toMatchStatusLabel(status: MatchStatusValue | null): string {
  if (!status) return '상태 미정';
  return MATCH_STATUS_LABELS[status] ?? status;
}

function toTeamName(match: MatchEntity, team: TeamEntity | null | undefined): string {
  return team?.name ?? match.manualTeamName ?? '팀';
}

export function toTeamInfoDTO(
  team: TeamEntity,
  extras?: { homeGymName?: string | null; homeGymAddress?: string | null }
): TeamInfoDTO {
  return {
    id: team.id,
    code: team.code,
    name: team.name,
    shortIntro: team.shortIntro,
    description: team.description,
    logoUrl: team.logoUrl,
    regionDepth1: team.regionDepth1,
    regionDepth2: team.regionDepth2,
    regionDisplay: formatTeamRegion(team.regionDepth1, team.regionDepth2),
    homeGymId: team.homeGymId,
    homeGymName: extras?.homeGymName ?? null,
    homeGymAddress: extras?.homeGymAddress ?? null,
    regularDays: team.regularDays,
    regularStartTime: team.regularStartTime,
    regularEndTime: team.regularEndTime,
    regularScheduleDisplay: formatTeamRegularSchedule(
      team.regularDays,
      team.regularStartTime,
      team.regularEndTime
    ),
    teamGender: team.teamGender,
    levelRange: team.levelRange,
    levelDisplay: formatTeamLevelRange(team.levelRange),
    ageRange: team.ageRange,
    ageDisplay: formatTeamAgeRange(team.ageRange),
    isRecruiting: team.isRecruiting,
    accountInfo: team.accountInfo,
    operationInfo: team.operationInfo,
    createdAt: team.createdAt,
  };
}

export function toMyTeamListItemDTO(
  team: TeamEntity,
  role: TeamRoleValue,
  extras?: { homeGymName?: string | null }
): MyTeamListItemDTO {
  return {
    id: team.id,
    code: team.code || '',
    name: team.name,
    logoUrl: team.logoUrl,
    role,
    regularDays: team.regularDays,
    regularTime: team.regularStartTime?.slice(0, 5) ?? null,
    regularScheduleDisplay: formatTeamRegularSchedule(
      team.regularDays,
      team.regularStartTime,
      team.regularEndTime
    ),
    homeGymName: extras?.homeGymName ?? null,
  };
}

export function toTeamMembershipDTO(
  member: TeamMemberEntity,
  user?: TeamMemberUserInput | null
): TeamMembershipDTO {
  return {
    id: member.id,
    teamId: member.teamId,
    userId: member.userId,
    role: member.role,
    status: member.status,
    joinedAt: member.joinedAt,
    user: user
      ? {
          id: user.id,
          nickname: user.nickname,
          avatarUrl: user.avatarUrl,
          positions: user.positions,
          height: user.height,
          weight: user.weight,
        }
      : undefined,
  };
}

export function toTeamScheduleMatchItemDTO(
  match: MatchEntity,
  extras?: {
    team?: TeamEntity | null;
    gym?: GymEntity | null;
  }
): TeamScheduleMatchItemDTO {
  return {
    matchId: match.id,
    publicId: match.shortId,
    teamId: match.teamId,
    teamCode: extras?.team?.code ?? null,
    teamName: toTeamName(match, extras?.team),
    teamLogoUrl: extras?.team?.logoUrl ?? null,
    gymId: extras?.gym?.id ?? match.gymId,
    gymName: extras?.gym?.name ?? '장소 미정',
    gymAddress: extras?.gym?.address ?? null,
    startTime: match.startTime,
    endTime: match.endTime,
    dateDisplay: formatTeamMatchDate(match.startTime),
    timeDisplay: formatTeamMatchTime(match.startTime),
    status: match.status,
    statusLabel: toMatchStatusLabel(match.status),
    isPast: new Date(match.startTime) < new Date(),
  };
}

export function toTeamVoteDTO(
  application: ApplicationEntity,
  user?: TeamVoteUserInput | null
): TeamVoteDTO {
  return {
    id: application.id,
    matchId: application.matchId,
    userId: application.userId,
    status: toTeamVoteStatus(application.status),
    source: application.source as TeamVoteDTO['source'],
    description: application.description,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    userNickname: user?.nickname ?? null,
    userAvatarUrl: user?.avatarUrl ?? null,
  };
}

export function toTeamMatchDetailDTO(
  match: MatchEntity,
  extras?: {
    team?: TeamEntity | null;
    gym?: GymEntity | null;
  }
): TeamMatchDetailDTO {
  const listItem = toTeamScheduleMatchItemDTO(match, extras);

  return {
    ...listItem,
    matchType: match.matchType,
    matchFormat: match.matchFormat,
    genderRule: match.genderRule,
    recruitmentSetup: match.recruitmentSetup,
    matchRule: match.matchRule,
    requirements: match.requirements,
    operationInfo: match.operationInfo,
    accountInfo: match.accountInfo,
    facilities: extras?.gym?.facilities ?? null,
    isVotingClosed: match.status === 'CLOSED' || new Date(match.startTime) < new Date(),
  };
}

export function toMyPendingTeamVoteMatchDTO(
  match: MatchEntity,
  team: TeamEntity,
  myVote: ApplicationEntity | null,
  votingSummary: {
    attending: number;
    notAttending: number;
    pending: number;
  },
  gym?: GymEntity | null
): MyPendingTeamVoteMatchDTO {
  return {
    matchId: match.id,
    publicId: match.shortId,
    teamId: team.id,
    teamCode: team.code || '',
    teamName: team.name,
    teamLogoUrl: team.logoUrl,
    startTime: match.startTime,
    dateDisplay: formatTeamMatchDate(match.startTime),
    timeDisplay: formatTeamMatchTime(match.startTime),
    gymName: gym?.name ?? '장소 미정',
    gymAddress: gym?.address ?? null,
    status: (match.status ?? 'RECRUITING') as MatchStatusValue,
    myVote: toTeamVoteStatus(myVote?.status ?? 'PENDING'),
    myVoteReason: myVote?.description ?? null,
    votingSummary,
  };
}
