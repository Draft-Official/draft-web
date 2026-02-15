import type { LocationData } from '@/features/match-create/model/types';
import type {
  MatchCreateContactType,
  MatchCreateSubmitFormValues,
} from '@/features/match-create/model/submit-form.types';

interface ValidationInput {
  form: MatchCreateSubmitFormValues;
  selectedDate: string | null;
  locationData: LocationData | null;
  isPositionMode: boolean;
  positions: {
    guard: number;
    forward: number;
    center: number;
    bigman: number;
  };
  totalCount: number;
}

interface ValidationError {
  sectionId: 'section-basic-info' | 'section-recruitment' | 'section-operations';
  message: string;
}

interface ValidationSuccess {
  opsHost: string;
  normalizedContactType: MatchCreateContactType;
  opsContactContent: string;
}

export type MatchCreateSubmitValidationResult =
  | { ok: true; data: ValidationSuccess }
  | { ok: false; error: ValidationError };

export interface SelectedLocationForSubmit extends LocationData {
  x: string;
  y: string;
  kakaoPlaceId: string;
}

function isValidSelectedLocation(locationData: LocationData | null): locationData is SelectedLocationForSubmit {
  return Boolean(locationData && locationData.kakaoPlaceId && locationData.x && locationData.y);
}

export function validateMatchCreateSubmit({
  form,
  selectedDate,
  locationData,
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

  const accountHolderRegex = /^[가-힣]{2,10}$/;
  if (!accountHolderRegex.test(form.accountHolder)) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 예금주는 한글 2-10자로 입력해주세요.',
      },
    };
  }

  const accountNumberRegex = /^\d{10,16}$/;
  if (!accountNumberRegex.test(form.accountNumber)) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 계좌번호는 숫자 10-16자리로 입력해주세요.',
      },
    };
  }

  const normalizedContactType: MatchCreateContactType =
    form.operations?.contactType === 'KAKAO_OPEN_CHAT' ? 'KAKAO_OPEN_CHAT' : 'PHONE';

  const opsContactContent =
    normalizedContactType === 'PHONE'
      ? form.phoneNumber || ''
      : form.kakaoLink || '';

  if (!opsContactContent) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 연락처를 입력해주세요.',
      },
    };
  }

  if (normalizedContactType === 'PHONE') {
    const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
    if (!phoneRegex.test(opsContactContent)) {
      return {
        ok: false,
        error: {
          sectionId: 'section-operations',
          message: '⚠️ 운영 정보를 확인해주세요: 올바른 전화번호 형식으로 입력해주세요 (예: 010-1234-5678)',
        },
      };
    }
  }

  if (normalizedContactType === 'KAKAO_OPEN_CHAT' && !opsContactContent.startsWith('http')) {
    return {
      ok: false,
      error: {
        sectionId: 'section-operations',
        message: '⚠️ 운영 정보를 확인해주세요: 올바른 오픈채팅 링크를 입력해주세요.',
      },
    };
  }

  return {
    ok: true,
    data: {
      opsHost,
      normalizedContactType,
      opsContactContent,
    },
  };
}
