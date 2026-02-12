import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/shared/api/supabase/server';
import { createAdminSupabaseClient } from '@/shared/api/supabase/admin';

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

    const adminClient = createAdminSupabaseClient();

    // 활성 경기(RECRUITING/CLOSED) 중 CONFIRMED 신청자 수 조회
    const { data: activeMatches } = await adminClient
      .from('matches')
      .select('id')
      .eq('host_id', user.id)
      .in('status', ['RECRUITING', 'CLOSED']);

    let confirmedCount = 0;
    if (activeMatches && activeMatches.length > 0) {
      const matchIds = activeMatches.map((m) => m.id);
      const { count } = await adminClient
        .from('applications')
        .select('*', { count: 'exact', head: true })
        .in('match_id', matchIds)
        .eq('status', 'CONFIRMED');

      confirmedCount = count ?? 0;
    }

    return NextResponse.json({ confirmedCount });
  } catch (error) {
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

    const userId = user.id;
    const adminClient = createAdminSupabaseClient();

    // 1. 활성 경기(RECRUITING/CLOSED) 취소
    const { data: activeMatches } = await adminClient
      .from('matches')
      .select('id')
      .eq('host_id', userId)
      .in('status', ['RECRUITING', 'CLOSED']);

    if (activeMatches && activeMatches.length > 0) {
      const matchIds = activeMatches.map((m) => m.id);

      // 신청서 먼저 취소 (PENDING/CONFIRMED → CANCELED)
      await adminClient
        .from('applications')
        .update({
          status: 'CANCELED' as 'CANCELED',
          canceled_by: 'HOST',
          updated_at: new Date().toISOString(),
        })
        .in('match_id', matchIds)
        .in('status', ['PENDING', 'CONFIRMED']);

      // 경기 상태 CANCELED로 변경 (트리거가 알림 발송)
      await adminClient
        .from('matches')
        .update({ status: 'CANCELED' })
        .in('id', matchIds);
    }

    // 2. 팀 정리
    const { data: leaderMemberships } = await adminClient
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .eq('role', 'LEADER')
      .eq('status', 'ACCEPTED');

    if (leaderMemberships && leaderMemberships.length > 0) {
      for (const membership of leaderMemberships) {
        // 다른 ACCEPTED 멤버가 있는지 확인
        const { data: otherMembers } = await adminClient
          .from('team_members')
          .select('id')
          .eq('team_id', membership.team_id)
          .eq('status', 'ACCEPTED')
          .neq('user_id', userId)
          .order('joined_at', { ascending: true })
          .limit(1);

        if (otherMembers && otherMembers.length > 0) {
          // 2-2. 다른 멤버 있음 → 리더 이전
          await adminClient
            .from('team_members')
            .update({ role: 'LEADER' })
            .eq('id', otherMembers[0].id);
        } else {
          // 2-1. 유일한 멤버 → 팀 삭제 (CASCADE: team_members, team_fees 자동 삭제)
          await adminClient
            .from('teams')
            .delete()
            .eq('id', membership.team_id);
        }
      }
    }

    // 2-3. 남은 team_members 레코드 삭제 (일반 MEMBER 팀 + 리더 이전된 팀)
    await adminClient
      .from('team_members')
      .delete()
      .eq('user_id', userId);

    // 3. users 행 익명화
    const { error: anonymizeError } = await adminClient
      .from('users')
      .update({
        nickname: '탈퇴한 사용자',
        email: null,
        real_name: null,
        phone: null,
        phone_verified: false,
        avatar_url: null,
        positions: null,
        metadata: null,
        account_info: null,
        operation_info: null,
        deleted_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (anonymizeError) {
      console.error('[account-delete] Anonymize error:', anonymizeError);
      return NextResponse.json({ error: '계정 처리에 실패했습니다.' }, { status: 500 });
    }

    // 4. auth.users 레코드 삭제
    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error('[account-delete] Delete auth error:', deleteAuthError);
      return NextResponse.json({ error: '계정 삭제에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[account-delete] Unexpected error:', error);
    return NextResponse.json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
