/** 한국 휴대폰 번호 정규식 */
export const PHONE_REGEX = /^01[0-9]\d{7,8}$/;

/** 하이픈 제거 후 정규화 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/** 010-1234-5678 형태로 포맷 */
export function formatPhoneNumber(phone: string): string {
  const digits = normalizePhoneNumber(phone);
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return digits;
}

/** 6자리 랜덤 인증번호 생성 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
