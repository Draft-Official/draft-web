import type { LocationData } from '@/features/match-create/model/types';
import type {
  MatchCreateSubmitFormValues,
} from '@/features/match-create/model/submit-form.types';
import type {
  MatchCreateSubmitValidationResult,
  SelectedLocationForSubmit,
} from './types';
import {
  isValidAccountHolder,
  isValidAccountNumber,
} from '@/shared/lib/validation/account';
import { normalizePhoneNumber, PHONE_REGEX } from '@/shared/lib/phone-utils';

interface ValidationInput {
  form: MatchCreateSubmitFormValues;
  selectedDate: string | null;
  locationData: LocationData | null;
  currentUserPhone?: string | null;
  isPositionMode: boolean;
  positions: {
    guard: number;
    forward: number;
    center: number;
    bigman: number;
  };
  totalCount: number;
}

function isValidSelectedLocation(locationData: LocationData | null): locationData is SelectedLocationForSubmit {
  return Boolean(locationData && locationData.kakaoPlaceId && locationData.x && locationData.y);
}

export function validateMatchCreateSubmit({
  form,
  selectedDate,
  locationData,
  currentUserPhone,
  isPositionMode,
  positions,
  totalCount,
}: ValidationInput): MatchCreateSubmitValidationResult {
  if (!selectedDate) {
    return {
      ok: false,
      error: {
        sectionId: 'section-basic-info',
        message: '⚠️ 기본 정보를 확인해주세요: 날짜를 선택해주세요.',
      },
    };
  }

  if (!isValidSelectedLocation(locationData)) {
    return {
      ok: false,
      error: {
        sectionId: 'section-basic-info',
        message: '⚠️ 기본 정보를 확인해주세요: 장소를 검색하여 선택해주세요.',
      },
    };
  }

  if (isPositionMode) {
    const totalPositions = positions.guard + positions.forward + positions.center + positions.bigman;
    if (totalPositions === 0) {
      return {
        ok: false,
        error: {
          sectionId: 'section-recruitment',
          message: '⚠️ 모집 인원을 설정해주세요: 최소 1명 이상 모집해야 합니다.',
        },
      };
    }
  } else if (totalCount === 0) {
    return {
      ok: false,
      error: {
        sectionId: 'section-recruitment',
        message: '⚠️ 모집 인원을 설정해주세요: 최소 1명 이상 모집해야 합니다.',
      },
    };
  }

  const opsHost = form.operations?.selectedHost;
  if (!opsHost) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 주최자를 선택해주세요.',
      },
    };
  }

  if (opsHost === 'me' && (!form.manualTeamName || form.manualTeamName.trim() === '')) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 개인 주최 시 팀 이름을 입력해주세요.',
      },
    };
  }

  if (!form.bankName || !form.accountNumber || !form.accountHolder) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 계좌 정보를 모두 입력해주세요.',
      },
    };
  }

  if (!isValidAccountHolder(form.accountHolder)) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 예금주는 한글 2-10자로 입력해주세요.',
      },
    };
  }

  if (!isValidAccountNumber(form.accountNumber)) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 계좌번호는 숫자 10-16자리로 입력해주세요.',
      },
    };
  }

  const normalizedUserPhone = normalizePhoneNumber(currentUserPhone || '');
  const normalizedContactType = 'PHONE' as const;
  const opsContactContent = normalizedUserPhone;

  if (!opsContactContent) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 전화번호 인증 후 이용해주세요.',
      },
    };
  }

  if (!PHONE_REGEX.test(opsContactContent)) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 전화번호 인증 후 이용해주세요.',
      },
    };
  }

  return {
    ok: true,
    data: {
      selectedDate,
      locationData,
      opsHost,
      normalizedContactType,
      opsContactContent,
    },
  };
}
