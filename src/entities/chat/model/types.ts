import type { MatchChatRoom, MatchChatMessage } from '@/shared/types/database.types';

export type MatchChatRole = 'host' | 'guest';

export interface MatchChatRoomUserProfile {
  id: string;
  nickname: string | null;
  avatar_url: string | null;
}

export interface MatchChatRoomTeamProfile {
  id: string;
  name: string;
  logo_url: string | null;
}

export interface MatchChatRoomMatchProfile {
  id: string;
  short_id: string;
  start_time: string;
  manual_team_name: string;
  team: MatchChatRoomTeamProfile | null;
}

export interface MatchChatRoomWithRelations extends MatchChatRoom {
  match: MatchChatRoomMatchProfile | null;
  host: MatchChatRoomUserProfile | null;
  guest: MatchChatRoomUserProfile | null;
}

export type MatchChatMessageRow = MatchChatMessage;

export interface ListMyChatRoomsOptions {
  mode?: 'all' | 'host' | 'guest';
  matchId?: string;
  limit?: number;
}

export interface CreateOrGetMatchChatRoomInput {
  matchId: string;
  hostId: string;
  guestId: string;
}
