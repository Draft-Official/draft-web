/**
 * Match Management Query Hooks
 * 경기 관리 데이터 조회용 React Query hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from '@/features/match/api/match-api';
import { createApplicationService } from '@/features/application/api/application-api';
import { useAuth } from '@/features/auth';
import { formatMatchDate, formatMatchTime } from '@/shared/lib/date';
import { matchManagementKeys } from './keys';
import {
  matchToManagedMatch,
  applicationToGuest,
  matchToHostMatchDetail,
} from '../lib/mappers';
import type { ManagedMatch, Guest, HostMatchDetail } from '../model/types';

/**
 * 내가 주최한 경기 목록 조회
 * @returns ManagedMatch[] 형태로 변환된 호스트 경기 목록
 */
export function useHostedMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchManagementKeys.hostedMatches(user?.id ?? ''),
    queryFn: async (): Promise<ManagedMatch[]> => {
      if (!user?.id) return [];

      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      // 모든 호스트 경기 조회 (limit 없음)
      const rows = await matchService.getMyHostedMatches(user.id, 100);

      // DB Row -> UI ManagedMatch 변환
      return rows.map((row) => matchToManagedMatch(row, 'host'));
    },
    enabled: !!user?.id,
  });
}

/**
 * 내가 참여한 경기 목록 조회 (게스트로 신청한 경기)
 * @returns ManagedMatch[] 형태로 변환된 참여 경기 목록
 */
