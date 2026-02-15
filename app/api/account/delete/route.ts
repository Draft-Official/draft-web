import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { AppError } from '@/shared/lib/errors';
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
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const confirmedCount = await getConfirmedApplicantCountForDelete(user.id);

    return NextResponse.json({ confirmedCount });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[account-delete] GET error:', error);
    return NextResponse.json({ error: '확인 중 오류가 발생했습니다.' }, { status: 500 });
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
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    await deleteAccountByUserId(user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error('[account-delete] Unexpected error:', error);
    return NextResponse.json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
