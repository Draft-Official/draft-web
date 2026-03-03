import { createAdminSupabaseClient } from '@/shared/api/supabase/admin';
import { AppError } from '@/shared/lib/errors';

const ACTIVE_MATCH_STATUSES = ['RECRUITING', 'CLOSED'] as const;
const CANCELED_APPLICATION_STATUS = 'CANCELED' as const;

function getAdminClient() {
  return createAdminSupabaseClient();
}

async function getActiveHostedMatchIds(userId: string): Promise<string[]> {
  const adminClient = getAdminClient();
  const { data: activeMatches } = await adminClient
    .from('matches')
    .select('id')
    .eq('host_id', userId)
    .in('status', ACTIVE_MATCH_STATUSES);

  if (!activeMatches || activeMatches.length === 0) {
    return [];
  }

  return activeMatches.map((match) => match.id);
}

export async function getConfirmedApplicantCountForDelete(userId: string): Promise<number> {
  const matchIds = await getActiveHostedMatchIds(userId);

  if (matchIds.length === 0) {
    return 0;
  }

  const adminClient = getAdminClient();
  const { count } = await adminClient
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .in('match_id', matchIds)
    .eq('status', 'CONFIRMED');

  return count ?? 0;
}

async function cancelActiveMatchesAndApplications(userId: string): Promise<void> {
  const matchIds = await getActiveHostedMatchIds(userId);

  if (matchIds.length === 0) {
    return;
  }

  const adminClient = getAdminClient();

  await adminClient
    .from('applications')
    .update({
      status: CANCELED_APPLICATION_STATUS,
      canceled_by: 'HOST',
      updated_at: new Date().toISOString(),
    })
    .in('match_id', matchIds)
    .in('status', ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED']);

  await adminClient
    .from('matches')
    .update({ status: 'CANCELED' })
    .in('id', matchIds);
}

async function cleanupTeamMemberships(userId: string): Promise<void> {
  const adminClient = getAdminClient();

  const { data: leaderMemberships } = await adminClient
    .from('team_members')
    .select('team_id')
    .eq('user_id', userId)
    .eq('role', 'LEADER')
    .eq('status', 'ACCEPTED');

  if (leaderMemberships && leaderMemberships.length > 0) {
    for (const membership of leaderMemberships) {
      const { data: otherMembers } = await adminClient
        .from('team_members')
        .select('id')
        .eq('team_id', membership.team_id)
        .eq('status', 'ACCEPTED')
        .neq('user_id', userId)
        .order('joined_at', { ascending: true })
        .limit(1);

      if (otherMembers && otherMembers.length > 0) {
        await adminClient
          .from('team_members')
          .update({ role: 'LEADER' })
          .eq('id', otherMembers[0].id);
      } else {
        await adminClient
          .from('teams')
          .delete()
          .eq('id', membership.team_id);
      }
    }
  }

  await adminClient
    .from('team_members')
    .delete()
    .eq('user_id', userId);
}

async function anonymizeUser(userId: string): Promise<void> {
  const adminClient = getAdminClient();
  const { error } = await adminClient
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

  if (error) {
    throw new AppError('계정 처리에 실패했습니다.', 'USER_ANONYMIZE_FAILED', 500);
  }
}

async function deleteAuthUser(userId: string): Promise<void> {
  const adminClient = getAdminClient();
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    throw new AppError('계정 삭제에 실패했습니다.', 'AUTH_USER_DELETE_FAILED', 500);
  }
}

export async function deleteAccountByUserId(userId: string): Promise<void> {
  await cancelActiveMatchesAndApplications(userId);
  await cleanupTeamMemberships(userId);
  await anonymizeUser(userId);
  await deleteAuthUser(userId);
}
