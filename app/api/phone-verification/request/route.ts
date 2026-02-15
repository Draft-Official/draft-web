import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import {
  normalizePhoneNumber,
  PHONE_REGEX,
  generateVerificationCode,
} from '@/shared/lib/phone-utils';
import type { VerificationRequestResponse } from '@/shared/types/phone-verification.types';

const VERIFY_EMAIL = process.env.IMAP_USER;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1시간
const CODE_EXPIRY_MS = 5 * 60 * 1000; // 5분

export async function POST(request: NextRequest) {
  try {
    if (!VERIFY_EMAIL) {
      console.error('[phone-verification] IMAP_USER is not configured');
      return NextResponse.json(
        { error: '서버 인증 메일 주소(IMAP_USER)가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const rawPhone = body.phoneNumber as string;

    if (!rawPhone) {
      return NextResponse.json(
        { error: '전화번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    const phoneNumber = normalizePhoneNumber(rawPhone);
    if (!PHONE_REGEX.test(phoneNumber)) {
      return NextResponse.json(
        { error: '올바른 전화번호 형식이 아닙니다.' },
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

    // Rate limit 체크: 1시간 내 요청 횟수
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from('phone_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since);

    if ((count ?? 0) >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: '요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 기존 미완료 인증 무효화 (만료 처리)
    await supabase
      .from('phone_verifications')
      .update({ expires_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('verified', false);

    // 새 인증 코드 생성
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + CODE_EXPIRY_MS).toISOString();

    const { error: insertError } = await supabase
      .from('phone_verifications')
      .insert({
        user_id: user.id,
        phone_number: phoneNumber,
        code,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('[phone-verification] Insert error:', insertError);
      return NextResponse.json(
        { error: '인증 요청에 실패했습니다.' },
        { status: 500 }
      );
    }

    const smsUri = `sms:${VERIFY_EMAIL}?body=${encodeURIComponent(code)}`;

    const response: VerificationRequestResponse = {
      smsUri,
      recipient: VERIFY_EMAIL,
      code,
      expiresAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[phone-verification] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
