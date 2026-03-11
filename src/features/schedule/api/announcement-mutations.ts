/**
 * Announcement Mutation Hooks
 * 공지 발송용 React Query hooks
 */
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/shared/ui/shadcn/sonner';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { useAuth } from '@/shared/session';
import { createChatService } from '@/entities/chat';

/**
 * 공지 발송
 * 1. announcements 테이블 INSERT (DB 트리거가 in-app 알림 생성)
 * 2. confirmed/payment_waiting 게스트 채팅방에 공지 메시지 일괄 발송
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
      if (!user?.id) throw new Error('로그인이 필요합니다.');

      const supabase = getSupabaseBrowserClient();

      // announcements 테이블은 아직 generated types에 미반영 — 타입 우회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const supabaseAny = supabase as any;

      // 1. announcements INSERT (in-app 알림 트리거용)
      const { data, error } = await supabaseAny
        .from('announcements')
        .insert({
          author_id: user.id,
          target_type: 'MATCH',
          target_id: matchId,
          message,
        })
        .select()
        .single();

      if (error) throw error;

      // 2. confirmed/payment_waiting 게스트 조회
      const { data: applications, error: appError } = await supabase
        .from('applications')
        .select('user_id')
        .eq('match_id', matchId)
        .in('status', ['CONFIRMED', 'PAYMENT_PENDING']);

      if (appError) throw appError;

      if (!applications || applications.length === 0) {
        return data;
      }

      // 3. 각 게스트의 채팅방에 공지 메시지 발송
      const chatService = createChatService(supabase);
      const guestIds = [...new Set(applications.map((a) => a.user_id).filter(Boolean))] as string[];

      await Promise.allSettled(
        guestIds.map(async (guestId) => {
          const room = await chatService.createOrGetRoom({
            matchId,
            hostId: user.id,
            guestId,
          });
          await chatService.sendMessage(room.id, user.id, message, 'announcement');
        })
      );

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
