import { useCallback } from 'react';
import type {
  GenderValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
} from '@/shared/config/match-constants';
import type { LocationData, MatchCreatePrefillDTO } from '@/features/match-create/model/types';
import { MatchCreatePrefillMapper } from '@/features/match-create/mappers/match-create-prefill-mapper';

/**
 * 최근 경기 데이터를 현재 폼에 프리필하는 훅
 * 
 * @param params - 폼 관련 메서드 및 상태 setter 함수들
 * @returns fillFromRecentMatch - 최근 경기 데이터를 폼에 채우는 함수
 * 
 * @ example
 * ```tsx
 * const { fillFromRecentMatch } = usePrefillFromRecentMatch({
 *   setValue,
 *   setFeeType,
 *   setGender,
 *   //...
 * });
 * 
 * // 사용
 * const handleSelect = async (match: MatchCreatePrefillDTO) => {
 *   await fillFromRecentMatch(match);
 * };
 * ```
 */
export function usePrefillFromRecentMatch(params: {
  // react-hook-form
  setValue: (name: string, value: unknown) => void;

  // Location handler (from hook)
  handleLocationSelect: (location: LocationData) => Promise<void>;

  // State setters
  setFeeType: (v: 'cost' | 'beverage') => void;
  setHasBeverage: (v: boolean) => void;
  setIsPositionMode: (v: boolean) => void;
  setPositions: (v: { guard: number; forward: number; center: number; bigman: number }) => void;
  setIsFlexBigman: (v: boolean) => void;
  setTotalCount: (v: number) => void;
  setMatchFormat: (v: MatchFormatValue) => void;
  setGender: (v: GenderValue) => void;
  setLevelMin: (v: number) => void;
  setLevelMax: (v: number) => void;
  setGameFormatType: (v: PlayStyleValue | undefined) => void;
  setRuleMinutes: (v: string) => void;
  setRuleQuarters: (v: string) => void;
  setRuleGames: (v: string) => void;
  setRefereeType: (v: RefereeTypeValue | undefined) => void;
}) {
  const {
    setValue,
    handleLocationSelect,
    setFeeType,
    setHasBeverage,
    setIsPositionMode,
    setPositions,
    setIsFlexBigman,
    setTotalCount,
    setMatchFormat,
    setGender,
    setLevelMin,
    setLevelMax,
    setGameFormatType,
    setRuleMinutes,
    setRuleQuarters,
    setRuleGames,
    setRefereeType,
  } = params;

  const fillFromRecentMatch = useCallback(async (match: MatchCreatePrefillDTO) => {
    // Mapper 클래스 사용
    const mapper = new MatchCreatePrefillMapper(match);
    const data = mapper.toFormData();

    // 1. 날짜는 매핑하지 않음 - 사용자가 직접 선택

    // 2. 장소 정보
    if (data.location?.locationInfo) {
      await handleLocationSelect(data.location.locationInfo);
      setValue('location', data.location.gymName);
    }

    // 3. 시간 정보
    if (data.timeInfo) {
      setValue('startTime', data.timeInfo.startTime);
      setValue('duration', data.timeInfo.duration);
    }

    // 4. 가격 정보
    setValue('fee', data.pricing.fee);
    setFeeType(data.pricing.feeType);
    setHasBeverage(data.pricing.hasBeverage);

    // 5. 계좌 정보
    if (data.account.bankName) setValue('bankName', data.account.bankName);
    if (data.account.accountNumber) setValue('accountNumber', data.account.accountNumber);
    if (data.account.accountHolder) setValue('accountHolder', data.account.accountHolder);

    // 6. 연락처 정보
    if (data.contact) {
      setValue('operations.contactType', data.contact.contactType);
      if (data.contact.phoneNumber) {
        setValue('phoneNumber', data.contact.phoneNumber);
      }
      if (data.contact.kakaoLink) {
        setValue('kakaoLink', data.contact.kakaoLink);
      }
    }

    // 6.1 주최자 정보
    setValue('operations.selectedHost', data.host.selectedHost);
    if (data.host.manualTeamName) {
      setValue('manualTeamName', data.host.manualTeamName);
    }

    // 7. 공지사항
    if (data.notice) setValue('description', data.notice);

    // 8. 모집 설정
    setIsPositionMode(data.recruitment.isPositionMode);
    setPositions(data.recruitment.positions);
    setIsFlexBigman(data.recruitment.isFlexBigman);
    setTotalCount(data.recruitment.totalCount);

    // 9. 경기 스펙
    setMatchFormat(data.specs.matchFormat as MatchFormatValue);
    setGender(data.specs.gender as GenderValue);
    // Level range - use levelMin/levelMax if available, otherwise use level for both
    const levelMin = data.specs.levelMin ?? data.specs.level ?? 1;
    const levelMax = data.specs.levelMax ?? data.specs.level ?? 7;
    setLevelMin(levelMin);
    setLevelMax(levelMax);

    // 10. 경기 형식
    if (data.gameFormat) {
      if (data.gameFormat.gameFormatType) {
        setGameFormatType(data.gameFormat.gameFormatType);
      }
      if (data.gameFormat.ruleMinutes) setRuleMinutes(data.gameFormat.ruleMinutes);
      if (data.gameFormat.ruleQuarters) setRuleQuarters(data.gameFormat.ruleQuarters);
      if (data.gameFormat.ruleGames) setRuleGames(data.gameFormat.ruleGames);
      if (data.gameFormat.refereeType) setRefereeType(data.gameFormat.refereeType);
    }

    // 11. 준비물 - 현재 미사용
  }, [
    setValue,
    handleLocationSelect,
    setFeeType,
    setHasBeverage,
    setIsPositionMode,
    setPositions,
    setIsFlexBigman,
    setTotalCount,
    setMatchFormat,
    setGender,
    setLevelMin,
    setLevelMax,
    setGameFormatType,
    setRuleMinutes,
    setRuleQuarters,
    setRuleGames,
    setRefereeType,
  ]);

  return { fillFromRecentMatch };
}
