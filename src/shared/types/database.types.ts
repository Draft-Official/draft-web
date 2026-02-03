export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          approved_at: string | null
          cancel_reason: string | null
          cancel_type: Database["public"]["Enums"]["cancel_type"] | null
          canceled_by: string | null
          created_at: string | null
          id: string
          match_id: string
          participants_info: Json | null
          payment_verified_at: string | null
          status: Database["public"]["Enums"]["application_status"] | null
          team_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          cancel_reason?: string | null
          cancel_type?: Database["public"]["Enums"]["cancel_type"] | null
          canceled_by?: string | null
          created_at?: string | null
          id?: string
          match_id: string
          participants_info?: Json | null
          payment_verified_at?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          team_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_at?: string | null
          cancel_reason?: string | null
          cancel_type?: Database["public"]["Enums"]["cancel_type"] | null
          canceled_by?: string | null
          created_at?: string | null
          id?: string
          match_id?: string
          participants_info?: Json | null
          payment_verified_at?: string | null
          status?: Database["public"]["Enums"]["application_status"] | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: Database["public"]["Enums"]["notification_type"]
          reference_id: string
          reference_type: string
          match_id: string | null
          actor_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: Database["public"]["Enums"]["notification_type"]
          reference_id: string
          reference_type: string
          match_id?: string | null
          actor_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
          reference_id?: string
          reference_type?: string
          match_id?: string | null
          actor_id?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      gyms: {
        Row: {
          address: string
          created_at: string | null
          facilities: Json | null
          id: string
          kakao_place_id: string
          latitude: number
          longitude: number
          name: string
          updated_at: string | null
        }
        Insert: {
          address: string
          created_at?: string | null
          facilities?: Json | null
          id?: string
          kakao_place_id: string
          latitude: number
          longitude: number
          name: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          created_at?: string | null
          facilities?: Json | null
          id?: string
          kakao_place_id?: string
          latitude?: number
          longitude?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      matches: {
        Row: {
          account_info: Json | null
          age_range: Json | null
          cost_amount: number | null
          cost_type: string
          created_at: string | null
          end_time: string
          gender_rule: string
          gym_id: string
          host_id: string
          id: string
          level_limit: string | null
          level_range: Json | null
          manual_team_name: string
          match_format: string
          match_rule: Json | null
          match_type: string
          operation_info: Json | null
          provides_beverage: boolean | null
          recruitment_setup: Json
          requirements: string[] | null
          start_time: string
          status: string | null
          team_id: string | null
        }
        Insert: {
          account_info?: Json | null
          age_range?: Json | null
          cost_amount?: number | null
          cost_type?: string
          created_at?: string | null
          end_time: string
          gender_rule: string
          gym_id: string
          host_id: string
          id?: string
          level_limit?: string | null
          level_range?: Json | null
          manual_team_name: string
          match_format?: string
          match_rule?: Json | null
          match_type: string
          operation_info?: Json | null
          provides_beverage?: boolean | null
          recruitment_setup?: Json
          requirements?: string[] | null
          start_time: string
          status?: string | null
          team_id?: string | null
        }
        Update: {
          account_info?: Json | null
          age_range?: Json | null
          cost_amount?: number | null
          cost_type?: string
          created_at?: string | null
          current_players_count?: number | null
          end_time?: string
          gender_rule?: string
          gym_id?: string
          host_id?: string
          id?: string
          level_limit?: string | null
          level_range?: Json | null
          manual_team_name?: string
          match_format?: string
          match_rule?: Json | null
          match_type?: string
          operation_info?: Json | null
          provides_beverage?: boolean | null
          recruitment_setup?: Json
          requirements?: string[] | null
          start_time?: string
          status?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_gym_id_fkey"
            columns: ["gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string | null
          status: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string | null
          status?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string | null
          status?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          account_info: Json | null
          created_at: string | null
          description: string | null
          home_gym_id: string | null
          id: string
          is_recruiting: boolean | null
          logo_url: string | null
          name: string
          operation_info: Json | null
          region_depth1: string | null
          region_depth2: string | null
          regular_schedules: Json | null
          team_avg_age: string | null
          team_avg_level: string | null
          team_gender: string | null
        }
        Insert: {
          account_info?: Json | null
          created_at?: string | null
          description?: string | null
          home_gym_id?: string | null
          id?: string
          is_recruiting?: boolean | null
          logo_url?: string | null
          name: string
          operation_info?: Json | null
          region_depth1?: string | null
          region_depth2?: string | null
          regular_schedules?: Json | null
          team_avg_age?: string | null
          team_avg_level?: string | null
          team_gender?: string | null
        }
        Update: {
          account_info?: Json | null
          created_at?: string | null
          description?: string | null
          home_gym_id?: string | null
          id?: string
          is_recruiting?: boolean | null
          logo_url?: string | null
          name?: string
          operation_info?: Json | null
          region_depth1?: string | null
          region_depth2?: string | null
          regular_schedules?: Json | null
          team_avg_age?: string | null
          team_avg_level?: string | null
          team_gender?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_home_gym_id_fkey"
            columns: ["home_gym_id"]
            isOneToOne: false
            referencedRelation: "gyms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          user_id: string
          notify_application: boolean
          notify_match: boolean
          notify_payment: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          notify_application?: boolean
          notify_match?: boolean
          notify_payment?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          notify_application?: boolean
          notify_match?: boolean
          notify_payment?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_info: Json | null
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          manner_score: number | null
          metadata: Json | null
          nickname: string | null
          operation_info: Json | null
          phone: string | null
          phone_verified: boolean | null
          positions: string[] | null
          real_name: string | null
        }
        Insert: {
          account_info?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id: string
          manner_score?: number | null
          metadata?: Json | null
          nickname?: string | null
          operation_info?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          positions?: string[] | null
          real_name?: string | null
        }
        Update: {
          account_info?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          manner_score?: number | null
          metadata?: Json | null
          nickname?: string | null
          operation_info?: Json | null
          phone?: string | null
          phone_verified?: boolean | null
          positions?: string[] | null
          real_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status:
        | "PENDING"
        | "CONFIRMED"
        | "REJECTED"
        | "CANCELED"
        | "PAYMENT_PENDING"
        | "LATE"
        | "NOT_ATTENDING"
      cancel_type:
        | "USER_REQUEST"
        | "PAYMENT_TIMEOUT"
        | "FRAUDULENT_PAYMENT"
      notification_type:
        | "APPLICATION_APPROVED"
        | "APPLICATION_REJECTED"
        | "APPLICATION_CANCELED_USER_REQUEST"
        | "APPLICATION_CANCELED_PAYMENT_TIMEOUT"
        | "APPLICATION_CANCELED_FRAUDULENT_PAYMENT"
        | "MATCH_CANCELED"
        | "NEW_APPLICATION"
        | "GUEST_CANCELED"
        | "GUEST_PAYMENT_CONFIRMED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status: [
        "PENDING",
        "CONFIRMED",
        "REJECTED",
        "CANCELED",
        "PAYMENT_PENDING",
        "LATE",
        "NOT_ATTENDING",
      ],
    },
  },
} as const

// ============================================
// Custom Type Aliases (convenience)
// ============================================

// Row types
export type User = Database['public']['Tables']['users']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type Gym = Database['public']['Tables']['gyms']['Row'];
export type Match = Database['public']['Tables']['matches']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type TeamMember = Database['public']['Tables']['team_members']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type TeamInsert = Database['public']['Tables']['teams']['Insert'];
export type GymInsert = Database['public']['Tables']['gyms']['Insert'];
export type MatchInsert = Database['public']['Tables']['matches']['Insert'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type TeamUpdate = Database['public']['Tables']['teams']['Update'];
export type MatchUpdate = Database['public']['Tables']['matches']['Update'];
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update'];

// Legacy aliases (for backward compatibility)
export type Profile = User;
export type ProfileUpdate = UserUpdate;

export interface UserMetadata {
  height?: number;
  age?: number;
  weight?: number;
  skill_level?: number;
  [key: string]: unknown;
}

// Enum types
export type ApplicationStatus = Database['public']['Enums']['application_status'];
export type PositionType = 'G' | 'F' | 'C' | 'B';

// ============================================
// JSONB Field Types
// ============================================

import type { CourtSizeValue } from '@/shared/config/constants';

export interface GymFacilities {
  shower?: boolean;
  parking?: boolean;
  parking_fee?: string;
  parking_location?: string;
  court_size_type?: CourtSizeValue;
  air_conditioner?: boolean;
  water_purifier?: boolean;
  ball?: boolean;
}

export interface RecruitmentSetup {
  type: 'ANY' | 'POSITION';
  max_count?: number;
  current_count?: number; // ANY 타입용 현재 인원
  max_total?: number;
  positions?: {
    [key: string]: { max: number; current: number };
  };
  [key: string]: unknown;
}

export interface MatchOptions {
  play_style?: string;
  quarter_rule?: {
    minutes_per_quarter: number;
    quarter_count: number;
    game_count: number;
  };
  guaranteed_quarters?: number;
  referee_type?: string;
}

export interface MatchRule {
  play_style?: string;
  quarter_rule?: {
    minutes_per_quarter: number;
    quarter_count: number;
    game_count: number;
  };
  referee_type?: string;
}

/**
 * 실력 범위
 * 사용 테이블: matches (level_range)
 */
export interface LevelRange {
  min: number; // 1-7
  max: number; // 1-7
}

/**
 * 나이 범위
 * 사용 테이블: matches (age_range)
 * max가 null이면 "이상" (예: { min: 30, max: null } → "30대 이상")
 */
export interface AgeRange {
  min: number; // 20, 30, 40, 50
  max: number | null; // null = "이상"
}

export interface OperationInfo {
  type: 'PHONE' | 'KAKAO_OPEN_CHAT';
  phone?: string;
  url?: string;
  notice?: string;
}

export interface AccountInfo {
  bank?: string;
  number?: string;
  holder?: string;
}

export interface ParticipantInfo {
  type: 'MAIN' | 'GUEST';
  name: string;
  position: string;
  height?: number;
  age?: number;
  skillLevel?: number;
  [key: string]: unknown;
}

// ============================================
// Query Result Types (with relations)
// ============================================

export interface MatchWithRelations extends Match {
  gym?: Gym | null;
  team?: Team | null;
  host?: User | null;
}