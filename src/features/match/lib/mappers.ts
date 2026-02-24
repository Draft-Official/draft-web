/**
 * Match Feature DTO Mappers
 * Entity → DTO 변환 함수들
 */

import type { Match } from '@/entities/match';
import type { Gym } from '@/entities/gym';
import type { User } from '@/entities/user';
import type { Team } from '@/entities/team';
import type { GuestMatchListItemDTO, GuestMatchDetailDTO } from '../model/types';
import {
  formatPrice,
  formatLevelRange,
  formatAgeRange,
  formatTime,
  formatDateISO,
  isWithin1Hour,
} from '@/shared/lib/formatters';
import { formatPositions } from './formatters';

function toPositionStatuses(recruitmentSetup: Match['recruitmentSetup']): GuestMatchListItemDTO['positions'] {
  const positions: GuestMatchListItemDTO['positions'] = {};

  if (recruitmentSetup.type === 'ANY') {
    const max = recruitmentSetup.max_count;
    const current = recruitmentSetup.current_count;
    positions.all = {
      status: current >= max && max > 0 ? 'closed' : 'open',
      max,
      current,
    };
    return positions;
  }

  const quotaByPosition = recruitmentSetup.positions;
  const uiKeyMap = {
    G: 'g',
    F: 'f',
    C: 'c',
    B: 'bigman',
  } as const;

  for (const positionKey of Object.keys(quotaByPosition) as (keyof typeof uiKeyMap)[]) {
    const quota = quotaByPosition[positionKey];
    if (!quota || quota.max <= 0) continue;

    const current = quota.current ?? 0;
    const max = quota.max;

    positions[uiKeyMap[positionKey]] = {
      status: current >= max ? 'closed' : 'open',
      max,
      current,
    };
  }

  return positions;
}

/**
 * Match + related entities → GuestMatchListItemDTO
 *
 * @param match - Match entity
 * @param gym - Gym entity
 * @param host - User entity (host)
 * @param team - Team entity (nullable)
 * @returns Flat DTO for list views
 */
export function toGuestMatchListItemDTO(
  match: Match,
  gym: Gym,
  host: User,
  team: Team | null
): GuestMatchListItemDTO {
  return {
    // Match fields
    matchId: match.id,
    publicId: match.shortId,
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
    positions: toPositionStatuses(match.recruitmentSetup),
    levelDisplay: formatLevelRange(match.levelRange),
    ageDisplay: formatAgeRange(match.ageRange),
    isNew: isWithin1Hour(match.createdAt),
    isClosed: match.status === 'CLOSED',
  };
}

/**
 * Match + related entities → GuestMatchDetailDTO
 *
 * @param match - Match entity
 * @param gym - Gym entity
 * @param host - User entity (host)
 * @param team - Team entity (nullable)
 * @returns Flat DTO for detail views
 */
export function toGuestMatchDetailDTO(
  match: Match,
  gym: Gym,
  host: User,
  team: Team | null
): GuestMatchDetailDTO {
  // Start with list item DTO
  const listItem = toGuestMatchListItemDTO(match, gym, host, team);

  // Calculate recruitment status + detailed position status
  const positions = toPositionStatuses(match.recruitmentSetup) as GuestMatchDetailDTO['positions'];
  let total = 0;
  let current = 0;

  if (match.recruitmentSetup.type === 'ANY') {
    total = match.recruitmentSetup.max_count;
    current = match.recruitmentSetup.current_count;
  } else if (match.recruitmentSetup.type === 'POSITION') {
    for (const quota of Object.values(match.recruitmentSetup.positions)) {
      if (!quota || quota.max <= 0) continue;
      total += quota.max;
      current += quota.current ?? 0;
    }
  }

  const recruitmentStatus = {
    total,
    current,
    isFull: total > 0 && current >= total,
  };

  // Format match rule
  let matchRuleDisplay = null;
  let rule: GuestMatchDetailDTO['rule'] = null;
  if (match.matchRule) {
    const playStyleLabels: Record<string, string> = {
      INTERNAL_2WAY: '2파전',
      INTERNAL_3WAY: '3파전',
      EXCHANGE: '교류전',
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

    rule = {
      type: match.matchRule.play_style ?? 'INTERNAL_2WAY',
      quarterTime: match.matchRule.quarter_rule?.minutes_per_quarter ?? 0,
      quarterCount: match.matchRule.quarter_rule?.quarter_count ?? 0,
      fullGames: match.matchRule.quarter_rule?.game_count ?? 0,
      referee: match.matchRule.referee_type ?? 'SELF',
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

  const contactInfo = contactType && contactValue
    ? { type: contactType, value: contactValue }
    : null;

  const facilities: Record<string, unknown> = {
    ...(gym.facilities ?? {}),
    providesBeverage: match.providesBeverage ?? false,
  };

  return {
    ...listItem,
    id: listItem.matchId,
    title: gym.name,
    location: gym.name,
    address: gym.address,
    price: listItem.priceDisplay,
    priceNum: match.costAmount ?? 0,
    gender: match.genderRule,
    level: listItem.levelDisplay,
    levelMin: match.levelRange?.min ?? null,
    levelMax: match.levelRange?.max ?? null,
    ageRange: listItem.ageDisplay,
    facilities,
    positions,
    rule,
    hostName: host.nickname,
    hostImage: host.avatarUrl,
    manualTeamName: match.manualTeamName,
    hostMessage: match.operationInfo?.notice ?? null,
    contactInfo,
    latitude: gym.latitude,
    longitude: gym.longitude,
    requirements: match.requirements,
    providesBeverage: match.providesBeverage,
    recruitmentStatus,
    matchRuleDisplay,
    contactType,
    contactValue,
  };
}

/**
 * @deprecated Use toGuestMatchListItemDTO instead
 */
export const toMatchListItemDTO = toGuestMatchListItemDTO;

/**
 * @deprecated Use toGuestMatchDetailDTO instead
 */
export const toMatchDetailDTO = toGuestMatchDetailDTO;
