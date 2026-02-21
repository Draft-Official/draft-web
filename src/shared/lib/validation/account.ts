export const ACCOUNT_HOLDER_REGEX = /^[가-힣]{2,10}$/;
export const ACCOUNT_NUMBER_REGEX = /^\d{10,16}$/;

export function sanitizeAccountHolderInput(value: string): string {
  return value.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣]/g, '').slice(0, 10);
}

export function sanitizeAccountNumberInput(value: string): string {
  return value.replace(/[^0-9]/g, '').slice(0, 16);
}

export function isValidAccountHolder(value: string): boolean {
  return ACCOUNT_HOLDER_REGEX.test(value);
}

export function isValidAccountNumber(value: string): boolean {
  return ACCOUNT_NUMBER_REGEX.test(value);
}
