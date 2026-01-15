/**
 * Services Layer Re-exports
 *
 * 서비스 레이어는 모든 DB 접근을 캡슐화합니다.
 * UI 컴포넌트나 React Query hooks에서 직접 Supabase를 호출하지 않고
 * 서비스를 통해 접근합니다.
 *
 * 사용법:
 * const supabase = getSupabaseBrowserClient();
 * const matchService = createMatchService(supabase);
 * const matches = await matchService.getRecruitingMatches();
 */

export { MatchService, createMatchService } from './match';
export { AuthService, createAuthService } from './auth';
export { ApplicationService, createApplicationService } from './application';

// Mappers
export {
  matchRowToGuestListMatch,
  matchRowToHostDashboardMatch,
  matchCreateFormToInsert,
  dbPositionToClient,
  clientPositionToDb,
} from './match';
