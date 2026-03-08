import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  MatchChatMessage,
  MatchChatRoomUpdate,
} from '@/shared/types/database.types';
import { handleSupabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import type {
  CreateOrGetMatchChatRoomInput,
  ListMyChatRoomsOptions,
  MatchChatRole,
  MatchChatRoomWithRelations,
  ReportMatchChatRoomInput,
} from '../model/types';

const CHAT_ROOM_RELATIONS = `
  *,
  match:matches!match_id (
    id,
    short_id,
    start_time,
    manual_team_name,
    team:teams!team_id (
      id,
      name,
      logo_url
    )
  ),
  host:users!host_id (
    id,
    nickname,
    avatar_url
  ),
  guest:users!guest_id (
    id,
    nickname,
    avatar_url
  )
`;

export class ChatService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async listMyRooms(userId: string, options: ListMyChatRoomsOptions = {}): Promise<MatchChatRoomWithRelations[]> {
    const { mode = 'all', matchId, limit } = options;

    let query = this.supabase
      .from('match_chat_rooms')
      .select(CHAT_ROOM_RELATIONS)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (mode === 'host') {
      query = query.eq('host_id', userId).is('host_left_at', null);
    } else if (mode === 'guest') {
      query = query.eq('guest_id', userId).is('guest_left_at', null);
    } else {
      query = query.or(
        `and(host_id.eq.${userId},host_left_at.is.null),and(guest_id.eq.${userId},guest_left_at.is.null)`
      );
    }

    if (matchId) {
      query = query.eq('match_id', matchId);
    }

    if (typeof limit === 'number') {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      handleSupabaseError(error, '채팅방 목록 조회');
    }

    return (data ?? []) as MatchChatRoomWithRelations[];
  }

  async listHostRoomsByMatch(hostId: string, matchId: string, limit: number = 20): Promise<MatchChatRoomWithRelations[]> {
    return this.listMyRooms(hostId, {
      mode: 'host',
      matchId,
      limit,
    });
  }

  async getRoom(roomId: string, viewerUserId?: string): Promise<MatchChatRoomWithRelations> {
    let query = this.supabase
      .from('match_chat_rooms')
      .select(CHAT_ROOM_RELATIONS)
      .eq('id', roomId);

    if (viewerUserId) {
      query = query.or(
        `and(host_id.eq.${viewerUserId},host_left_at.is.null),and(guest_id.eq.${viewerUserId},guest_left_at.is.null)`
      );
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('채팅방');
      }
      handleSupabaseError(error, '채팅방 조회');
    }

    return data as MatchChatRoomWithRelations;
  }

  async createOrGetRoom(input: CreateOrGetMatchChatRoomInput): Promise<MatchChatRoomWithRelations> {
    const { matchId, hostId, guestId } = input;

    if (hostId === guestId) {
      throw new ValidationError('본인에게는 문의 채팅을 시작할 수 없습니다.');
    }

    const { data, error } = await this.supabase
      .from('match_chat_rooms')
      .insert({
        match_id: matchId,
        host_id: hostId,
        guest_id: guestId,
      })
      .select(CHAT_ROOM_RELATIONS)
      .single();

    if (!error) {
      return data as MatchChatRoomWithRelations;
    }

    if (error.code === '23505') {
      const { data: existing, error: existingError } = await this.supabase
        .from('match_chat_rooms')
        .select(CHAT_ROOM_RELATIONS)
        .eq('match_id', matchId)
        .eq('guest_id', guestId)
        .single();

      if (existingError) {
        handleSupabaseError(existingError, '기존 채팅방 조회');
      }

      const now = new Date().toISOString();
      const reopenPatch: MatchChatRoomUpdate = {
        host_left_at: null,
        guest_left_at: null,
        updated_at: now,
      };

      const { data: reopened, error: reopenError } = await this.supabase
        .from('match_chat_rooms')
        .update(reopenPatch)
        .eq('id', (existing as MatchChatRoomWithRelations).id)
        .select(CHAT_ROOM_RELATIONS)
        .single();

      if (reopenError) {
        handleSupabaseError(reopenError, '기존 채팅방 재입장');
      }

      return reopened as MatchChatRoomWithRelations;
    }

    handleSupabaseError(error, '채팅방 생성');
  }

  async getMessages(roomId: string, limit: number = 200): Promise<MatchChatMessage[]> {
    const { data, error } = await this.supabase
      .from('match_chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      handleSupabaseError(error, '채팅 메시지 조회');
    }

    return data ?? [];
  }

  async sendMessage(roomId: string, senderId: string, body: string): Promise<MatchChatMessage> {
    const normalizedBody = body.trim();

    if (!normalizedBody) {
      throw new ValidationError('메시지를 입력해 주세요.');
    }

    const { data, error } = await this.supabase
      .from('match_chat_messages')
      .insert({
        room_id: roomId,
        sender_id: senderId,
        body: normalizedBody,
      })
      .select('*')
      .single();

    if (error) {
      handleSupabaseError(error, '채팅 메시지 전송');
    }

    return data;
  }

  async markRoomRead(roomId: string, role: MatchChatRole): Promise<void> {
    const now = new Date().toISOString();

    const patch: MatchChatRoomUpdate = role === 'host'
      ? { host_last_read_at: now, updated_at: now }
      : { guest_last_read_at: now, updated_at: now };

    const { error } = await this.supabase
      .from('match_chat_rooms')
      .update(patch)
      .eq('id', roomId);

    if (error) {
      handleSupabaseError(error, '채팅 읽음 처리');
    }
  }

  async leaveRoom(roomId: string, role: MatchChatRole): Promise<void> {
    const now = new Date().toISOString();
    const patch: MatchChatRoomUpdate = role === 'host'
      ? { host_left_at: now, updated_at: now }
      : { guest_left_at: now, updated_at: now };

    const { error } = await this.supabase
      .from('match_chat_rooms')
      .update(patch)
      .eq('id', roomId);

    if (error) {
      handleSupabaseError(error, '채팅방 나가기');
    }
  }

  async setRoomMuted(roomId: string, role: MatchChatRole, muted: boolean): Promise<void> {
    const now = new Date().toISOString();
    const patch: MatchChatRoomUpdate = role === 'host'
      ? { host_muted_at: muted ? now : null, updated_at: now }
      : { guest_muted_at: muted ? now : null, updated_at: now };

    const { error } = await this.supabase
      .from('match_chat_rooms')
      .update(patch)
      .eq('id', roomId);

    if (error) {
      handleSupabaseError(error, '채팅 알림 설정 변경');
    }
  }

  async reportRoom(input: ReportMatchChatRoomInput): Promise<void> {
    const { roomId, reporterId, reason, details } = input;
    const normalizedReason = reason.trim();

    if (!normalizedReason) {
      throw new ValidationError('신고 사유를 선택해 주세요.');
    }

    if (normalizedReason.length > 80) {
      throw new ValidationError('신고 사유는 80자 이하로 입력해 주세요.');
    }

    const normalizedDetails = details?.trim() || null;
    if (normalizedDetails && normalizedDetails.length > 1000) {
      throw new ValidationError('상세 내용은 1000자 이하로 입력해 주세요.');
    }

    const room = await this.getRoom(roomId, reporterId);
    const reportedUserId = room.host_id === reporterId ? room.guest_id : room.host_id;

    const { error } = await this.supabase
      .from('match_chat_reports')
      .insert({
        room_id: roomId,
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason: normalizedReason,
        details: normalizedDetails,
      });

    if (error) {
      handleSupabaseError(error, '채팅 신고');
    }
  }

  async countUnreadMessages(roomId: string, userId: string, sinceISO?: string | null): Promise<number> {
    let query = this.supabase
      .from('match_chat_messages')
      .select('*', { head: true, count: 'exact' })
      .eq('room_id', roomId)
      .neq('sender_id', userId);

    if (sinceISO) {
      query = query.gt('created_at', sinceISO);
    }

    const { count, error } = await query;

    if (error) {
      handleSupabaseError(error, '채팅 안 읽은 메시지 수 조회');
    }

    return count ?? 0;
  }
}

export function createChatService(supabase: SupabaseClient<Database>) {
  return new ChatService(supabase);
}
