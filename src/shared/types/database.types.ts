/**
 * Supabase Database 타입 정의 (v2)
 *
 * ⚠️ 이 파일은 수동 작성되었습니다.
 * Supabase CLI로 자동 생성하려면:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
 *
 * 마지막 수정: 2026-01-16 (Schema v2)
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
  parking?: boolean;          // 주차 가능 여부
  shower?: boolean;           // 샤워실 유무
  court_type?: 'WOOD' | 'RUBBER' | 'ASPHALT' | 'OTHER';
  indoor?: boolean;           // 실내 여부
  water?: boolean;            // 정수기
  ac_heat?: boolean;          // 냉난방
  ball?: boolean;             // 공 제공
  [key: string]: unknown;     // 확장 가능
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
export interface RecruitmentSetup {
  type: 'ANY' | 'POSITION';
  max_count?: number;  // type === 'ANY' 일 때 사용
  max_total?: number;  // type === 'POSITION' 일 때 전체 최대
  positions?: {
    G?: { max: number; current: number };
    F?: { max: number; current: number };
    C?: { max: number; current: number };
  };
}

/**
 * 경기 옵션 (matches.match_options)
 */
export interface MatchOptions {
  ball_provided?: boolean;      // 공 제공
  vest_provided?: boolean;      // 조끼 제공
  referee?: 'self' | 'member' | 'pro';
  quarter_time?: number;        // 분
  quarter_count?: number;
  game_format?: 'internal_2' | 'internal_3' | 'exchange' | 'practice';
  [key: string]: unknown;
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
          metadata: UserMetadata;
          created_at: string;
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
          metadata?: UserMetadata;
          created_at?: string;
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
          metadata?: UserMetadata;
          created_at?: string;
        };
        Relationships: [];
      };
      gyms: {
        Row: {
          id: string;
          name: string;
          address: string | null;
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
          address?: string | null;
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
          address?: string | null;
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
          description: string | null;
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
          description?: string | null;
          is_recruiting?: boolean;
          regular_schedule?: string | null;
          contact_link?: string | null;
          account_bank?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          team_avg_level?: string | null;
          team_avg_age?: string | null;
          team_avg_gender?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          logo_url?: string | null;
          region_depth1?: string | null;
          region_depth2?: string | null;
          home_gym_id?: string | null;
          description?: string | null;
          is_recruiting?: boolean;
          regular_schedule?: string | null;
          contact_link?: string | null;
          account_bank?: string | null;
          account_number?: string | null;
          account_holder?: string | null;
          team_avg_level?: string | null;
          team_avg_age?: string | null;
          team_avg_gender?: string | null;
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
          title: string;
          description: string | null;
          start_time: string;
          end_time: string | null;
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
        };
        Insert: {
          id?: string;
          host_id: string;
          team_id?: string | null;
          gym_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time?: string | null;
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
        };
        Update: {
          id?: string;
          host_id?: string;
          team_id?: string | null;
          gym_id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string | null;
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
          position: Database['public']['Enums']['position_type'];
          status: Database['public']['Enums']['application_status'];
          cancellation_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          position: Database['public']['Enums']['position_type'];
          status?: Database['public']['Enums']['application_status'];
          cancellation_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          position?: Database['public']['Enums']['position_type'];
          status?: Database['public']['Enums']['application_status'];
          cancellation_reason?: string | null;
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
      position_type: 'G' | 'F' | 'C';
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
 * Application with Match details
 */
export type ApplicationWithMatch = Application & {
  match: Match;
};
