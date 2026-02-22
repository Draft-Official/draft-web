'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/shared/ui/shadcn/sonner';
import {
  GENDER_DEFAULT,
  MATCH_FORMAT_DEFAULT,
  GenderValue,
  PlayStyleValue,
  RefereeTypeValue,
  MatchFormatValue,
} from '@/shared/config/match-constants';
import type { GymFacilities } from '@/shared/types/jsonb.types';
import type { LocationData } from '@/shared/types/location.types';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';
import { useMatchCreateBootstrap, useMatchEditPrefill, useMyRecentMatches } from '@/features/match-create/api/queries';
import type { RecentMatchListItemDTO } from '@/features/match-create/model/types';
import type { MatchCreateSubmitFormValues } from '@/features/match-create/model/submit-form.types';
import { useMatchCreateFacilities } from '@/features/match-create/model/hooks/use-match-create-facilities';
import { useMatchCreateEditPrefillLoader } from '@/features/match-create/model/hooks/use-match-create-edit-prefill-loader';
import { useMatchCreateSubmit } from '@/features/match-create/model/hooks/use-match-create-submit';
import { usePrefillFromRecentMatch } from '@/features/match-create/model/hooks/use-prefill-from-recent-match';
import { nextSelectedAges } from '@/features/match-create/lib/age-range';
import { getNext14Days } from '@/features/match-create/lib/utils';

