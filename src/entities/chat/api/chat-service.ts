import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  MatchChatMessage,
} from '@/shared/types/database.types';
import { handleSupabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';
import type {
  CreateOrGetMatchChatRoomInput,
  ListMyChatRoomsOptions,
  MatchChatRole,
  MatchChatRoomWithRelations,
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
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (mode === 'host') {
      query = query.eq('host_id', userId);
    }

    if (mode === 'guest') {
      query = query.eq('guest_id', userId);
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

  async getRoom(roomId: string): Promise<MatchChatRoomWithRelations> {
    const { data, error } = await this.supabase
      .from('match_chat_rooms')
      .select(CHAT_ROOM_RELATIONS)
      .eq('id', roomId)
      .single();

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

      return existing as MatchChatRoomWithRelations;
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

    const patch = role === 'host'
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
