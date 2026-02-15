'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  GENDER_DEFAULT,
  COURT_SIZE_DEFAULT,
  MATCH_FORMAT_DEFAULT,
  GenderValue,
  PlayStyleValue,
  RefereeTypeValue,
  CourtSizeValue,
  MatchFormatValue,
} from '@/shared/config/match-constants';
import { useCreateMatch, useSaveMatchCreateDefaults, useUpdateMatch } from '@/features/match-create/api/mutations';
import { useMatchCreateBootstrap, useMatchEditPrefill, useMyRecentMatches } from '@/features/match-create/api/queries';
import type { MatchCreateFormData, } from '@/features/match-create/model/schema';
import type { RecentMatchListItemDTO } from '@/features/match-create/model/types';
import { useLocationSearch } from '@/features/match-create/lib/hooks/use-location-search';
import { usePrefillFromRecentMatch } from '@/features/match-create/lib/hooks/use-prefill-from-recent-match';
import { getNext14Days } from '@/features/match-create/lib/utils';

const AGE_VALUE_MAP_GLOBAL: Record<string, number> = { '20': 20, '30': 30, '40': 40, '50+': 50 };

function convertSelectedAgesToRange(selectedAges: string[]): { min: number; max: number | null } | undefined {
  if (selectedAges.length === 0 || selectedAges.includes('any')) {
    return undefined;
  }

  const sortedAges = [...selectedAges].sort(
    (a, b) => (AGE_VALUE_MAP_GLOBAL[a] || 0) - (AGE_VALUE_MAP_GLOBAL[b] || 0)
  );

  const firstAge = sortedAges[0];
  const lastAge = sortedAges[sortedAges.length - 1];

  const min = AGE_VALUE_MAP_GLOBAL[firstAge] || 20;
  const max = lastAge === '50+' ? null : (AGE_VALUE_MAP_GLOBAL[lastAge] || null);

  return { min, max };
}

