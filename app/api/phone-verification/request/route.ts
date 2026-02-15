import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { AppError } from '@/shared/lib/errors';
import { createPhoneVerificationRequest } from '@/features/auth/server/phone-verification/request';
import type { VerificationRequestResponse } from '@/shared/types/phone-verification.types';
import { appError, internalError, ok, unauthorized } from '@/shared/server/http/route-response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPhone = typeof body?.phoneNumber === 'string' ? body.phoneNumber : '';

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    const response: VerificationRequestResponse = await createPhoneVerificationRequest(
      supabase,
      user.id,
      rawPhone
    );

    return ok(response);
  } catch (error) {
    if (error instanceof AppError) {
      return appError(error);
    }
    return internalError('[phone-verification] Unexpected error:', error, 'Internal server error');
  }
}
