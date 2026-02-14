/**
 * Match Feature DTO Mappers
 * Entity → DTO 변환 함수들
 */

import type { Match } from '@/entities/match';
import type { Gym } from '@/entities/gym';
import type { User } from '@/entities/user';
import type { Team } from '@/entities/team';
import type { MatchListItemDTO, MatchDetailDTO } from '../model/types';
import {
  formatPrice,
  formatLevelRange,
  formatAgeRange,
  formatTime,
  formatDateISO,
  isWithin24Hours,
} from '@/shared/lib/formatters';
import { formatPositions } from './formatters';

/**
 * Match + related entities → MatchListItemDTO
 *
 * @param match - Match entity
 * @param gym - Gym entity
 * @param host - User entity (host)
 * @param team - Team entity (nullable)
 * @returns Flat DTO for list views
 */
export function toMatchListItemDTO(
  match: Match,
  gym: Gym,
  host: User,
  team: Team | null
): MatchListItemDTO {
  return {
    // Match fields
    matchId: match.id,
    dateISO: formatDateISO(match.startTime),
    startTime: formatTime(match.startTime),
    endTime: formatTime(match.endTime),
    matchType: match.matchType,
    matchFormat: match.matchFormat,
    genderRule: match.genderRule,
    status: match.status,

    // Gym fields (flattened)
    gymId: gym.id,
    gymName: gym.name,
    gymAddress: gym.address,
    gymLatitude: gym.latitude,
    gymLongitude: gym.longitude,

    // Host fields (flattened)
    hostId: host.id,
    hostNickname: host.nickname,
    hostAvatar: host.avatarUrl,

    // Team fields (flattened)
    teamId: team?.id ?? null,
    teamName: team?.name ?? match.manualTeamName,
    teamLogo: team?.logoUrl ?? null,

    // Computed UI fields
    priceDisplay: formatPrice(match.costType, match.costAmount),
    positionsDisplay: formatPositions(match.recruitmentSetup),
    levelDisplay: formatLevelRange(match.levelRange),
    ageDisplay: formatAgeRange(match.ageRange),
    isNew: isWithin24Hours(match.createdAt),
    isClosed: match.status === 'CLOSED',
  };
}

/**
 * Match + related entities → MatchDetailDTO
 *
 * @param match - Match entity
 * @param gym - Gym entity
 * @param host - User entity (host)
 * @param team - Team entity (nullable)
 * @returns Flat DTO for detail views
 */
export function toMatchDetailDTO(
  match: Match,
  gym: Gym,
  host: User,
  team: Team | null
): MatchDetailDTO {
  // Start with list item DTO
  const listItem = toMatchListItemDTO(match, gym, host, team);

  // Calculate recruitment status
  let total = 0;
  let current = 0;

  if (match.recruitmentSetup.type === 'ANY') {
    total = match.recruitmentSetup.max_count;
    current = match.recruitmentSetup.current_count;
  } else if (match.recruitmentSetup.type === 'POSITION') {
    const positions = match.recruitmentSetup.positions;
    for (const pos of Object.values(positions)) {
      if (pos) {
        total += pos.max;
        current += pos.current ?? 0;
      }
    }
  }

  const recruitmentStatus = {
    total,
    current,
    isFull: current >= total,
  };

  // Format match rule
  let matchRuleDisplay = null;
  if (match.matchRule) {
    const playStyleLabels: Record<string, string> = {
      INTERNAL_2WAY: '2파전',
      INTERNAL_3WAY: '3파전',
      EXCHANGE: '교류전',
      PRACTICE: '연습',
    };

    const refereeLabels: Record<string, string> = {
      SELF: '자체 심판',
      STAFF: '스태프',
      PRO: '전문 심판',
    };

    const playStyle = match.matchRule.play_style
      ? playStyleLabels[match.matchRule.play_style] ?? match.matchRule.play_style
      : '미정';

    const referee = match.matchRule.referee_type
      ? refereeLabels[match.matchRule.referee_type] ?? match.matchRule.referee_type
      : '미정';

    matchRuleDisplay = {
      playStyle,
      quarterTime: match.matchRule.quarter_rule?.minutes_per_quarter ?? 10,
      quarterCount: match.matchRule.quarter_rule?.quarter_count ?? 4,
      referee,
    };
  }

  // Extract contact info
  let contactType = null;
  let contactValue = null;
  if (match.operationInfo) {
    contactType = match.operationInfo.type;
    contactValue = match.operationInfo.type === 'PHONE'
      ? match.operationInfo.phone ?? null
      : match.operationInfo.url ?? null;
  }

  return {
    ...listItem,
    requirements: match.requirements,
    providesBeverage: match.providesBeverage,
    recruitmentStatus,
    matchRuleDisplay,
    contactType,
    contactValue,
  };
}