export function useMatchCreateViewModel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMatchId = searchParams?.get('edit');
  const isEditMode = !!editMatchId;

  const methods = useForm();
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

  const AGE_VALUE_MAP: Record<string, number> = { '20': 20, '30': 30, '40': 40, '50+': 50 };
  const AGE_ORDER = ['20', '30', '40', '50+'];

  const handleAgeSelection = (age: string) => {
    if (age === 'any') {
      setSelectedAges(['any']);
      return;
    }

    if (selectedAges.includes('any')) {
      setSelectedAges([age]);
      return;
    }

    const isRemoving = selectedAges.includes(age);
    const sortAges = (ages: string[]) => ages.sort((a, b) => (AGE_VALUE_MAP[a] || 0) - (AGE_VALUE_MAP[b] || 0));

    if (isRemoving) {
      const sortedCurrent = sortAges([...selectedAges]);
      const removeIndex = sortedCurrent.indexOf(age);

      if (removeIndex === -1) return;

      const leftSegment = sortedCurrent.slice(0, removeIndex);
      const rightSegment = sortedCurrent.slice(removeIndex + 1);

      if (leftSegment.length >= rightSegment.length) {
        setSelectedAges(leftSegment.length > 0 ? leftSegment : []);
      } else {
        setSelectedAges(rightSegment);
      }
      return;
    }

    let newAges = [...selectedAges, age];
    newAges = newAges.filter(a => a !== 'any');

    if (newAges.length >= 2) {
      const numericAges = newAges
        .map(a => AGE_VALUE_MAP[a])
        .filter((n): n is number => n !== undefined)
        .sort((a, b) => a - b);

      const min = numericAges[0];
      const max = numericAges[numericAges.length - 1];

      const filledAges: string[] = [];

      AGE_ORDER.forEach(ageStr => {
        const val = AGE_VALUE_MAP[ageStr];
        if (val >= min && val <= max) {
          filledAges.push(ageStr);
        }
      });

      newAges = filledAges;
    }

    setSelectedAges(newAges);
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

  const onSubmit = async (data: any) => {
    if (!selectedDate) {
      toast.error('⚠️ 기본 정보를 확인해주세요: 날짜를 선택해주세요.');
      scrollToSection('section-basic-info');
      return;
    }

    if (!locationData || !locationData.kakaoPlaceId || !locationData.x || !locationData.y) {
      toast.error('⚠️ 기본 정보를 확인해주세요: 장소를 검색하여 선택해주세요.');
      scrollToSection('section-basic-info');
      return;
    }

    if (isPositionMode) {
      const totalPositions = positions.guard + positions.forward + positions.center + positions.bigman;
      if (totalPositions === 0) {
        toast.error('⚠️ 모집 인원을 설정해주세요: 최소 1명 이상 모집해야 합니다.');
        scrollToSection('section-recruitment');
        return;
      }
    } else if (totalCount === 0) {
      toast.error('⚠️ 모집 인원을 설정해주세요: 최소 1명 이상 모집해야 합니다.');
      scrollToSection('section-recruitment');
      return;
    }

    const opsHost = data.operations?.selectedHost;
    if (!opsHost) {
      toast.error('⚠️ 운영 정보를 확인해주세요: 주최자를 선택해주세요.');
      scrollToSection('section-operations');
      return;
    }

    if (opsHost === 'me' && (!data.manualTeamName || data.manualTeamName.trim() === '')) {
      toast.error('⚠️ 운영 정보를 확인해주세요: 개인 주최 시 팀 이름을 입력해주세요.');
      scrollToSection('section-operations');
      return;
    }

    if (!data.bankName || !data.accountNumber || !data.accountHolder) {
      toast.error('⚠️ 운영 정보를 확인해주세요: 계좌 정보를 모두 입력해주세요.');
      scrollToSection('section-operations');
      return;
    }

    const accountHolderRegex = /^[가-힣]{2,10}$/;
    if (!accountHolderRegex.test(data.accountHolder)) {
      toast.error('⚠️ 운영 정보를 확인해주세요: 예금주는 한글 2-10자로 입력해주세요.');
      scrollToSection('section-operations');
      return;
    }

    const accountNumberRegex = /^\d{10,16}$/;
    if (!accountNumberRegex.test(data.accountNumber)) {
      toast.error('⚠️ 운영 정보를 확인해주세요: 계좌번호는 숫자 10-16자리로 입력해주세요.');
      scrollToSection('section-operations');
      return;
    }

    const opsContactType = data.operations?.contactType;
    const normalizedContactType = opsContactType === 'KAKAO_OPEN_CHAT' ? 'KAKAO_OPEN_CHAT' : 'PHONE';
    const opsContactContent = opsContactType === 'PHONE' ? data.phoneNumber : data.kakaoLink;

    if (!opsContactContent) {
      toast.error('⚠️ 운영 정보를 확인해주세요: 연락처를 입력해주세요.');
      scrollToSection('section-operations');
      return;
    }

    if (opsContactType === 'PHONE') {
      const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
      if (!phoneRegex.test(opsContactContent)) {
        toast.error('⚠️ 운영 정보를 확인해주세요: 올바른 전화번호 형식으로 입력해주세요 (예: 010-1234-5678)');
        scrollToSection('section-operations');
        return;
      }
    }

    if (opsContactType === 'KAKAO_OPEN_CHAT' && !opsContactContent.startsWith('http')) {
      toast.error('⚠️ 운영 정보를 확인해주세요: 올바른 오픈채팅 링크를 입력해주세요.');
      scrollToSection('section-operations');
      return;
    }

    const startTime = data.startTime || '19:00';
    const duration = parseFloat(data.duration || '2');

    const [startHour, startMin] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMin + (duration * 60);
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMin = totalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const payload: MatchCreateFormData = {
      title: data.title || '농구 경기',
      date: selectedDate,
      startTime,
      endTime,
      location: {
        name: locationData.buildingName || locationData.address,
        address: locationData.address,
        latitude: parseFloat(locationData.y),
        longitude: parseFloat(locationData.x),
        kakaoPlaceId: locationData.kakaoPlaceId,
      },
      recruitment: isPositionMode ? {
        type: 'position',
        guard: positions.guard,
        forward: isFlexBigman ? 0 : positions.forward,
        center: isFlexBigman ? 0 : positions.center,
        bigman: isFlexBigman ? positions.bigman : 0,
        isFlexBigman,
      } : {
        type: 'any',
        count: totalCount,
      },
      matchFormat,
      gameFormat: isGameFormatSelected ? gameFormatType : undefined,
      level: levelMin,
      levelMin,
      levelMax,
      gender: gender as any,
      ageRange: convertSelectedAgesToRange(selectedAges),
      rules: {
        quarterTime: isRulesSelected && ruleMinutes ? Number(ruleMinutes) : undefined,
        quarterCount: isRulesSelected && ruleQuarters ? Number(ruleQuarters) : undefined,
        fullGames: isRulesSelected && ruleGames ? Number(ruleGames) : undefined,
        referee: isRefereeSelected ? refereeType : undefined,
      },
      facilities: {
        parking: parkingCost,
        parkingDetail: parkingDetail || undefined,
        water: hasWater,
        acHeat: hasAcHeat,
        shower: hasShower,
        courtSize: courtSize || COURT_SIZE_DEFAULT,
        ball: hasBall,
        beverage: hasBeverage,
      },
      isFlexBigman: isPositionMode ? isFlexBigman : false,
      requirements: [],
      costInputType: feeType === 'cost' ? 'money' : 'beverage',
      contactType: normalizedContactType,
      contactContent: opsContactContent || '',
      price: Number(data.fee || 0),
      bank: data.bankName,
      accountNumber: data.accountNumber,
      accountHolder: data.accountHolder || '예금주',
      refundPolicy: '환불 규정...',
      notice: data.description,
      selectedTeamId: opsHost === 'me' ? null : opsHost,
      manualTeamName: opsHost === 'me' ? (data.manualTeamName || '') : '',
    };

    if (data.accountHolder) payload.accountHolder = data.accountHolder;
    if (data.refundPolicy) payload.refundPolicy = data.refundPolicy;

    const handleSuccess = async () => {
      if (data.operations?.saveAsDefault && currentUser?.id) {
        try {
          await saveMatchCreateDefaults({
            userId: currentUser.id,
            selectedHost: opsHost,
            accountInfo: {
              bank: data.bankName,
              number: data.accountNumber,
              holder: data.accountHolder,
            },
            contactInfo: {
              type: normalizedContactType,
              content: opsContactContent || '',
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
