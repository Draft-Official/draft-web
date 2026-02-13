/**
 * Announcement Mutation Hooks
 * 공지 발송용 React Query hooks
 */
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { useAuth } from '@/features/auth';

/**
 * 공지 발송 (announcements 테이블에 INSERT)
 * DB 트리거가 자동으로 활성 신청자에게 알림 생성
 */
export function useCreateAnnouncement() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      matchId,
      message,
    }: {
      matchId: string;
      message: string;
    }) => {
      // announcements 테이블은 아직 generated types에 미반영 — 타입 우회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabase = getSupabaseBrowserClient() as any;

      const { data, error } = await supabase
        .from('announcements')
        .insert({
          author_id: user?.id,
          target_type: 'MATCH',
          target_id: matchId,
          message,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('공지가 발송되었습니다.');
    },
    onError: (error: Error) => {
      console.error('Create announcement error:', error);
      toast.error(`공지 발송 실패: ${error.message}`);
    },
  });
}
