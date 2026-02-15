import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { AppError, ValidationError } from '@/shared/lib/errors';
import {
  normalizePhoneNumber,
  PHONE_REGEX,
  generateVerificationCode,
} from '@/shared/lib/phone-utils';
import type { VerificationRequestResponse } from '@/shared/types/phone-verification.types';

const VERIFY_EMAIL = process.env.IMAP_USER;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export async function createPhoneVerificationRequest(
  supabase: ServerSupabaseClient,
  userId: string,
  rawPhone: string
): Promise<VerificationRequestResponse> {
  if (!VERIFY_EMAIL) {
    throw new AppError(
      '서버 인증 메일 주소(IMAP_USER)가 설정되지 않았습니다.',
      'IMAP_USER_NOT_CONFIGURED',
      500
    );
  }

  if (!rawPhone) {
    throw new ValidationError('전화번호를 입력해주세요.');
  }

  const phoneNumber = normalizePhoneNumber(rawPhone);
  if (!PHONE_REGEX.test(phoneNumber)) {
    throw new ValidationError('올바른 전화번호 형식이 아닙니다.');
  }

  const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
  const { count } = await supabase
    .from('phone_verifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', since);

  if ((count ?? 0) >= RATE_LIMIT_MAX) {
    throw new AppError(
      '요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.',
      'PHONE_VERIFICATION_RATE_LIMIT',
      429
    );
  }

  await supabase
    .from('phone_verifications')
    .update({ expires_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('verified', false);

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS).toISOString();

  const { error: insertError } = await supabase
    .from('phone_verifications')
    .insert({
      user_id: userId,
      phone_number: phoneNumber,
      code,
      expires_at: expiresAt,
    });

  if (insertError) {
    throw new AppError('인증 요청에 실패했습니다.', 'PHONE_VERIFICATION_INSERT_FAILED', 500);
  }

  return {
    smsUri: `sms:${VERIFY_EMAIL}?body=${encodeURIComponent(code)}`,
    recipient: VERIFY_EMAIL,
    code,
    expiresAt,
  };
}
