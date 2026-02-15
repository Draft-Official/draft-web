import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { normalizePhoneNumber } from '@/shared/lib/phone-utils';
import { checkVerificationEmail } from '../imap-client';
import type { VerificationCheckResponse } from '@/shared/types/phone-verification.types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'code is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      );
    }

    // 유효한 인증 레코드 조회
    const { data: verification } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('code', code)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!verification) {
      const response: VerificationCheckResponse = {
        verified: false,
        message: '유효한 인증 요청이 없습니다.',
      };
      return NextResponse.json(response);
    }

    // IMAP으로 메일 확인
    const result = await checkVerificationEmail(code);

    if (!result.found || !result.phoneNumber) {
      const response: VerificationCheckResponse = {
        verified: false,
        message: '아직 문자가 확인되지 않았습니다.',
      };
      return NextResponse.json(response);
    }

    // 발신 번호와 입력 번호 비교
    const normalizedInput = normalizePhoneNumber(verification.phone_number);
    const normalizedSender = normalizePhoneNumber(result.phoneNumber);

    if (normalizedInput !== normalizedSender) {
      const response: VerificationCheckResponse = {
        verified: false,
        message: '입력한 번호와 발신 번호가 일치하지 않습니다.',
      };
      return NextResponse.json(response);
    }

    // 인증 성공: verification 업데이트
    const { error: verifyError } = await supabase
      .from('phone_verifications')
      .update({ verified: true })
      .eq('id', verification.id);

    if (verifyError) {
      console.error('[phone-verification] verification update error:', verifyError);
    }

    // users 테이블 업데이트
    const { error: userError } = await supabase
      .from('users')
      .update({
        phone: normalizedInput,
        phone_verified: true,
      })
      .eq('id', user.id);

    if (userError) {
      console.error('[phone-verification] user update error:', userError);
    }

    const response: VerificationCheckResponse = {
      verified: true,
      message: '전화번호 인증이 완료되었습니다.',
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('[phone-verification/check] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
