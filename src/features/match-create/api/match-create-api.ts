import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/database.types';
import {
  toMatchInsertDataV3,
  extractGymDataV3,
} from './match-create-mapper';
import type { MatchCreateFormData } from '@/features/match-create/model/form-data.types';
import { createGymService } from '@/entities/gym';
import { logRequest, logResponse, logSupabaseQuery, logSupabaseResult } from '@/shared/lib/logger';
import { handleSupabaseError, ValidationError } from '@/shared/lib/errors';
import { normalizePhoneNumber, PHONE_REGEX } from '@/shared/lib/phone-utils';

export class MatchCreateService {
  private readonly SERVICE_NAME = 'MatchCreateService';

  constructor(private supabase: SupabaseClient<Database>) {}

  private async assertPhoneVerified(
    userId: string,
    actionLabel: string
  ): Promise<{ phone: string | null }> {
    const { data, error } = await this.supabase
      .from('users')
      .select('phone_verified, phone')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      handleSupabaseError(error, '사용자 인증 정보');
    }

    if (!data?.phone_verified) {
      throw new ValidationError(`전화번호 인증 후 ${actionLabel}이 가능합니다.`);
    }

    return { phone: data.phone };
  }

  private resolveVerifiedPhone(phone: string | null, actionLabel: string): string {
    const normalizedPhone = normalizePhoneNumber(phone || '');
    if (!PHONE_REGEX.test(normalizedPhone)) {
      throw new ValidationError(`인증된 전화번호 정보가 없어 ${actionLabel}이 불가능합니다.`);
    }
    return normalizedPhone;
  }

  private applyVerifiedPhoneContact(
    form: MatchCreateFormData,
    verifiedPhone: string
  ): MatchCreateFormData {
    return {
      ...form,
      contactType: 'PHONE',
      contactContent: verifiedPhone,
    };
  }

  /**
   * Form → DB 데이터 준비 (Gym upsert + Match 매핑 + Team Name 보정)
   */
  private async prepareMatchData(
    hostId: string,
    form: MatchCreateFormData,
    verifiedPhone: string
  ) {
    const gymService = createGymService(this.supabase);
    const normalizedForm = this.applyVerifiedPhoneContact(form, verifiedPhone);
    const gymId = await gymService.upsertGym(extractGymDataV3(normalizedForm));
    const matchData = toMatchInsertDataV3(hostId, normalizedForm, gymId);

    // Team Name 보정
    if (matchData.manual_team_name === '' && matchData.team_id) {
      logSupabaseQuery('teams', 'SELECT', undefined, { id: matchData.team_id });

      const { data: team, error: teamError } = await this.supabase
        .from('teams')
        .select('name')
        .eq('id', matchData.team_id)
        .single();

      logSupabaseResult('teams', 'SELECT', team, teamError);
      matchData.manual_team_name = team ? team.name : 'Unknown Team';
    } else if (matchData.manual_team_name === '') {
      matchData.manual_team_name = '개인 주최';
    }

    return { matchData, gymId };
  }

  /**
   * 경기 생성
   */
  async createMatch(hostId: string, form: MatchCreateFormData) {
    logRequest(this.SERVICE_NAME, 'createMatch', { hostId, form });

    try {
      const { phone } = await this.assertPhoneVerified(hostId, '경기 생성');
      const verifiedPhone = this.resolveVerifiedPhone(phone, '경기 생성');
      const { matchData, gymId } = await this.prepareMatchData(hostId, form, verifiedPhone);

      logSupabaseQuery('matches', 'INSERT', matchData);
      const { data: match, error } = await this.supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single();

      logSupabaseResult('matches', 'INSERT', match, error);
      if (error) throw error;

      logResponse(this.SERVICE_NAME, 'createMatch', { matchId: match.id, gymId });
      return match;
    } catch (error) {
      logResponse(this.SERVICE_NAME, 'createMatch', undefined, error);
      throw error;
    }
  }

  /**
   * 경기 수정
   */
  async updateMatch(matchId: string, hostId: string, form: MatchCreateFormData) {
    logRequest(this.SERVICE_NAME, 'updateMatch', { matchId, hostId, form });

    try {
      const verifiedPhone = this.resolveVerifiedPhone(
        (await this.assertPhoneVerified(hostId, '경기 수정')).phone,
        '경기 수정'
      );

      const { matchData, gymId } = await this.prepareMatchData(hostId, form, verifiedPhone);
      const { status, ...updateData } = matchData; // 수정 시 기존 상태 유지
      void status;

      logSupabaseQuery('matches', 'UPDATE', updateData, { id: matchId });
      const { data: match, error } = await this.supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchId)
        .eq('host_id', hostId)
        .select()
        .single();

      logSupabaseResult('matches', 'UPDATE', match, error);
      if (error) throw error;

      logResponse(this.SERVICE_NAME, 'updateMatch', { matchId: match.id, gymId });
      return match;
    } catch (error) {
      logResponse(this.SERVICE_NAME, 'updateMatch', undefined, error);
      throw error;
    }
  }
}

export function createMatchCreateService(supabase: SupabaseClient<Database>) {
  return new MatchCreateService(supabase);
}
