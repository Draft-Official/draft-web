import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { normalizePhoneNumber } from '@/shared/lib/phone-utils';
import type { VerificationCheckResponse } from '@/shared/types/phone-verification.types';
import { checkVerificationEmail } from './imap-client';

type ServerSupabaseClient = Awaited<ReturnType<typeof createServerSupabaseClient>>;

export async function checkPhoneVerificationCode(
  supabase: ServerSupabaseClient,
  userId: string,
  code: string
): Promise<VerificationCheckResponse> {
  const { data: verification } = await supabase
    .from('phone_verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .eq('verified', false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!verification) {
    return {
      verified: false,
      message: '유효한 인증 요청이 없습니다.',
    };
  }

  const result = await checkVerificationEmail(code);

  if (!result.found || !result.phoneNumber) {
    return {
      verified: false,
      message: '아직 문자가 확인되지 않았습니다.',
    };
  }

  const normalizedInput = normalizePhoneNumber(verification.phone_number);
  const normalizedSender = normalizePhoneNumber(result.phoneNumber);

  if (normalizedInput !== normalizedSender) {
    return {
      verified: false,
      message: '입력한 번호와 발신 번호가 일치하지 않습니다.',
    };
  }

  const { error: verifyError } = await supabase
    .from('phone_verifications')
    .update({ verified: true })
    .eq('id', verification.id);

  if (verifyError) {
    console.error('[phone-verification] verification update error:', verifyError);
  }

  const { error: userError } = await supabase
    .from('users')
    .update({
      phone: normalizedInput,
      phone_verified: true,
    })
    .eq('id', userId);

  if (userError) {
    console.error('[phone-verification] user update error:', userError);
  }

  return {
    verified: true,
    message: '전화번호 인증이 완료되었습니다.',
  };
}
