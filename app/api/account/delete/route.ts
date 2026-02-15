import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { AppError } from '@/shared/lib/errors';
import { appError, internalError, ok, unauthorized } from '@/shared/server/http/route-response';
import {
  deleteAccountByUserId,
  getConfirmedApplicantCountForDelete,
} from '@/features/my/server/account-delete';

/**
 * GET /api/account/delete
 * 탈퇴 전 확정자 수 조회
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    const confirmedCount = await getConfirmedApplicantCountForDelete(user.id);

    return ok({ confirmedCount });
  } catch (error) {
    if (error instanceof AppError) {
      return appError(error);
    }
    return internalError('[account-delete] GET error:', error, '확인 중 오류가 발생했습니다.');
  }
}

/**
 * POST /api/account/delete
 * 계정 탈퇴 (익명화 + auth 밴)
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return unauthorized();
    }

    await deleteAccountByUserId(user.id);

    return ok({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return appError(error);
    }
    return internalError('[account-delete] Unexpected error:', error, '계정 삭제 중 오류가 발생했습니다.');
  }
}
