export interface VerificationRequestResponse {
  smsUri: string;
  code: string;
  expiresAt: string;
}

export interface VerificationCheckResponse {
  verified: boolean;
  message: string;
}