export function useParticipatingMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchManagementKeys.participatingMatches(user?.id ?? ''),
    queryFn: async (): Promise<ManagedMatch[]> => {
      if (!user?.id) return [];

      const supabase = getSupabaseBrowserClient();

      // 직접 쿼리하여 필요한 match 필드 가져오기
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          match:matches!match_id (
            id,
            manual_team_name,
            start_time,
            end_time,
            cost_type,
            cost_amount,
            status,
            account_info,
            gym:gyms!gym_id (name, address, kakao_place_id)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!applications) return [];

      // DB Application → UI ManagedMatch 변환
      return applications
        .filter((app) => app.match) // match가 있는 것만
        .map((app) => {
          const match = app.match as {
            id: string;
            manual_team_name: string;
            start_time: string;
            end_time: string;
            cost_type: string;
            cost_amount: number;
            status: string;
            account_info: { bank?: string; number?: string; holder?: string } | null;
            gym: { name: string; address: string; kakao_place_id: string | null } | null;
          };

          // 경기 시간 기반 종료 판정
          const now = new Date();
          const matchEnded = match.end_time && now >= new Date(match.end_time);
          const matchOngoing = match.start_time && match.end_time &&
            now >= new Date(match.start_time) && now < new Date(match.end_time);

          // Application status를 UI status로 매핑 (시간 기반 오버라이드 포함)
          let status: ManagedMatch['status'];
          if (matchEnded) {
            status = app.status === 'REJECTED' || app.status === 'CANCELED' ? 'cancelled' : 'ended';
          } else if (matchOngoing && app.status === 'CONFIRMED') {
            status = 'ongoing';
          } else {
            status = app.status === 'CONFIRMED' ? 'confirmed' :
                    app.status === 'REJECTED' ? 'cancelled' :
                    app.status === 'CANCELED' ? 'cancelled' :
                    app.status === 'PENDING' && app.approved_at ? 'payment_waiting' :
                    'waiting';
          }

          const approvalStatusText = app.status === 'CONFIRMED' ? '경기 확정' :
                                    app.status === 'REJECTED' ? '종료/취소' :
                                    app.status === 'CANCELED' ? '종료/취소' :
                                    app.status === 'PENDING' && app.approved_at ? '결제 대기' :
                                    '승인 대기';

          // 참가자 정보 파싱
          const participants = (app.participants_info as { type: string; name?: string; position?: string }[] | null) || [];
          const mainParticipant = participants.find((p) => p.type === 'MAIN');
          const companions = participants
            .filter((p) => p.type === 'GUEST')
            .map((p) => ({ name: p.name || '', position: p.position || '' }));
          const companionCount = companions.length;
          const totalCount = participants.length || 1;

          // 포지션 라벨 변환
          const positionLabels: Record<string, string> = {
            G: '가드 (G)',
            F: '포워드 (F)',
            C: '센터 (C)',
            B: '빅맨 (F/C)',
          };
          const position = mainParticipant?.position || 'G';

          return {
            id: match.id,
            type: 'guest' as const,
            status,
            teamName: match.manual_team_name || '팀명 미정',
            date: formatMatchDate(match.start_time),
            time: formatMatchTime(match.start_time),
            startTimeISO: match.start_time || '',
            location: match.gym?.name || match.gym?.address || '장소 미정',
            locationUrl: match.gym?.kakao_place_id ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}` : undefined,
            applicationId: app.id, // 송금 완료 처리용
            approvalStatus: approvalStatusText,
            totalCost: match.cost_amount ? match.cost_amount * totalCount : undefined,
            perCost: companionCount > 0 ? match.cost_amount : undefined,
            companionCount: companionCount > 0 ? companionCount : undefined,
            bankInfo: match.account_info?.bank && match.account_info?.number && match.account_info?.holder
              ? {
                  bank: match.account_info.bank,
                  account: match.account_info.number,
                  holder: match.account_info.holder,
                }
              : undefined,
            applicationInfo: {
              position: positionLabels[position] || position,
              appliedAt: app.created_at || '',
              companions: companions.length > 0 ? companions.map((c) => ({
                name: c.name,
                position: positionLabels[c.position] || c.position,
              })) : undefined,
              cancelReason: app.cancel_reason || undefined,
            },
          } as ManagedMatch;
        });
    },
    enabled: !!user?.id,
  });
}

/**
 * 호스트 경기 상세 조회
 * @param matchId 경기 ID
 * @returns HostMatchDetail 형태로 변환된 경기 상세
 */
export function useHostMatchDetail(matchId: string) {
  return useQuery({
    queryKey: matchManagementKeys.matchDetail(matchId),
    queryFn: async (): Promise<HostMatchDetail | null> => {
      if (!matchId) return null;

      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      const row = await matchService.getMatchDetail(matchId);

      // DB Row -> UI HostMatchDetail 변환
      return matchToHostMatchDetail(row);
    },
    enabled: !!matchId,
  });
}

/**
 * 경기 신청자 목록 조회
 * @param matchId 경기 ID
 * @returns Guest[] 형태로 변환된 신청자 목록 (팀 참여 이력 포함)
 */
export function useMatchApplicants(matchId: string) {
  return useQuery({
    queryKey: matchManagementKeys.applicants(matchId),
    queryFn: async (): Promise<Guest[]> => {
      if (!matchId) return [];

      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      // 1. 현재 경기의 team_id 조회
      const { data: match } = await supabase
        .from('matches')
        .select('team_id')
        .eq('id', matchId)
        .single();

      // team_id가 없으면 이력 조회 불가
      if (!match?.team_id) {
        const applications = await applicationService.getApplicationsByMatch(matchId);
        return applications.map((app) => applicationToGuest(app));
      }

      // 2. 신청자 목록 조회
      const applications = await applicationService.getApplicationsByMatch(matchId);
      if (applications.length === 0) return [];

      // 3. 각 신청자의 팀 참여 이력 조회 (현재 경기 제외, CONFIRMED만)
      const userIds = applications.map((app) => app.user_id);
      const { data: historyData } = await supabase
        .from('applications')
        .select(`
          user_id,
          created_at,
          match:matches!match_id (id, team_id)
        `)
        .in('user_id', userIds)
        .eq('status', 'CONFIRMED')
        .neq('match_id', matchId);

      // 4. 유저별 이력 집계 (같은 team의 경기만)
      const historyMap = new Map<string, { count: number; lastDate?: string }>();
      if (historyData) {
        for (const row of historyData) {
          const rowMatch = row.match as { id: string; team_id: string | null } | null;
          if (rowMatch?.team_id !== match.team_id) continue;

          const existing = historyMap.get(row.user_id);
          if (existing) {
            existing.count += 1;
            if (row.created_at && (!existing.lastDate || row.created_at > existing.lastDate)) {
              existing.lastDate = row.created_at;
            }
          } else {
            historyMap.set(row.user_id, {
              count: 1,
              lastDate: row.created_at || undefined,
            });
          }
        }
      }

      // 5. DB Application -> UI Guest 변환 (이력 포함)
      return applications.map((app) => {
        const history = historyMap.get(app.user_id);
        return applicationToGuest(app, history ? {
          count: history.count,
          lastDate: history.lastDate ? formatMatchDate(history.lastDate) : undefined,
        } : undefined);
      });
    },
    enabled: !!matchId,
  });
}

