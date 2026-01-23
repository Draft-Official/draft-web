/**
 * Match Management Query Hooks
 * 경기 관리 데이터 조회용 React Query hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from '@/services/match/match.service';
import { createApplicationService } from '@/services/application/application.service';
import { useAuth } from '@/features/auth';
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
            cost_type,
            cost_amount,
            status,
            gym_address,
            gym:gyms!gym_id (name, kakao_place_id)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!applications) return [];

      // DB Application -> UI ManagedMatch 변환
      return applications
        .filter((app) => app.match) // match가 있는 것만
        .map((app) => {
          const match = app.match as {
            id: string;
            manual_team_name: string;
            start_time: string;
            cost_type: string;
            cost_amount: number;
            status: string;
            gym_address: string | null;
            gym: { name: string; kakao_place_id: string | null } | null;
          };

          // Application status를 UI status로 매핑
          const status = app.status === 'CONFIRMED' ? 'confirmed' :
                        app.status === 'REJECTED' ? 'rejected' :
                        app.status === 'CANCELED' ? 'cancelled' :
                        app.status === 'PENDING' && app.approved_at ? 'pending' : // payment_waiting은 'pending'으로 표시
                        'pending';

          const approvalStatusText = app.status === 'CONFIRMED' ? '확정' :
                                    app.status === 'REJECTED' ? '승인거부' :
                                    app.status === 'CANCELED' ? '취소됨' :
                                    app.status === 'PENDING' && app.approved_at ? '입금대기' :
                                    '승인대기';

          return {
            id: match.id,
            type: 'guest' as const,
            status,
            teamName: match.manual_team_name || '팀명 미정',
            date: formatMatchDate(match.start_time),
            time: formatMatchTime(match.start_time),
            location: match.gym?.name || match.gym_address || '장소 미정',
            locationUrl: match.gym?.kakao_place_id ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}` : undefined,
            approvalStatus: approvalStatusText,
            amount: match.cost_amount,
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
 * @returns Guest[] 형태로 변환된 신청자 목록
 */
export function useMatchApplicants(matchId: string) {
  return useQuery({
    queryKey: matchManagementKeys.applicants(matchId),
    queryFn: async (): Promise<Guest[]> => {
      if (!matchId) return [];

      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      const applications = await applicationService.getApplicationsByMatch(matchId);

      // DB Application -> UI Guest 변환
      return applications.map(applicationToGuest);
    },
    enabled: !!matchId,
  });
}

// Helper functions
function formatMatchDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayName = days[date.getDay()];

  return `${year}. ${month}. ${day} (${dayName})`;
}

function formatMatchTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}
