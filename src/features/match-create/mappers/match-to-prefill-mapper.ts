import type { MatchWithRelations, AccountInfo, OperationInfo, MatchRule } from '@/shared/types/database.types';
import type { LocationData } from '@/features/match-create/model/types';

/**
 * 기존 경기 데이터를 폼 프리필용 데이터로 변환하는 Mapper 클래스
 * 
 * @example
 * ```ts
 * const mapper = new MatchToPrefillMapper(recentMatch);
 * const prefillData = mapper.toFormData();
 * 
 * // 개별로 원하는 데이터만 추출
 * const locationInfo = mapper.mapLocation();
 * const timeInfo = mapper.mapTimeInfo();
 * ```
 */
export class MatchToPrefillMapper {
  constructor(private match: MatchWithRelations) {}

  /**
   * 전체 폼 데이터를 반환
   */
  toFormData() {
    return {
      location: this.mapLocation(),
      timeInfo: this.mapTimeInfo(),
      pricing: this.mapPricing(),
      account: this.mapAccount(),
      contact: this.mapContact(),
      host: this.mapHost(),
      notice: this.mapNotice(),
      recruitment: this.mapRecruitment(),
      specs: this.mapSpecs(),
      gameFormat: this.mapGameFormat(),
      requirements: this.mapRequirements(),
    };
  }

  /**
   * 장소 정보 매핑
   */
  mapLocation(): { locationInfo: LocationData | null; gymName: string } | null {
    const gymData = this.match.gym;
    if (!gymData) return null;

    const locationInfo: LocationData = {
      address: gymData.address,
      buildingName: gymData.name,
      placeUrl: '',
      x: String(gymData.longitude),
      y: String(gymData.latitude),
      kakaoPlaceId: gymData.kakao_place_id || '',
    };

    return {
      locationInfo,
      gymName: gymData.name,
    };
  }

  /**
   * 시간 정보 매핑
   */
  mapTimeInfo(): { startTime: string; duration: string } | null {
    if (!this.match.start_time || !this.match.end_time) return null;

    const startDate = new Date(this.match.start_time);
    const endDate = new Date(this.match.end_time);
    const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;

    // duration 계산
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);

    return {
      startTime,
      duration: String(durationHours),
    };
  }

  /**
   * 가격 정보 매핑
   */
  mapPricing() {
    return {
      fee: String(this.match.cost_amount || 0),
      feeType: this.match.cost_type === 'BEVERAGE' ? 'beverage' as const : 'cost' as const,
      hasBeverage: this.match.provides_beverage || false,
    };
  }

  /**
   * 계좌 정보 매핑
   */
  mapAccount() {
    const accountInfo = this.match.account_info as AccountInfo | null;
    return {
      bankName: accountInfo?.bank || '',
      accountNumber: accountInfo?.number || '',
      accountHolder: accountInfo?.holder || '',
    };
  }

  /**
   * 연락처 정보 매핑
   */
  mapContact() {
    const operationInfo = this.match.operation_info as OperationInfo | null;
    if (!operationInfo?.type) return null;

    return {
      contactType: operationInfo.type,
      phoneNumber: operationInfo.type === 'PHONE' ? (operationInfo.phone || '') : '',
      kakaoLink: operationInfo.type === 'KAKAO_OPEN_CHAT' ? (operationInfo.url || '') : '',
    };
  }

  /**
   * 주최자 정보 매핑
   */
  mapHost() {
    return {
      selectedHost: this.match.team_id || 'me',
    };
  }

  /**
   * 공지사항 매핑
   */
  mapNotice() {
    const operationInfo = this.match.operation_info as OperationInfo | null;
    return operationInfo?.notice || '';
  }

  /**
   * 모집 설정 매핑
   */
  mapRecruitment() {
    const recruitment = this.match.recruitment_setup as any;

    if (recruitment?.type === 'POSITION') {
      const pos = recruitment.positions || {};
      return {
        isPositionMode: true,
        positions: {
          guard: pos.G?.max || 0,
          forward: pos.F?.max || 0,
          center: pos.C?.max || 0,
          bigman: pos.B?.max || 0,
        },
        isFlexBigman: (pos.B?.max || 0) > 0,
        totalCount: 1, // 사용 안함
      };
    } else {
      return {
        isPositionMode: false,
        positions: { guard: 0, forward: 0, center: 0, bigman: 0 },
        isFlexBigman: false,
        totalCount: recruitment?.max_count || 1,
      };
    }
  }

  /**
   * 경기 스펙 매핑
   */
  mapSpecs() {
    return {
      matchFormat: this.match.match_format || 'FIVE_ON_FIVE',
      gender: (this.match.gender_rule || 'MALE'),
      level: Number(this.match.level_limit) || 4,
    };
  }

  /**
   * 경기 형식 매핑
   */
  mapGameFormat() {
    const matchRule = this.match.match_rule as MatchRule | null;

    if (!matchRule) return null;

    return {
      gameFormatType: matchRule.play_style || null,
      ruleMinutes: matchRule.quarter_rule ? String(matchRule.quarter_rule.minutes_per_quarter || 8) : '',
      ruleQuarters: matchRule.quarter_rule ? String(matchRule.quarter_rule.quarter_count || 4) : '',
      ruleGames: matchRule.quarter_rule ? String(matchRule.quarter_rule.game_count || 2) : '',
      guaranteedQuarters: matchRule.guaranteed_quarters ? String(matchRule.guaranteed_quarters) : '',
      refereeType: matchRule.referee_type || null,
    };
  }

  /**
   * 준비물 매핑
   */
  mapRequirements() {
    const reqs = this.match.requirements || [];
    return {
      hasShoes: reqs.includes('INDOOR_SHOES'),
      hasJersey: reqs.includes('WHITE_BLACK_JERSEY'),
    };
  }
}
