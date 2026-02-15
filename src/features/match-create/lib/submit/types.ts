import type { LocationData } from '@/features/match-create/model/types';
import type { MatchCreateContactType } from '@/features/match-create/model/submit-form.types';

export interface SelectedLocationForSubmit extends LocationData {
  x: string;
  y: string;
  kakaoPlaceId: string;
}

export interface MatchCreateSubmitValidationError {
  sectionId: 'section-basic-info' | 'section-recruitment' | 'section-operations';
  message: string;
}

export interface MatchCreateSubmitValidationSuccess {
  locationData: SelectedLocationForSubmit;
  opsHost: string;
  normalizedContactType: MatchCreateContactType;
  opsContactContent: string;
}

export type MatchCreateSubmitValidationResult =
  | { ok: true; data: MatchCreateSubmitValidationSuccess }
  | { ok: false; error: MatchCreateSubmitValidationError };
