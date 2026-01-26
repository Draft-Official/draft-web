/**
 * Recruitment 관련 헬퍼 함수
 */
import type {
  RecruitmentSetup,
  RecruitmentSetupAny,
  RecruitmentSetupPosition,
  PositionQuota,
} from '@/shared/types/jsonb.types';
import type { PositionValue } from '@/shared/config/constants';

/**
 * RecruitmentSetup이 ANY 타입인지 확인
 */
export function isRecruitmentAny(
  setup: RecruitmentSetup
): setup is RecruitmentSetupAny {
  return setup.type === 'ANY';
}

/**
 * RecruitmentSetup이 POSITION 타입인지 확인
 */
export function isRecruitmentPosition(
  setup: RecruitmentSetup
): setup is RecruitmentSetupPosition {
  return setup.type === 'POSITION';
}

/**
 * Position 값을 RecruitmentSetup의 키로 매핑
 * - 빅맨 통합 모드일 때 F, C → B로 변환
 *
 * @param position - 신청자의 포지션 (G, F, C)
 * @param availablePositions - recruitment_setup.positions의 키 목록
 * @returns 매핑된 포지션 키
 */
export function mapPositionToRecruitmentKey(
  position: PositionValue,
  availablePositions: Record<string, PositionQuota>
): PositionValue {
  // 직접 매칭되는 경우
  if (availablePositions[position]) {
    return position;
  }

  // 빅맨 통합: F, C → B
  if ((position === 'F' || position === 'C') && availablePositions['B']) {
    return 'B';
  }

  // 기본값: 원래 포지션 반환 (없으면 G로 fallback)
  return position in availablePositions ? position : 'G';
}

/**
 * RecruitmentSetup에서 총 현재 인원 계산
 */
export function getTotalCurrentCount(setup: RecruitmentSetup): number {
  if (isRecruitmentAny(setup)) {
    return setup.current_count;
  }

  return Object.values(setup.positions).reduce(
    (sum, quota) => sum + (quota?.current || 0),
    0
  );
}

/**
 * RecruitmentSetup에서 총 최대 인원 계산
 */
export function getTotalMaxCount(setup: RecruitmentSetup): number {
  if (isRecruitmentAny(setup)) {
    return setup.max_count;
  }

  return Object.values(setup.positions).reduce(
    (sum, quota) => sum + (quota?.max || 0),
    0
  );
}

/**
 * RecruitmentSetup에서 특정 포지션의 남은 자리 계산
 */
export function getRemainingSlots(
  setup: RecruitmentSetup,
  position?: PositionValue
): number {
  if (isRecruitmentAny(setup)) {
    return Math.max(0, setup.max_count - setup.current_count);
  }

  if (position) {
    const key = mapPositionToRecruitmentKey(position, setup.positions);
    const quota = setup.positions[key];
    return quota ? Math.max(0, quota.max - quota.current) : 0;
  }

  // 전체 남은 자리
  return getTotalMaxCount(setup) - getTotalCurrentCount(setup);
}

/**
 * 새 매치 생성 시 초기 RecruitmentSetup 생성 (ANY 타입)
 */
export function createRecruitmentSetupAny(maxCount: number): RecruitmentSetupAny {
  return {
    type: 'ANY',
    max_count: maxCount,
    current_count: 0,
  };
}

/**
 * 새 매치 생성 시 초기 RecruitmentSetup 생성 (POSITION 타입)
 */
export function createRecruitmentSetupPosition(
  positions: Record<PositionValue, number>
): RecruitmentSetupPosition {
  const positionQuotas: Record<string, PositionQuota> = {};

  for (const [key, max] of Object.entries(positions)) {
    if (max > 0) {
      positionQuotas[key] = { max, current: 0 };
    }
  }

  return {
    type: 'POSITION',
    positions: positionQuotas as RecruitmentSetupPosition['positions'],
  };
}

/**
 * 레거시 데이터를 새 형식으로 변환
 * - current_players_count가 있으면 current_count로 이동
 * - positions에 current가 없으면 0으로 초기화
 */
export function normalizeRecruitmentSetup(
  setup: Record<string, unknown>,
  legacyCurrentCount?: number | null
): RecruitmentSetup {
  const type = setup.type as 'ANY' | 'POSITION';

  if (type === 'ANY') {
    return {
      type: 'ANY',
      max_count: (setup.max_count as number) || 5,
      current_count:
        (setup.current_count as number) ?? legacyCurrentCount ?? 0,
    };
  }

  // POSITION 타입
  const positions = (setup.positions as Record<string, { max?: number; current?: number }>) || {};
  const normalizedPositions: Record<string, PositionQuota> = {};

  for (const [key, value] of Object.entries(positions)) {
    normalizedPositions[key] = {
      max: value?.max || 0,
      current: value?.current || 0,
    };
  }

  return {
    type: 'POSITION',
    positions: normalizedPositions as RecruitmentSetupPosition['positions'],
  };
}
