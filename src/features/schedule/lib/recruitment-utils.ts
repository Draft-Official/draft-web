/**
 * Recruitment Setup 조정 유틸리티
 * useConfirmPaymentByGuest / useCancelParticipation 공통 로직
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RecruitmentSetup, Json } from '@/shared/types/database.types';

type ParticipantsInfo = Array<{ position?: string }>;

/**
 * recruitment_setup의 current 값을 증감합니다.
 * @param setup - 현재 recruitment_setup (mutate됨)
 * @param participantsInfo - 참가자 정보 배열
 * @param direction - 'increment' (확정 시) | 'decrement' (취소 시)
 */
export function adjustRecruitmentSetup(
  setup: RecruitmentSetup,
  participantsInfo: ParticipantsInfo,
  direction: 'increment' | 'decrement',
): void {
  const delta = direction === 'increment' ? 1 : -1;

  if (setup.type === 'POSITION' && setup.positions) {
    participantsInfo.forEach((participant) => {
      const pos = participant.position as 'G' | 'F' | 'C' | 'B';
      if (pos && setup.positions?.[pos]) {
        const newValue = setup.positions[pos].current + delta;
        setup.positions[pos].current = Math.max(0, newValue);
      }
    });
  } else if (setup.type === 'ANY') {
    const count = participantsInfo.length;
    if (!setup.current_count) {
      setup.current_count = 0;
    }
    setup.current_count = Math.max(0, setup.current_count + delta * count);
  }
}

/**
 * DB에 recruitment_setup을 업데이트합니다.
 */
export async function updateRecruitmentSetupInDb(
  supabase: SupabaseClient,
  matchId: string,
  setup: RecruitmentSetup,
): Promise<void> {
  const { error } = await supabase
    .from('matches')
    .update({ recruitment_setup: setup as unknown as Json })
    .eq('id', matchId);

  if (error) {
    console.error('Failed to update recruitment_setup:', error);
  }
}
