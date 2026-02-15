import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { checkPhoneVerificationCode } from '@/features/auth/server/phone-verification/check';
import type { VerificationCheckResponse } from '@/shared/types/phone-verification.types';
import { internalError, ok, unauthorized, apiError } from '@/shared/server/http/route-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return apiError('code is required', 400, 'VALIDATION_ERROR');
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    const response: VerificationCheckResponse = await checkPhoneVerificationCode(
      supabase,
      user.id,
      code
    );
    return ok(response);
  } catch (error) {
    return internalError('[phone-verification/check] Error:', error, 'Internal server error');
  }
}