export function useMatchCreateViewModel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMatchId = searchParams?.get('edit') ?? null;
  const isEditMode = !!editMatchId;

  const methods = useForm<MatchCreateSubmitFormValues>();
  const { setValue } = methods;

  const [selectedDate, setSelectedDate] = useState<string | null>(() => getNext14Days()[0]?.dateISO ?? null);

  const [isPositionMode, setIsPositionMode] = useState(false);
  const [isFlexBigman, setIsFlexBigman] = useState(false);
  const [positions, setPositions] = useState({ guard: 0, forward: 0, center: 0, bigman: 0 });
  const [totalCount, setTotalCount] = useState(1);

  const [matchFormat, setMatchFormat] = useState<MatchFormatValue>(MATCH_FORMAT_DEFAULT);
  const [gender, setGender] = useState<GenderValue>(GENDER_DEFAULT);
  const [levelMin, setLevelMin] = useState(1);
  const [levelMax, setLevelMax] = useState(7);
  const [selectedAges, setSelectedAges] = useState<string[]>(['any']);

  const [gameFormatType, setGameFormatType] = useState<PlayStyleValue | undefined>(undefined);
  const [isGameFormatSelected, setIsGameFormatSelected] = useState(false);
  const [ruleMinutes, setRuleMinutes] = useState('8');
  const [ruleQuarters, setRuleQuarters] = useState('4');
  const [ruleGames, setRuleGames] = useState('2');
  const [isRulesSelected, setIsRulesSelected] = useState(false);
  const [refereeType, setRefereeType] = useState<RefereeTypeValue | undefined>(undefined);
  const [isRefereeSelected, setIsRefereeSelected] = useState(false);

  const [feeType, setFeeType] = useState<'cost' | 'beverage'>('cost');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isExistingGym, setIsExistingGym] = useState(false);
  const [gymFacilities, setGymFacilities] = useState<GymFacilities | null>(null);

  const { data: bootstrapData } = useMatchCreateBootstrap();
  const currentUser = bootstrapData?.user ?? null;
  const myTeams = bootstrapData?.teams ?? [];

  const [showRecentMatchesDialog, setShowRecentMatchesDialog] = useState(false);
  const [isApplyingRecentPrefill, setIsApplyingRecentPrefill] = useState(false);
  const { data: recentMatches, isLoading: isLoadingRecentMatches } = useMyRecentMatches();
  const { data: editPrefillData, isLoading: isLoadingEditPrefill } = useMatchEditPrefill(isEditMode ? editMatchId : null);

  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const isHidden = localStorage.getItem('hideMatchCreateTip');
    if (!isHidden) {
      setShowTip(true);
    }
  }, []);

  const handleDismissTip = () => {
    setShowTip(false);
    localStorage.setItem('hideMatchCreateTip', 'true');
  };

  const handleLocationResolvedChange = useCallback((next: LocationSearchResolvedValue) => {
    setLocationData(next.locationData);
    setIsExistingGym(next.isExistingGym);
    setGymFacilities(next.gymFacilities);
  }, []);

  const {
    parkingCost,
    setParkingCost,
    parkingDetail,
    setParkingDetail,
    hasWater,
    setHasWater,
    hasAcHeat,
    setHasAcHeat,
    hasBall,
    setHasBall,
    hasBeverage,
    setHasBeverage,
    hasShower,
    setHasShower,
    courtSize,
    setCourtSize,
  } = useMatchCreateFacilities({
    gymFacilities,
    isExistingGym,
  });

  const calendarDates = useMemo(() => getNext14Days(), []);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const updatePosition = (pos: keyof typeof positions, delta: number) => {
    setPositions(prev => ({
      ...prev,
      [pos]: Math.max(0, prev[pos] + delta),
    }));
  };

  const updateTotalCount = (delta: number) => {
    setTotalCount(prev => Math.max(1, prev + delta));
  };

  const handleAgeRangeUpdate = (newAges: string[]) => {
    setSelectedAges(newAges);
  };

  const handleAgeSelection = (age: string) => {
    setSelectedAges((prev) => nextSelectedAges(prev, age));
  };

  const handleLevelChange = (min: number, max: number) => {
    setLevelMin(min);
    setLevelMax(max);
  };

  const resolveLocation = useCallback(async (location: LocationData) => {
    setLocationData(location);

    if (!location.kakaoPlaceId) {
      setIsExistingGym(false);
      setGymFacilities(null);
      return;
    }

    try {
      const { lookupGymByKakaoPlaceId } = await import('@/entities/gym');
      const existingGym = await lookupGymByKakaoPlaceId(location.kakaoPlaceId);

      if (existingGym?.facilities) {
        setIsExistingGym(true);
        setGymFacilities(existingGym.facilities);
      } else {
        setIsExistingGym(false);
        setGymFacilities(null);
      }
    } catch (error) {
      console.error('Gym lookup error during prefill:', error);
      setIsExistingGym(false);
      setGymFacilities(null);
    }
  }, []);

  const { fillFromRecentMatch } = usePrefillFromRecentMatch({
    setValue,
    resolveLocation,
    setFeeType,
    setHasBeverage,
    setIsPositionMode,
    setPositions,
    setIsFlexBigman,
    setTotalCount,
    setMatchFormat: setMatchFormat,
    setGender,
    setLevelMin,
    setLevelMax,
    setGameFormatType,
    setRuleMinutes,
    setRuleQuarters,
    setRuleGames,
    setRefereeType,
  });

  const { isApplyingEditData } = useMatchCreateEditPrefillLoader({
    isEditMode,
    editPrefillData,
    fillFromRecentMatch,
    setSelectedDate,
  });
  const isLoadingEditData = isEditMode && (isLoadingEditPrefill || isApplyingEditData);

  const { isPending, onSubmit } = useMatchCreateSubmit({
    isEditMode,
    editMatchId,
    selectedDate,
    locationData,
    recruitment: {
      isPositionMode,
      isFlexBigman,
      positions,
      totalCount,
    },
    matchSpec: {
      matchFormat,
      gameFormatType,
      isGameFormatSelected,
      levelMin,
      levelMax,
      gender,
      selectedAges,
      isRulesSelected,
      ruleMinutes,
      ruleQuarters,
      ruleGames,
      refereeType,
      isRefereeSelected,
    },
    facilities: {
      feeType,
      parkingCost,
      parkingDetail,
      hasWater,
      hasAcHeat,
      hasShower,
      courtSize,
      hasBall,
      hasBeverage,
    },
    currentUserId: currentUser?.id,
    onSuccessNavigate: (publicId?: string) => {
      if (isEditMode) {
        router.back();
      } else {
        router.replace(publicId ? `/m/${publicId}` : '/');
      }
    },
  });

  const onBack = () => router.back();

  const handleSelectRecentMatch = async (match: RecentMatchListItemDTO) => {
    setIsApplyingRecentPrefill(true);
    try {
      await fillFromRecentMatch(match);
      toast.success('지난 경기 정보를 불러왔습니다. 경기 날짜를 선택해주세요.');
      setShowRecentMatchesDialog(false);
    } finally {
      setIsApplyingRecentPrefill(false);
    }
  };

  return {
    methods,
    isEditMode,
    editMatchId,
    isLoadingEditData,
    showTip,
    handleDismissTip,
    onBack,

    selectedDate,
    setSelectedDate,
    calendarDates,

    locationData,
    isExistingGym,
    handleLocationResolvedChange,
    handleInputFocus,

    feeType,
    setFeeType,
    hasBeverage,
    setHasBeverage,

    hasWater,
    setHasWater,
    hasAcHeat,
    setHasAcHeat,
    hasBall,
    setHasBall,
    parkingCost,
    setParkingCost,
    parkingDetail,
    setParkingDetail,
    hasShower,
    setHasShower,
    courtSize,
    setCourtSize,

    isPositionMode,
    setIsPositionMode,
    isFlexBigman,
    setIsFlexBigman,
    positions,
    updatePosition,
    totalCount,
    updateTotalCount,

    matchFormat,
    setMatchFormat,
    gender,
    setGender,
    levelMin,
    levelMax,
    handleLevelChange,
    selectedAges,
    handleAgeSelection,
    handleAgeRangeUpdate,

    gameFormatType,
    setGameFormatType,
    isGameFormatSelected,
    setIsGameFormatSelected,
    ruleMinutes,
    setRuleMinutes,
    ruleQuarters,
    setRuleQuarters,
    ruleGames,
    setRuleGames,
    isRulesSelected,
    setIsRulesSelected,
    refereeType,
    setRefereeType,
    isRefereeSelected,
    setIsRefereeSelected,

    currentUser,
    myTeams,

    isPending,
    isApplyingRecentPrefill,
    onSubmit,

    showRecentMatchesDialog,
    setShowRecentMatchesDialog,
    recentMatches,
    isLoadingRecentMatches,
    handleSelectRecentMatch,
  };
}
