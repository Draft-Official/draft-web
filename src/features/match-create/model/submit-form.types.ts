export type MatchCreateContactType = 'PHONE' | 'KAKAO_OPEN_CHAT';

export interface MatchCreateSubmitFormValues {
  title?: string;
  location?: string;
  startTime?: string;
  duration?: string;
  fee?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  refundPolicy?: string;
  description?: string;
  manualTeamName?: string;
  phoneNumber?: string;
  kakaoLink?: string;
  operations?: {
    selectedHost?: string;
    contactType?: MatchCreateContactType;
    saveAsDefault?: boolean;
  };
}
