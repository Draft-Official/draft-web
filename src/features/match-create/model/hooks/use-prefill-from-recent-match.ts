import { useCallback } from 'react';
import type { UseFormSetValue } from 'react-hook-form';
import type {
  GenderValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
} from '@/shared/config/match-constants';
import type { LocationData, MatchCreatePrefillDTO } from '@/features/match-create/model/types';
import type { MatchCreateSubmitFormValues } from '@/features/match-create/model/submit-form.types';
import { toMatchCreatePrefillFormData } from '@/features/match-create/model/mappers/match-create-prefill-form-data';

interface UsePrefillFromRecentMatchParams {
  setValue: UseFormSetValue<MatchCreateSubmitFormValues>;
  setLocationData: (location: LocationData | null) => void;
  setFeeType: (value: 'cost' | 'beverage') => void;
  setHasBeverage: (value: boolean) => void;
  setIsPositionMode: (value: boolean) => void;
  setPositions: (value: { guard: number; forward: number; center: number; bigman: number }) => void;
  setIsFlexBigman: (value: boolean) => void;
  setTotalCount: (value: number) => void;
  setMatchFormat: (value: MatchFormatValue) => void;
  setGender: (value: GenderValue) => void;
  setLevelMin: (value: number) => void;
  setLevelMax: (value: number) => void;
  setGameFormatType: (value: PlayStyleValue | undefined) => void;
  setRuleMinutes: (value: string) => void;
  setRuleQuarters: (value: string) => void;
  setRuleGames: (value: string) => void;
  setRefereeType: (value: RefereeTypeValue | undefined) => void;
}

export function usePrefillFromRecentMatch(params: UsePrefillFromRecentMatchParams) {
  const {
    setValue,
    setLocationData,
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
    const data = toMatchCreatePrefillFormData(match);

    if (data.location?.locationInfo) {
      setLocationData(data.location.locationInfo);
      setValue('location', data.location.gymName);
    }

    if (data.timeInfo) {
      setValue('startTime', data.timeInfo.startTime);
      setValue('duration', data.timeInfo.duration);
    }

    setValue('fee', data.pricing.fee);
    setFeeType(data.pricing.feeType);
    setHasBeverage(data.pricing.hasBeverage);

    if (data.account.bankName) setValue('bankName', data.account.bankName);
    if (data.account.accountNumber) setValue('accountNumber', data.account.accountNumber);
    if (data.account.accountHolder) setValue('accountHolder', data.account.accountHolder);

    if (data.contact) {
      setValue('operations.contactType', data.contact.contactType);
      if (data.contact.phoneNumber) {
        setValue('phoneNumber', data.contact.phoneNumber);
      }
      if (data.contact.kakaoLink) {
        setValue('kakaoLink', data.contact.kakaoLink);
      }
    }

    setValue('operations.selectedHost', data.host.selectedHost);
    if (data.host.manualTeamName) {
      setValue('manualTeamName', data.host.manualTeamName);
    }

    if (data.notice) setValue('description', data.notice);

    setIsPositionMode(data.recruitment.isPositionMode);
    setPositions(data.recruitment.positions);
    setIsFlexBigman(data.recruitment.isFlexBigman);
    setTotalCount(data.recruitment.totalCount);

    setMatchFormat(data.specs.matchFormat);
    setGender(data.specs.gender);
    setLevelMin(data.specs.levelMin ?? data.specs.level ?? 1);
    setLevelMax(data.specs.levelMax ?? data.specs.level ?? 7);

    if (data.gameFormat) {
      if (data.gameFormat.gameFormatType) {
        setGameFormatType(data.gameFormat.gameFormatType);
      }
      if (data.gameFormat.ruleMinutes) setRuleMinutes(data.gameFormat.ruleMinutes);
      if (data.gameFormat.ruleQuarters) setRuleQuarters(data.gameFormat.ruleQuarters);
      if (data.gameFormat.ruleGames) setRuleGames(data.gameFormat.ruleGames);
      if (data.gameFormat.refereeType) setRefereeType(data.gameFormat.refereeType);
    }
  }, [
    setValue,
    setLocationData,
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
