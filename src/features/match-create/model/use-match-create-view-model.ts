'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  GENDER_DEFAULT,
  MATCH_FORMAT_DEFAULT,
  GenderValue,
  PlayStyleValue,
  RefereeTypeValue,
  CourtSizeValue,
  MatchFormatValue,
} from '@/shared/config/match-constants';
import { useLocationSearch } from '@/shared/lib/hooks/use-location-search';
import { useCreateMatch, useSaveMatchCreateDefaults, useUpdateMatch } from '@/features/match-create/api/mutations';
import { useMatchCreateBootstrap, useMatchEditPrefill, useMyRecentMatches } from '@/features/match-create/api/queries';
import type { RecentMatchListItemDTO } from '@/features/match-create/model/types';
import type { MatchCreateSubmitFormValues } from '@/features/match-create/model/submit-form.types';
import { usePrefillFromRecentMatch } from '@/features/match-create/model/hooks/use-prefill-from-recent-match';
import { nextSelectedAges } from '@/features/match-create/lib/age-range';
import { buildMatchCreatePayload, validateMatchCreateSubmit } from '@/features/match-create/lib/submit';
import { getNext14Days } from '@/features/match-create/lib/utils';

export function useMatchCreateViewModel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMatchId = searchParams?.get('edit');
  const isEditMode = !!editMatchId;

  const methods = useForm<MatchCreateSubmitFormValues>();
  const { setValue, formState: { errors } } = methods;

  const [isApplyingEditData, setIsApplyingEditData] = useState(false);
  const [editDataLoaded, setEditDataLoaded] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('[Form Errors]', errors);
    }
  }, [errors]);

  const [selectedDate, setSelectedDate] = useState<string | null>(() => getNext14Days()[0].dateISO);

  const [isPositionMode, setIsPositionMode] = useState(false);
  const [isFlexBigman, setIsFlexBigman] = useState(false);
  const [positions, setPositions] = useState({ guard: 0, forward: 0, center: 0, bigman: 0 });
  const [totalCount, setTotalCount] = useState(1);

  const [parkingCost, setParkingCost] = useState<string>('');
  const [parkingDetail, setParkingDetail] = useState('');
  const [hasWater, setHasWater] = useState(false);
  const [hasAcHeat, setHasAcHeat] = useState(false);
  const [hasBall, setHasBall] = useState(false);
  const [hasBeverage, setHasBeverage] = useState(false);
  const [hasShower, setHasShower] = useState(false);
  const [courtSize, setCourtSize] = useState<CourtSizeValue | ''>('');

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

  const { data: bootstrapData } = useMatchCreateBootstrap();
  const currentUser = bootstrapData?.user ?? null;
  const myTeams = bootstrapData?.teams ?? [];

  const [showRecentMatchesDialog, setShowRecentMatchesDialog] = useState(false);
  const { data: recentMatches, isLoading: isLoadingRecentMatches } = useMyRecentMatches();
  const { data: editPrefillData, isLoading: isLoadingEditPrefill } = useMatchEditPrefill(isEditMode ? editMatchId : null);
  const isLoadingEditData = isEditMode && (isLoadingEditPrefill || isApplyingEditData);

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

  const {
    location,
    locationData,
    searchResults: locationSearchResults,
    isDropdownOpen: showLocationDropdown,
    isExistingGym,
    gymFacilities,
    handleSearch: handleLocationSearch,
    handleSelect: handleLocationSelect,
    handleClear: handleClearLocation,
    openKakaoMap,
  } = useLocationSearch();

  const calendarDates = useMemo(() => getNext14Days(), []);

  useEffect(() => {
    if (gymFacilities) {
      setHasBall(gymFacilities.ball ?? false);
      setHasWater(gymFacilities.water_purifier ?? false);
      setHasAcHeat(gymFacilities.air_conditioner ?? false);
      setHasShower(gymFacilities.shower ?? false);

      if (gymFacilities.parking) {
        let parkingFee = gymFacilities.parking_fee ?? '0';
        if (parkingFee === '무료') {
          parkingFee = '0';
        }
        setParkingCost(parkingFee);
      } else {
        setParkingCost('');
      }
      setParkingDetail(gymFacilities.parking_location ?? '');

      if (gymFacilities.court_size_type) {
        setCourtSize(gymFacilities.court_size_type);
      } else {
        setCourtSize('');
      }
    } else if (gymFacilities === null && isExistingGym === false) {
      setHasBall(false);
      setHasWater(false);
      setHasAcHeat(false);
      setHasShower(false);
      setParkingCost('');
      setParkingDetail('');
      setCourtSize('');
    }
  }, [gymFacilities, isExistingGym]);

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const { fillFromRecentMatch } = usePrefillFromRecentMatch({
    setValue,
    handleLocationSelect,
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

  useEffect(() => {
    const loadEditData = async () => {
      if (!isEditMode || !editPrefillData || editDataLoaded) return;

      setIsApplyingEditData(true);
      try {
        await fillFromRecentMatch(editPrefillData);

        if (editPrefillData.startTimeISO) {
          const dateISO = editPrefillData.startTimeISO.split('T')[0];
          setSelectedDate(dateISO);
        }

        setEditDataLoaded(true);
      } catch (error) {
        console.error('Failed to load match data:', error);
        toast.error('경기 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsApplyingEditData(false);
      }
    };

    loadEditData();
  }, [isEditMode, editPrefillData, editDataLoaded, fillFromRecentMatch]);

  const { mutate: createMatch, isPending: isCreating } = useCreateMatch();
  const { mutate: updateMatch, isPending: isUpdating } = useUpdateMatch();
  const { mutateAsync: saveMatchCreateDefaults } = useSaveMatchCreateDefaults();
  const isPending = isCreating || isUpdating;

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const onSubmit = async (data: MatchCreateSubmitFormValues) => {
    const validationResult = validateMatchCreateSubmit({
      form: data,
      selectedDate,
      locationData,
      isPositionMode,
      positions,
      totalCount,
    });

    if (!validationResult.ok) {
      toast.error(validationResult.error.message);
      scrollToSection(validationResult.error.sectionId);
      return;
    }

    if (!selectedDate) return;

    const {
      locationData: selectedLocationData,
      opsHost,
      normalizedContactType,
      opsContactContent,
    } = validationResult.data;

    const payload = buildMatchCreatePayload({
      form: data,
      selectedDate,
      locationData: selectedLocationData,
      feeType,
      isPositionMode,
      isFlexBigman,
      positions,
      totalCount,
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
      parkingCost,
      parkingDetail,
      hasWater,
      hasAcHeat,
      hasShower,
      courtSize,
      hasBall,
      hasBeverage,
      opsHost,
      normalizedContactType,
      opsContactContent,
    });

    const handleSuccess = async () => {
      if (data.operations?.saveAsDefault && currentUser?.id) {
        try {
          await saveMatchCreateDefaults({
            userId: currentUser.id,
            selectedHost: opsHost,
            accountInfo: {
              bank: data.bankName || '',
              number: data.accountNumber || '',
              holder: data.accountHolder || '',
            },
            contactInfo: {
              type: normalizedContactType,
              content: opsContactContent,
            },
            hostNotice: data.description || '',
          });
        } catch (saveDefaultsError) {
          console.error('Failed to save defaults:', saveDefaultsError);
        }
      }

      if (isEditMode) {
        router.back();
      } else {
        router.push('/');
      }
    };

    const handleError = (err: Error) => {
      console.error(err);
      toast.error(isEditMode ? `경기 수정에 실패했습니다: ${err.message}` : `경기 생성에 실패했습니다: ${err.message}`);
    };

    if (isEditMode && editMatchId) {
      updateMatch(
        { matchId: editMatchId, form: payload },
        { onSuccess: handleSuccess, onError: handleError }
      );
    } else {
      createMatch(payload, { onSuccess: handleSuccess, onError: handleError });
    }
  };

  const locationDivRef = useRef<HTMLDivElement>(null);

  const onBack = () => router.back();

  const handleSelectRecentMatch = async (match: RecentMatchListItemDTO) => {
    await fillFromRecentMatch(match);
    toast.success('지난 경기 정보를 불러왔습니다. 경기 날짜를 선택해주세요.');
    setShowRecentMatchesDialog(false);
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

    location,
    locationData,
    locationSearchResults,
    showLocationDropdown,
    isExistingGym,
    handleLocationSearch,
    handleLocationSelect,
    handleClearLocation,
    openKakaoMap,
    handleInputFocus,
    locationDivRef,

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
    onSubmit,

    showRecentMatchesDialog,
    setShowRecentMatchesDialog,
    recentMatches,
    isLoadingRecentMatches,
    handleSelectRecentMatch,
  };
}
