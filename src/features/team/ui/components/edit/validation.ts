import type { LocationData } from '@/shared/types/location.types';
import { TEAM_DURATION_OPTIONS } from '@/features/team/lib';
import {
  TEAM_NAME_MAX_LENGTH,
  TEAM_NAME_ERROR_MESSAGE,
  TEAM_NAME_CHARACTER_ERROR_MESSAGE,
  isValidTeamName,
} from '@/shared/config/team-constants';
import type { TeamProfileEditFormData } from './types';

const MIN_LEVEL = 1;
const MAX_LEVEL = 7;

type ResolvedLocationData = LocationData & {
  kakaoPlaceId: string;
  x: string;
  y: string;
};

export function isResolvedLocationData(
  locationData: LocationData | null
): locationData is ResolvedLocationData {
  return Boolean(
    locationData &&
      locationData.kakaoPlaceId &&
      locationData.x &&
      locationData.y
  );
}

export function validateTeamProfileEditForm(
  form: TeamProfileEditFormData,
  locationData: LocationData | null
): string | null {
  const trimmedName = form.name.trim();
  if (!trimmedName) return '팀 이름을 입력해주세요';
  if (trimmedName.length > TEAM_NAME_MAX_LENGTH) return TEAM_NAME_ERROR_MESSAGE;
  if (!isValidTeamName(trimmedName)) return TEAM_NAME_CHARACTER_ERROR_MESSAGE;
  if (!form.shortIntro.trim()) return '한줄 소개를 입력해주세요';
  if (form.shortIntro.length > 15) return '한줄 소개는 15자 이내로 입력해주세요';
  if (!form.regularDay) return '정기 운동 요일을 선택해주세요';
  if (!form.regularTime) return '시작 시간을 선택해주세요';

  const isValidDuration = TEAM_DURATION_OPTIONS.some(
    (option) => option.value === form.duration
  );
  if (!isValidDuration) return '진행 시간을 선택해주세요';

  if (!isResolvedLocationData(locationData)) {
    return '홈구장을 검색 결과에서 선택해주세요';
  }

  if (
    form.levelMin < MIN_LEVEL ||
    form.levelMax > MAX_LEVEL ||
    form.levelMin > form.levelMax
  ) {
    return '평균 실력 범위를 다시 확인해주세요';
  }

  return null;
}
