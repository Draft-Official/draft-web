/**
 * Supabase Database 타입 정의 (v3)
 *
 * ⚠️ 이 파일은 수동 작성되었습니다.
 * Supabase CLI로 자동 생성하려면:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
 *
 * 마지막 수정: 2026-01-16 (Schema v3)
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ============================================
// JSONB Types
// ============================================

/**
 * Gym 시설 정보 (gyms.facilities)
 */
export interface GymFacilities {
  shower?: boolean;
  parking?: boolean;
  parking_fee?: string;
  parking_location?: string;
  court_size_type?: 'REGULAR' | 'SHORT' | 'NARROW';
  air_conditioner?: boolean;
  water_purifier?: boolean;
  ball?: boolean;
  [key: string]: unknown;
}

/**
 * 유저 메타데이터 (users.metadata)
 */
export interface UserMetadata {
  height?: number;
  weight?: number;
  kakao_id?: number;
  provider?: 'kakao' | 'apple' | 'google' | 'email';
  connected_accounts?: string[];
  [key: string]: unknown;
}

/**
 * 모집 인원 설정 (matches.recruitment_setup)
 */
// 🔥 [변경] 포지션 키에 'B' (Big Man) 추가
export interface RecruitmentSetup {
  type: 'ANY' | 'POSITION';
  max_count?: number; // type === 'ANY' 일 때 사용 (total) / User defined: max_count is mandatory in interface, but type optional in DB? adhere to user def.
  // User's def: max_count: number;
  // DB schema default: { "type": "ANY", "max_count": 10 }
  max_total?: number; // legacy derived helper? User def doesn't have it explicitly but mapped logic uses it. I will keep it optional.
  positions?: {
    G?: { max: number; current: number };
    F?: { max: number; current: number };
    C?: { max: number; current: number };
    B?: { max: number; current: number }; // [NEW] 빅맨
  };
}

/**
 * 경기 옵션 (matches.match_options)
 */
export interface MatchOptions {
  play_style?: 'INTERNAL_2WAY' | 'INTERNAL_3WAY' | 'EXCHANGE' | 'PRACTICE';
  quarter_rule?: {
    minutes_per_quarter: number;
    quarter_count: number;
    game_count: number;
  };
  guaranteed_quarters?: number;
  referee_type?: 'SELF' | 'STAFF' | 'PRO';
  
  ball_provided?: boolean;
  vest_provided?: boolean;
  shoes_rental?: boolean;
  shower_available?: boolean;
  
  [key: string]: unknown;
}

/**
 * 참여자 정보 (applications.participants_info)
 */
export interface ParticipantInfo {
  type: 'MAIN' | 'GUEST';
  name: string;
  position: 'G' | 'F' | 'C' | 'B' | string; // [NEW] B 추가
  cost: number;
}

