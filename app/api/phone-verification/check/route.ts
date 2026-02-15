import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { checkPhoneVerificationCode } from '@/features/auth/server/phone-verification/check';
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

    const response: VerificationCheckResponse = await checkPhoneVerificationCode(
      supabase,
      user.id,
      code
    );
    return NextResponse.json(response);
  } catch (error) {
    console.error('[phone-verification/check] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
