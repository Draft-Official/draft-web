import { useCallback } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { toast } from 'sonner';
import type { MatchWithRelations } from '@/shared/types/database.types';
import type { GenderValue } from '@/shared/config/match-constants';
import { MatchToPrefillMapper } from '@/features/match-create/mappers/match-to-prefill-mapper';

/**
 * 최근 경기 데이터를 현재 폼에 프리필하는 훅
 * 
 * @param params - 폼 관련 메서드 및 상태 setter 함수들
 * @returns fillFromRecentMatch - 최근 경기 데이터를 폼에 채우는 함수
 * 
 * @ example
 * ```tsx
 * const { fillFromRecentMatch } = useRecentMatchPrefill({
 *   setValue,
 *   setFeeType,
 *   setGender,
 *   //...
 * });
 * 
 * // 사용
 * const handleSelect = async (match: MatchWithRelations) => {
 *   await fillFromRecentMatch(match);
 * };
 * ```
 */
export function useRecentMatchPrefill(params: {
  // react-hook-form
  setValue: UseFormReturn<any>['setValue'];
  
  // Location handler (from hook)
  handleLocationSelect: (location: any) => Promise<void>;
  
  // State setters
  setFeeType: (v: 'cost' | 'beverage') => void;
  setHasBeverage: (v: boolean) => void;
  setIsPositionMode: (v: boolean) => void;
  setPositions: (v: { guard: number; forward: number; center: number; bigman: number }) => void;
  setIsFlexBigman: (v: boolean) => void;
  setTotalCount: (v: number) => void;
  setMatchType: (v: string) => void;
  setGender: (v: GenderValue) => void;
  setLevel: (v: number) => void;
  setGameFormatType: (v: any) => void;
  setRuleMinutes: (v: string) => void;
  setRuleQuarters: (v: string) => void;
  setRuleGames: (v: string) => void;
  setGuaranteedQuarters: (v: string) => void;
  setRefereeType: (v: any) => void;
  setHasShoes: (v: boolean) => void;
  setHasJersey: (v: boolean) => void;
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
    setMatchType,
    setGender,
    setLevel,
    setGameFormatType,
    setRuleMinutes,
    setRuleQuarters,
    setRuleGames,
    setGuaranteedQuarters,
    setRefereeType,
    setHasShoes,
    setHasJersey,
  } = params;

  const fillFromRecentMatch = useCallback(async (match: MatchWithRelations) => {
    // Mapper 클래스 사용
    const mapper = new MatchToPrefillMapper(match);
    const data = mapper.toFormData();

    // 1. 날짜는 매핑하지 않음 - 사용자가 직접 선택

    // 2. 장소 정보
    if (data.location) {
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

    // 7. 공지사항
    if (data.notice) setValue('description', data.notice);

    // 8. 모집 설정
    setIsPositionMode(data.recruitment.isPositionMode);
    setPositions(data.recruitment.positions);
    setIsFlexBigman(data.recruitment.isFlexBigman);
    setTotalCount(data.recruitment.totalCount);

    // 9. 경기 스펙
    setMatchType(data.specs.matchType);
    setGender(data.specs.gender as GenderValue);
    setLevel(data.specs.level);

    // 10. 경기 형식
    if (data.gameFormat) {
      if (data.gameFormat.gameFormatType) {
        setGameFormatType(data.gameFormat.gameFormatType);
      }
      if (data.gameFormat.ruleMinutes) setRuleMinutes(data.gameFormat.ruleMinutes);
      if (data.gameFormat.ruleQuarters) setRuleQuarters(data.gameFormat.ruleQuarters);
      if (data.gameFormat.ruleGames) setRuleGames(data.gameFormat.ruleGames);
      if (data.gameFormat.guaranteedQuarters) setGuaranteedQuarters(data.gameFormat.guaranteedQuarters);
      if (data.gameFormat.refereeType) setRefereeType(data.gameFormat.refereeType);
    }

    // 11. 준비물
    setHasShoes(data.requirements.hasShoes);
    setHasJersey(data.requirements.hasJersey);

    // 12. Toast 메시지
    toast.success("지난 경기 정보를 불러왔습니다. 경기 날짜를 선택해주세요.");
  }, [
    setValue,
    handleLocationSelect,
    setFeeType,
    setHasBeverage,
    setIsPositionMode,
    setPositions,
    setIsFlexBigman,
    setTotalCount,
    setMatchType,
    setGender,
    setLevel,
    setGameFormatType,
    setRuleMinutes,
    setRuleQuarters,
    setRuleGames,
    setGuaranteedQuarters,
    setRefereeType,
    setHasShoes,
    setHasJersey,
  ]);

  return { fillFromRecentMatch };
}