// ============================================
// Database Schema
// ============================================

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string | null;
          real_name: string | null;
          nickname: string | null;
          avatar_url: string | null;
          phone: string | null;
          phone_verified: boolean;
          positions: string[] | null;
          manner_score: number;
          // 운영 정보 기본값
          default_account_bank: string | null;
          default_account_number: string | null;
          default_account_holder: string | null;
          default_contact_type: 'PHONE' | 'KAKAO_OPEN_CHAT';
          kakao_open_chat_url: string | null;
          default_host_notice: string | null;
          metadata: UserMetadata;
          created_at: string;
          deleted_at: string | null; // Soft Delete
        };
        Insert: {
          id: string;
          email?: string | null;
          real_name?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          phone_verified?: boolean;
          positions?: string[] | null;
          manner_score?: number;
          default_account_bank?: string | null;
          default_account_number?: string | null;
          default_account_holder?: string | null;
          default_contact_type?: 'PHONE' | 'KAKAO_OPEN_CHAT';
          kakao_open_chat_url?: string | null;
          default_host_notice?: string | null;
          metadata?: UserMetadata;
          created_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          real_name?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          phone_verified?: boolean;
          positions?: string[] | null;
          manner_score?: number;
          default_account_bank?: string | null;
          default_account_number?: string | null;
          default_account_holder?: string | null;
          default_contact_type?: 'PHONE' | 'KAKAO_OPEN_CHAT';
          kakao_open_chat_url?: string | null;
          default_host_notice?: string | null;
          metadata?: UserMetadata;
          created_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      gyms: {
        Row: {
          id: string;
          name: string;
          address: string;
          latitude: number | null;
          longitude: number | null;
          facilities: GymFacilities;
          kakao_place_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address: string;
          latitude?: number | null;
          longitude?: number | null;
          facilities?: GymFacilities;
          kakao_place_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          address?: string;
          latitude?: number | null;
          longitude?: number | null;
          facilities?: GymFacilities;
          kakao_place_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          region_depth1: string | null;
          region_depth2: string | null;
          home_gym_id: string | null;
          host_notice: string | null;
          is_recruiting: boolean;
          regular_schedule: string | null;
          contact_link: string | null;
          account_bank: string | null;
          account_number: string | null;
          account_holder: string | null;
          team_avg_level: string | null;
          team_avg_age: string | null;
          team_gender: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          logo_url?: string | null;
          region_depth1?: string | null;
          region_depth2?: string | null;
          home_gym_id?: string | null;
          host_notice?: string | null;
          is_recruiting?: boolean;
          regular_schedule?: string | null;
          contact_link?: string | null;
          account_bank?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          team_avg_level?: string | null;
          team_avg_age?: string | null;
          team_gender?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          region_depth1?: string | null;
          region_depth2?: string | null;
          home_gym_id?: string | null;
          host_notice?: string | null;
          is_recruiting?: boolean;
          regular_schedule?: string | null;
          contact_link?: string | null;
          account_bank?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          team_avg_level?: string | null;
          team_avg_age?: string | null;
          team_gender?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'teams_home_gym_id_fkey';
            columns: ['home_gym_id'];
            isOneToOne: false;
            referencedRelation: 'gyms';
            referencedColumns: ['id'];
          }
        ];
      };
      team_members: {
        Row: {
          id: string;
          team_id: string;
          user_id: string;
          role: string;
          status: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          team_id: string;
          user_id: string;
          role?: string;
          status?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          team_id?: string;
          user_id?: string;
          role?: string;
          status?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'team_members_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      matches: {
        Row: {
          id: string;
          host_id: string;
          team_id: string | null;
          gym_id: string;
          manual_team_name: string;
          contact_type: string;
          contact_content: string | null;
          host_notice: string | null;
          start_time: string;
          end_time: string;
          match_type: string;
          gender_rule: string;
          level_limit: string | null;
          cost_type: string;
          cost_amount: number;
          provides_beverage: boolean;
          account_bank: string | null;
          account_number: string | null;
          account_holder: string | null;
          recruitment_setup: RecruitmentSetup;
          status: string;
          match_options: MatchOptions;
          created_at: string;
          // 비정규화 필드 (Gym 정보)
          gym_latitude: number | null;
          gym_longitude: number | null;
          gym_address: string | null;
          // 자동 집계 필드
          current_players_count: number;
          // 준비물
          requirements: string[];
        };
        Insert: {
          id?: string;
          host_id: string;
          team_id?: string | null;
          gym_id: string;
          manual_team_name: string;
          contact_type?: string;
          contact_content?: string | null;
          host_notice?: string | null;
          start_time: string;
          end_time: string;
          match_type: string;
          gender_rule: string;
          level_limit?: string | null;
          cost_type?: string;
          cost_amount?: number;
          provides_beverage?: boolean;
          account_bank?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          recruitment_setup?: RecruitmentSetup;
          status?: string;
          match_options?: MatchOptions;
          created_at?: string;
          // 비정규화 필드는 트리거가 자동 설정하므로 선택적
          gym_latitude?: number | null;
          gym_longitude?: number | null;
          gym_address?: string | null;
          current_players_count?: number;
          requirements?: string[];
        };
        Update: {
          id?: string;
          host_id?: string;
          team_id?: string | null;
          gym_id?: string;
          manual_team_name?: string;
          contact_type?: string;
          contact_content?: string | null;
          host_notice?: string | null;
          start_time?: string;
          end_time?: string;
          match_type?: string;
          gender_rule?: string;
          level_limit?: string | null;
          cost_type?: string;
          cost_amount?: number;
          provides_beverage?: boolean;
          account_bank?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          recruitment_setup?: RecruitmentSetup;
          status?: string;
          match_options?: MatchOptions;
          created_at?: string;
          gym_latitude?: number | null;
          gym_longitude?: number | null;
          gym_address?: string | null;
          current_players_count?: number;
          requirements?: string[];
        };
        Relationships: [
          {
            foreignKeyName: 'matches_host_id_fkey';
            columns: ['host_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_gym_id_fkey';
            columns: ['gym_id'];
            isOneToOne: false;
            referencedRelation: 'gyms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'matches_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };
      applications: {
        Row: {
          id: string;
          match_id: string;
          user_id: string;
          team_id: string | null;
          status: Database['public']['Enums']['application_status'];
          participants_info: ParticipantInfo[];
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          team_id?: string | null;
          status?: Database['public']['Enums']['application_status'];
          participants_info?: ParticipantInfo[];
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          team_id?: string | null;
          status?: Database['public']['Enums']['application_status'];
          participants_info?: ParticipantInfo[];
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'applications_match_id_fkey';
            columns: ['match_id'];
            isOneToOne: false;
            referencedRelation: 'matches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'applications_team_id_fkey';
            columns: ['team_id'];
            isOneToOne: false;
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      application_status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELED';
      position_type: 'G' | 'F' | 'C' | 'B'; // B: 빅맨 (F/C 통합)
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ============================================
// 편의를 위한 타입 별칭
// ============================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Row 타입 별칭
export type User = Tables<'users'>;
export type Gym = Tables<'gyms'>;
export type Team = Tables<'teams'>;
export type TeamMember = Tables<'team_members'>;
export type Match = Tables<'matches'>;
export type Application = Tables<'applications'>;

// Insert 타입 별칭
export type UserInsert = TablesInsert<'users'>;
export type GymInsert = TablesInsert<'gyms'>;
export type TeamInsert = TablesInsert<'teams'>;
export type TeamMemberInsert = TablesInsert<'team_members'>;
export type MatchInsert = TablesInsert<'matches'>;
export type ApplicationInsert = TablesInsert<'applications'>;

// Update 타입 별칭
export type UserUpdate = TablesUpdate<'users'>;
export type GymUpdate = TablesUpdate<'gyms'>;
export type TeamUpdate = TablesUpdate<'teams'>;
export type TeamMemberUpdate = TablesUpdate<'team_members'>;
export type MatchUpdate = TablesUpdate<'matches'>;
export type ApplicationUpdate = TablesUpdate<'applications'>;

// Enum 타입 별칭
export type ApplicationStatus = Enums<'application_status'>;
export type PositionType = Enums<'position_type'>;

// ============================================
// 하위 호환성을 위한 별칭 (deprecated)
// ============================================

/** @deprecated Use User instead */
export type Profile = User;
/** @deprecated Use UserInsert instead */
export type ProfileInsert = UserInsert;
/** @deprecated Use UserUpdate instead */
export type ProfileUpdate = UserUpdate;

// ============================================
// 조인된 타입 (자주 사용되는 패턴)
// ============================================

/**
 * Match with Gym details
 */
export type MatchWithGym = Match & {
  gym: Gym | null;
};

/**
 * Match with Host user
 */
export type MatchWithHost = Match & {
  host: User;
};

/**
 * Match with all relations
 */
export type MatchWithRelations = Match & {
  gym: Gym | null;
  host: User;
  team: Team | null;
};

/**
 * Application with User details
 */
export type ApplicationWithUser = Application & {
  user: User;
};

/**
 * ApplicationWithMatch
 */
export type ApplicationWithMatch = Application & {
  match: Match;
};
