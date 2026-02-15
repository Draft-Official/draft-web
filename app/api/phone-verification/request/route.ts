import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { AppError } from '@/shared/lib/errors';
import { createPhoneVerificationRequest } from '@/features/auth/server/phone-verification/request';
import type { VerificationRequestResponse } from '@/shared/types/phone-verification.types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPhone = typeof body?.phoneNumber === 'string' ? body.phoneNumber : '';

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

    const response: VerificationRequestResponse = await createPhoneVerificationRequest(
      supabase,
      user.id,
      rawPhone
    );

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[phone-verification] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
