/**
 * Supabase Database 타입 정의
 *
 * ⚠️ 이 파일은 PLACEHOLDER입니다.
 * Supabase 연결 후 아래 명령어로 자동 생성된 타입으로 교체하세요:
 *
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
 *
 * 현재는 /supabase/schema.sql 기반으로 수동 작성되었습니다.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          nickname: string | null;
          avatar_url: string | null;
          height: number | null;
          position: Database['public']['Enums']['position_type'] | null;
          manner_score: number;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          height?: number | null;
          position?: Database['public']['Enums']['position_type'] | null;
          manner_score?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          height?: number | null;
          position?: Database['public']['Enums']['position_type'] | null;
          manner_score?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          host_id: string;
          title: string;
          description: string | null;
          location_name: string;
          location_address: string | null;
          start_time: string;
          end_time: string | null;
          fee: number;
          max_guards: number;
          max_forwards: number;
          max_centers: number;
          vacancy_guards: number;
          vacancy_forwards: number;
          vacancy_centers: number;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          host_id: string;
          title: string;
          description?: string | null;
          location_name: string;
          location_address?: string | null;
          start_time: string;
          end_time?: string | null;
          fee?: number;
          max_guards?: number;
          max_forwards?: number;
          max_centers?: number;
          vacancy_guards?: number;
          vacancy_forwards?: number;
          vacancy_centers?: number;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          host_id?: string;
          title?: string;
          description?: string | null;
          location_name?: string;
          location_address?: string | null;
          start_time?: string;
          end_time?: string | null;
          fee?: number;
          max_guards?: number;
          max_forwards?: number;
          max_centers?: number;
          vacancy_guards?: number;
          vacancy_forwards?: number;
          vacancy_centers?: number;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'matches_host_id_fkey';
            columns: ['host_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
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
            referencedRelation: 'profiles';
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
      application_status:
        | 'pending_payment'
        | 'verification_pending'
        | 'confirmed'
        | 'rejected'
        | 'cancelled'
        | 'noshow';
      position_type: 'guard' | 'forward' | 'center';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// 편의를 위한 타입 별칭
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];

// Row 타입 별칭
export type Profile = Tables<'profiles'>;
export type Match = Tables<'matches'>;
export type Application = Tables<'applications'>;

// Insert 타입 별칭
export type ProfileInsert = TablesInsert<'profiles'>;
export type MatchInsert = TablesInsert<'matches'>;
export type ApplicationInsert = TablesInsert<'applications'>;

// Update 타입 별칭
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type MatchUpdate = TablesUpdate<'matches'>;
export type ApplicationUpdate = TablesUpdate<'applications'>;

// Enum 타입 별칭
export type ApplicationStatus = Enums<'application_status'>;
export type PositionType = Enums<'position_type'>;
