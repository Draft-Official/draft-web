'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Users,
  RefreshCw,
  Zap,
  X,
  Loader2,
} from 'lucide-react';

import { Button } from '@/shared/ui/base/button';
import { toast } from "sonner";

import { MatchCreateBasicInfo } from './components/match-create-basic-info';
import { MatchCreateFacilities } from './components/match-create-facilities';
import { MatchCreateRecruitment } from './components/match-create-recruitment';
import { MatchCreateSpecs } from './components/match-create-specs';
import { MatchCreateGameFormat } from './components/match-create-game-format';
import { MatchCreateOperations, OperationsData } from './components/match-create-operations';
import { RecentMatchesDialog } from './components/recent-matches-dialog';
import { useCreateMatch, useUpdateMatch } from '@/features/match-create/api/mutations';
import { useMyRecentMatches } from '@/features/match-create/api/queries';
import { MatchCreateFormData } from '@/features/match-create/model/schema';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createAuthService } from '@/features/auth/api/auth-api';
import { createTeamService } from '@/features/team/api/team-api';
import { createMatchService } from '@/features/match/api/match-api';
import {
  GENDER_DEFAULT,
  COURT_SIZE_DEFAULT,
  MATCH_FORMAT_DEFAULT,
  GenderValue,
  PlayStyleValue,
  RefereeTypeValue,
  CourtSizeValue,
  MatchFormatValue
} from '@/shared/config/constants';
import { useLocationSearch } from '@/features/match-create/lib/hooks/use-location-search';
import { useRecentMatchPrefill } from '@/features/match-create/lib/hooks/use-recent-match-prefill';
import type { LocationData } from '@/features/match-create/model/types';
import type { MatchWithRelations } from '@/shared/types/database.types';

// --- Helpers ---
import { getNext14Days } from '@/features/match-create/lib/utils';

// 나이 값 매핑
const AGE_VALUE_MAP_GLOBAL: Record<string, number> = { '20': 20, '30': 30, '40': 40, '50+': 50 };

/**
 * selectedAges 배열을 ageRange 객체로 변환
 * @param selectedAges 선택된 나이 배열 (예: ['20', '30', '40', '50+'])
 * @returns { min: number, max: number | null } | undefined
 *
 * 규칙:
 * - ['any'] 또는 빈 배열 → undefined (무관)
 * - 마지막이 '50+' → max: null (이상)
 * - 그 외 → max: 마지막 숫자값
 */
function convertSelectedAgesToRange(selectedAges: string[]): { min: number; max: number | null } | undefined {
  if (selectedAges.length === 0 || selectedAges.includes('any')) {
    return undefined; // 무관
  }

  // 숫자로 변환 후 정렬
  const sortedAges = [...selectedAges].sort(
    (a, b) => (AGE_VALUE_MAP_GLOBAL[a] || 0) - (AGE_VALUE_MAP_GLOBAL[b] || 0)
  );

  const firstAge = sortedAges[0];
  const lastAge = sortedAges[sortedAges.length - 1];

  const min = AGE_VALUE_MAP_GLOBAL[firstAge] || 20;
  const max = lastAge === '50+' ? null : (AGE_VALUE_MAP_GLOBAL[lastAge] || null);

  return { min, max };
}

export function MatchCreateView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editMatchId = searchParams?.get('edit');
  const isEditMode = !!editMatchId;

  const methods = useForm();
  const { handleSubmit, setValue, formState: { errors } } = methods;

  // Edit mode states
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [editDataLoaded, setEditDataLoaded] = useState(false);

  // Debug: form errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('[Form Errors]', errors);
    }
  }, [errors]);

  // -- State --
  const [selectedDate, setSelectedDate] = useState<string | null>(() => getNext14Days()[0].dateISO);

  // Recruitment
  const [isPositionMode, setIsPositionMode] = useState(false); // true: Position-based, false: Any
  const [isFlexBigman, setIsFlexBigman] = useState(false);
  const [positions, setPositions] = useState({ guard: 0, forward: 0, center: 0, bigman: 0 });
  const [totalCount, setTotalCount] = useState(1);

  // Facilities
  const [parkingCost, setParkingCost] = useState<string>("");
  const [parkingDetail, setParkingDetail] = useState("");
  const [hasWater, setHasWater] = useState(false);
  const [hasAcHeat, setHasAcHeat] = useState(false);
  const [hasBall, setHasBall] = useState(false); // 공 (웜업볼)
  const [hasBeverage, setHasBeverage] = useState(false); // 음료수
  const [hasShower, setHasShower] = useState(false);
  const [courtSize, setCourtSize] = useState<CourtSizeValue | "">("");

  // Match Specs
  const [matchFormat, setMatchFormat] = useState<MatchFormatValue>(MATCH_FORMAT_DEFAULT);
  const [gender, setGender] = useState<GenderValue>(GENDER_DEFAULT);
  const [levelMin, setLevelMin] = useState(1); // Default: 전체 범위
  const [levelMax, setLevelMax] = useState(7);
  const [selectedAges, setSelectedAges] = useState<string[]>(['any']);
  const [hasShoes, setHasShoes] = useState(true);
  const [hasJersey, setHasJersey] = useState(true);

  // Game Format (Optional) - + 클릭했을 때만 서버 전송
  const [gameFormatType, setGameFormatType] = useState<PlayStyleValue | undefined>(undefined);
  const [isGameFormatSelected, setIsGameFormatSelected] = useState(false);
  const [ruleMinutes, setRuleMinutes] = useState("8"); // 기본값 유지
  const [ruleQuarters, setRuleQuarters] = useState("4");
  const [ruleGames, setRuleGames] = useState("2");
  const [isRulesSelected, setIsRulesSelected] = useState(false);
  const [refereeType, setRefereeType] = useState<RefereeTypeValue | undefined>(undefined);
  const [isRefereeSelected, setIsRefereeSelected] = useState(false);
  
  // Operations Info (replaces Admin Info)
  const [operationsData, setOperationsData] = useState<OperationsData | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [myTeams, setMyTeams] = useState<any[]>([]);

  // Fee Type
  const [feeType, setFeeType] = useState<"cost" | "beverage">("cost");

  // Recent Matches Dialog
  const [showRecentMatchesDialog, setShowRecentMatchesDialog] = useState(false);
  const { data: recentMatches, isLoading: isLoadingRecentMatches } = useMyRecentMatches();

  // Tip Banner Visibility
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
      const isHidden = localStorage.getItem('hideMatchCreateTip');
      if (!isHidden) {
          setShowTip(true);
      }
  }, []);

  // Fetch user and teams data
  useEffect(() => {
    const fetchUserAndTeams = async () => {
      const supabase = getSupabaseBrowserClient();
      const authService = createAuthService(supabase);
      const teamService = createTeamService(supabase);

      try {
        const user = await authService.getCurrentProfile();
        if (user) {
          setCurrentUser(user);
          const teams = await teamService.getMyTeams(user.id);
          setMyTeams(teams);
        }
      } catch (error) {
        console.error('Failed to fetch user/teams:', error);
      }
    };

    fetchUserAndTeams();
  }, []);

  const handleDismissTip = () => {
      setShowTip(false);
      localStorage.setItem('hideMatchCreateTip', 'true');
  };

  // Location Search Hook
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

  // Gym 시설 정보 프리필 (gymFacilities 변경 감지)
  useEffect(() => {
    if (gymFacilities) {
      setHasBall(gymFacilities.ball ?? false);
      setHasWater(gymFacilities.water_purifier ?? false);
      setHasAcHeat(gymFacilities.air_conditioner ?? false);
      setHasShower(gymFacilities.shower ?? false);

      // parking 처리
      if (gymFacilities.parking) {
        // parking_fee: "무료" -> "0" 변환 (기존 데이터 호환성)
        let parkingFee = gymFacilities.parking_fee ?? "0";
        if (parkingFee === "무료") {
          parkingFee = "0";
        }
        setParkingCost(parkingFee);
      } else {
        setParkingCost("");
      }
      setParkingDetail(gymFacilities.parking_location ?? "");

      // court_size_type 처리
      if (gymFacilities.court_size_type) {
        setCourtSize(gymFacilities.court_size_type);
      } else {
        setCourtSize("");
      }
    } else if (gymFacilities === null && isExistingGym === false) {
      // Clear했을 때만 초기화 (locationData가 null이고 isExistingGym이 false)
      setHasBall(false);
      setHasWater(false);
      setHasAcHeat(false);
      setHasShower(false);
      setParkingCost("");
      setParkingDetail("");
      setCourtSize("");
    }
  }, [gymFacilities, isExistingGym]);

  // Auto-scroll on input focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

  const updatePosition = (pos: keyof typeof positions, delta: number) => {
    setPositions(prev => ({
      ...prev,
      [pos]: Math.max(0, prev[pos] + delta)
    }));
  };

  const updateTotalCount = (delta: number) => {
    setTotalCount(prev => Math.max(1, prev + delta));
  };

  // Handler for direct array update (used by Drag-to-Select)
  const handleAgeRangeUpdate = (newAges: string[]) => {
    setSelectedAges(newAges);
  };

  // 나이 값 매핑 (50+는 50으로 처리)
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

    // Helper to sort ages
    const sortAges = (ages: string[]) => ages.sort((a, b) => (AGE_VALUE_MAP[a] || 0) - (AGE_VALUE_MAP[b] || 0));

    if (isRemoving) {
        // Split & Keep Logic
        const sortedCurrent = sortAges([...selectedAges]);
        const removeIndex = sortedCurrent.indexOf(age);

        if (removeIndex === -1) return;

        const leftSegment = sortedCurrent.slice(0, removeIndex);
        const rightSegment = sortedCurrent.slice(removeIndex + 1);

        // Keep the larger segment. Tie-break: Keep Left (Lower ages)
        if (leftSegment.length >= rightSegment.length) {
            setSelectedAges(leftSegment.length > 0 ? leftSegment : []);
        } else {
            setSelectedAges(rightSegment);
        }
        return;
    }

    // Adding Logic (with Conditional Auto-Fill)
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

  const handleAgeToggle = (rangeValue: string) => {
    const newAges = [...selectedAges];
    const index = newAges.indexOf(rangeValue);
    if (index > -1) {
      newAges.splice(index, 1);
    } else {
      newAges.push(rangeValue);
    }

    setSelectedAges(newAges);
  };

  // Handler for level range changes
  const handleLevelChange = (min: number, max: number) => {
    setLevelMin(min);
    setLevelMax(max);
  };

  // Recent Match Prefill Hook (also reused for edit mode)
  const { fillFromRecentMatch } = useRecentMatchPrefill({
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
    setHasShoes,
    setHasJersey,
  });

  // Edit mode: Load existing match data
  useEffect(() => {
    const loadEditData = async () => {
      if (!isEditMode || !editMatchId || editDataLoaded) return;

      setIsLoadingEditData(true);
      try {
        const supabase = getSupabaseBrowserClient();
        const matchService = createMatchService(supabase);
        const matchData = await matchService.getMatchDetail(editMatchId);

        if (matchData) {
          // Reuse fillFromRecentMatch (uses MatchToPrefillMapper with new JSONB fields)
          await fillFromRecentMatch(matchData as MatchWithRelations);

          // Edit mode: also set the date (fillFromRecentMatch skips date)
          if (matchData.start_time) {
            const dateISO = matchData.start_time.split('T')[0];
            setSelectedDate(dateISO);
          }

          setEditDataLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load match data:', error);
        toast.error('경기 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoadingEditData(false);
      }
    };

    loadEditData();
  }, [isEditMode, editMatchId, editDataLoaded, fillFromRecentMatch]);

  // Mutations
  const { mutate: createMatch, isPending: isCreating } = useCreateMatch();
  const { mutate: updateMatch, isPending: isUpdating } = useUpdateMatch();
  const isPending = isCreating || isUpdating;

  // 섹션으로 스크롤 이동
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const onSubmit = async (data: any) => {
    // 기본 정보 검증
    if (!selectedDate) {
        toast.error("⚠️ 기본 정보를 확인해주세요: 날짜를 선택해주세요.");
        scrollToSection('section-basic-info');
        return;
    }

    // locationData 검증 (Kakao API로 선택된 장소만 허용)
    if (!locationData || !locationData.kakaoPlaceId || !locationData.x || !locationData.y) {
        toast.error("⚠️ 기본 정보를 확인해주세요: 장소를 검색하여 선택해주세요.");
        scrollToSection('section-basic-info');
        return;
    }

    // 모집 인원 검증
    if (isPositionMode) {
      const totalPositions = positions.guard + positions.forward + positions.center + positions.bigman;
      if (totalPositions === 0) {
        toast.error("⚠️ 모집 인원을 설정해주세요: 최소 1명 이상 모집해야 합니다.");
        scrollToSection('section-recruitment');
        return;
      }
    } else {
      if (totalCount === 0) {
        toast.error("⚠️ 모집 인원을 설정해주세요: 최소 1명 이상 모집해야 합니다.");
        scrollToSection('section-recruitment');
        return;
      }
    }

    // 주최 정보 검증 (필수)
    // Refactored to use form data directly instead of synced state
    const opsHost = data.operations?.selectedHost;
    if (!opsHost) {
        toast.error("⚠️ 운영 정보를 확인해주세요: 주최자를 선택해주세요.");
        scrollToSection('section-operations');
        return;
    }

    // 개인주최 시 팀이름 필수 검증
    if (opsHost === 'me' && (!data.manualTeamName || data.manualTeamName.trim() === '')) {
        toast.error("⚠️ 운영 정보를 확인해주세요: 개인 주최 시 팀 이름을 입력해주세요.");
        scrollToSection('section-operations');
        return;
    }

    // 계좌/연락처 정보 검증 (필수)
    if (!data.bankName || !data.accountNumber || !data.accountHolder) {
        toast.error("⚠️ 운영 정보를 확인해주세요: 계좌 정보를 모두 입력해주세요.");
        scrollToSection('section-operations');
        return;
    }

    // 예금주 형식 검증 (한글 2-10자)
    const accountHolderRegex = /^[가-힣]{2,10}$/;
    if (!accountHolderRegex.test(data.accountHolder)) {
        toast.error("⚠️ 운영 정보를 확인해주세요: 예금주는 한글 2-10자로 입력해주세요.");
        scrollToSection('section-operations');
        return;
    }

    // 계좌번호 형식 검증 (숫자 10-16자리)
    const accountNumberRegex = /^\d{10,16}$/;
    if (!accountNumberRegex.test(data.accountNumber)) {
        toast.error("⚠️ 운영 정보를 확인해주세요: 계좌번호는 숫자 10-16자리로 입력해주세요.");
        scrollToSection('section-operations');
        return;
    }

    const opsContactType = data.operations?.contactType; // PHONE or KAKAO_OPEN_CHAT
    const opsContactContent = opsContactType === 'PHONE' ? data.phoneNumber : data.kakaoLink;

    if (!opsContactContent) {
        toast.error("⚠️ 운영 정보를 확인해주세요: 연락처를 입력해주세요.");
        scrollToSection('section-operations');
        return;
    }

    // 전화번호 형식 검증 (010-1234-5678)
    if (opsContactType === 'PHONE') {
        const phoneRegex = /^01[0-9]-?\d{3,4}-?\d{4}$/;
        if (!phoneRegex.test(opsContactContent)) {
            toast.error("⚠️ 운영 정보를 확인해주세요: 올바른 전화번호 형식으로 입력해주세요 (예: 010-1234-5678)");
            scrollToSection('section-operations');
            return;
        }
    }

    // 오픈채팅 링크 형식 검증 (URL)
    if (opsContactType === 'KAKAO_OPEN_CHAT') {
        if (!opsContactContent.startsWith('http')) {
            toast.error("⚠️ 운영 정보를 확인해주세요: 올바른 오픈채팅 링크를 입력해주세요.");
            scrollToSection('section-operations');
            return;
        }
    }

    // Calculate endTime from startTime + duration
    const startTime = data.startTime || '19:00';
    const duration = parseFloat(data.duration || '2');

    // Parse startTime (HH:mm format)
    const [startHour, startMin] = startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMin + (duration * 60);
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMin = totalMinutes % 60;
    const endTime = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    console.log('[onSubmit] Time calculation:', { startTime, duration, endTime });

    // Map UI state to MatchCreateFormData schema structure
    const payload: MatchCreateFormData = {
        title: data.title || '농구 경기',
        date: selectedDate,
        startTime: startTime,
        endTime: endTime,

        location: {
            name: locationData.buildingName || locationData.address,
            address: locationData.address,
            latitude: parseFloat(locationData.y),
            longitude: parseFloat(locationData.x),
            kakaoPlaceId: locationData.kakaoPlaceId,
        },
        
        // Recruitment
        recruitment: isPositionMode ? {
            type: 'position',
            guard: positions.guard,
            forward: isFlexBigman ? 0 : positions.forward,
            center: isFlexBigman ? 0 : positions.center,
            bigman: isFlexBigman ? positions.bigman : 0, // 빅맨 통합 시 사용
            isFlexBigman
        } : {
            type: 'any',
            count: totalCount
        },
        
        // Specs
        // Note: Flattening specs as per schema definition
        matchFormat: matchFormat, // 5vs5, 3vs3
        gameFormat: isGameFormatSelected ? gameFormatType : undefined, // + 클릭했을 때만 전송
        level: levelMin, // For backward compatibility, also see levelMin/levelMax below
        levelMin: levelMin,
        levelMax: levelMax,
        gender: gender as any,
        ageRange: convertSelectedAgesToRange(selectedAges),
        
        // Detailed Rules - + 클릭했을 때만 전송
        rules: {
            quarterTime: isRulesSelected && ruleMinutes ? Number(ruleMinutes) : undefined,
            quarterCount: isRulesSelected && ruleQuarters ? Number(ruleQuarters) : undefined,
            fullGames: isRulesSelected && ruleGames ? Number(ruleGames) : undefined,
            referee: isRefereeSelected ? refereeType : undefined
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

        // Bigman 옵션 (포지션 모집 시)
        isFlexBigman: isPositionMode ? isFlexBigman : false,

        // 준비물
        requirements: [
            ...(hasShoes ? ['INDOOR_SHOES'] : []),
            ...(hasJersey ? ['WHITE_BLACK_JERSEY'] : []),
        ],

        // 참가비 타입
        costInputType: feeType === 'cost' ? 'money' : 'beverage',

        // 연락처 (operationsData에서 가져옴)
        // 연락처 (Form Data에서 가져옴)
        contactType: opsContactType === 'KAKAO_OPEN_CHAT' ? 'KAKAO_OPEN_CHAT' : 'PHONE',
        contactContent: opsContactContent || '',

        // Admin Info
        price: Number(data.fee || 0),
        bank: data.bankName,
        accountNumber: data.accountNumber, // Note: In schema it's string
        accountHolder: data.accountHolder || "예금주", 
        refundPolicy: "환불 규정...", 
        notice: data.description,

        // Team Info (Host) - Critical Fix
        selectedTeamId: opsHost === 'me' ? null : opsHost,
        manualTeamName: opsHost === 'me' ? (data.manualTeamName || '') : '',
    };
    
    // Add missing fields if they exist in data but not in payload
    if (data.accountHolder) payload.accountHolder = data.accountHolder;
    if (data.refundPolicy) payload.refundPolicy = data.refundPolicy;

    console.log("Submitting Match:", payload);

    const handleSuccess = async () => {
      // Save defaults if checkboxes were checked
      if (operationsData && currentUser) {
        const supabase = getSupabaseBrowserClient();
        const authService = createAuthService(supabase);
        const teamService = createTeamService(supabase);

        try {
          if (operationsData.saveAsDefault) {
            if (operationsData.selectedHost === 'me') {
              await authService.updateOperationsDefaults(currentUser.id, {
                accountInfo: {
                  bank: operationsData.accountInfo.bank,
                  number: operationsData.accountInfo.number,
                  holder: operationsData.accountInfo.holder,
                },
                operationInfo: {
                  type: operationsData.contactInfo.type,
                  url: operationsData.contactInfo.type === 'KAKAO_OPEN_CHAT'
                    ? operationsData.contactInfo.content
                    : undefined,
                  notice: operationsData.hostNotice,
                }
              });

              if (operationsData.contactInfo.type === 'PHONE') {
                await authService.updateProfile(currentUser.id, {
                  phone: operationsData.contactInfo.content,
                });
              }
            } else {
              await teamService.updateTeamDefaults(operationsData.selectedHost, {
                accountInfo: {
                  bank: operationsData.accountInfo.bank,
                  number: operationsData.accountInfo.number,
                  holder: operationsData.accountInfo.holder,
                },
                operationInfo: {
                  notice: operationsData.hostNotice,
                }
              });

              await authService.updateOperationsDefaults(currentUser.id, {
                operationInfo: {
                  type: operationsData.contactInfo.type,
                  url: operationsData.contactInfo.type === 'KAKAO_OPEN_CHAT'
                    ? operationsData.contactInfo.content
                    : undefined,
                }
              });

              if (operationsData.contactInfo.type === 'PHONE') {
                await authService.updateProfile(currentUser.id, {
                  phone: operationsData.contactInfo.content,
                });
              }
            }
          }

          console.log('✅ Defaults saved successfully');
        } catch (saveError) {
          console.error('Failed to save defaults:', saveError);
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
      toast.error(isEditMode ? "경기 수정에 실패했습니다: " + err.message : "경기 생성에 실패했습니다: " + err.message);
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

  // Fix ref type for Location
  const locationDivRef = useRef<HTMLDivElement>(null);

  return (
    <FormProvider {...methods}>
        <div className="min-h-screen bg-slate-50 pb-[120px] max-w-[760px] mx-auto relative font-sans">

        {/* Header */}
        <header className="bg-white px-4 h-14 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="-ml-2 p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <h1 className="font-bold text-lg text-slate-900">
                  {isEditMode ? '경기 수정' : '경기 개설'}
                </h1>
            </div>

            {/* 수정 모드에서는 최근 경기 불러오기 버튼 숨김 */}
            {!isEditMode && (
              <div className="flex gap-2 relative">
                  <button
                      type="button"
                      onClick={() => setShowRecentMatchesDialog(true)}
                      className="text-xs font-bold text-[#FF6600] flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                  >
                      <RefreshCw className="w-3.5 h-3.5" />
                      최근 경기 불러오기
                  </button>
              </div>
            )}
        </header>

        {/* Edit Mode Loading Overlay */}
        {isLoadingEditData && (
            <div className="fixed inset-0 bg-white/80 z-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#FF6600] animate-spin" />
                    <p className="text-sm text-slate-600">경기 정보를 불러오는 중...</p>
                </div>
            </div>
        )}

        {/* Onboarding Tip Banner - 수정 모드에서는 숨김 */}
        {showTip && !isEditMode && (
            <div className="mx-5 mt-4 p-3 bg-orange-50 rounded-xl flex items-center gap-3 relative animate-in fade-in slide-in-from-top-2 duration-300">
                <Zap className="w-5 h-5 text-[#FF6600] flex-shrink-0 fill-orange-500" />
                <p className="text-sm font-bold text-orange-800 pr-6">
                    딱 한 번만 작성하세요! 다음부턴 '불러오기'로 3초만에 개설가능!
                </p>
                <button
                    onClick={handleDismissTip}
                    className="absolute top-2 right-2 p-1 text-orange-400 hover:text-orange-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-4">

            {/* SECTION 1: Basic Info & Facilities */}
            <div id="section-basic-info">
            <MatchCreateBasicInfo
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                calendarDates={calendarDates}
                location={location}
                handleLocationSearch={handleLocationSearch}
                handleInputFocus={handleInputFocus}
                showLocationDropdown={showLocationDropdown}
                locationSearchResults={locationSearchResults}
                handleLocationSelect={handleLocationSelect}
                locationData={locationData}
                openKakaoMap={openKakaoMap}
                locationInputRef={locationDivRef}
                feeType={feeType}
                setFeeType={setFeeType}
                hasBeverage={hasBeverage}
                setHasBeverage={setHasBeverage}
                isExistingGym={isExistingGym}
                onClearLocation={handleClearLocation}
            >
                <MatchCreateFacilities
                    hasWater={hasWater} setHasWater={setHasWater}
                    hasAcHeat={hasAcHeat} setHasAcHeat={setHasAcHeat}
                    hasBall={hasBall} setHasBall={setHasBall}
                    parkingCost={parkingCost} setParkingCost={setParkingCost}
                    parkingDetail={parkingDetail} setParkingDetail={setParkingDetail}
                    hasShower={hasShower} setHasShower={setHasShower}
                    courtSize={courtSize} setCourtSize={setCourtSize}
                    isExistingGym={isExistingGym}
                />
            </MatchCreateBasicInfo>
            </div>

            {/* SECTION 2: Recruitment */}
            <div id="section-recruitment">
              <MatchCreateRecruitment
                  isPositionMode={isPositionMode} setIsPositionMode={setIsPositionMode}
                  isFlexBigman={isFlexBigman} setIsFlexBigman={setIsFlexBigman}
                  positions={positions} updatePosition={updatePosition}
                  totalCount={totalCount} updateTotalCount={updateTotalCount}
              />
            </div>

            {/* SECTION 3: Match Specs */}
            <div id="section-match-specs">
              <MatchCreateSpecs
                  matchFormat={matchFormat} setMatchFormat={setMatchFormat}
                  gender={gender} setGender={setGender}
                  levelMin={levelMin} levelMax={levelMax} onLevelChange={handleLevelChange}
                  selectedAges={selectedAges} handleAgeSelection={handleAgeSelection}
                  handleAgeRangeUpdate={handleAgeRangeUpdate}
                  hasShoes={hasShoes} setHasShoes={setHasShoes}
                  hasJersey={hasJersey} setHasJersey={setHasJersey}
              />
            </div>

            {/* SECTION 4: Game Format (Optional) */}
            <MatchCreateGameFormat
                gameFormatType={gameFormatType} setGameFormatType={setGameFormatType}
                isGameFormatSelected={isGameFormatSelected} setIsGameFormatSelected={setIsGameFormatSelected}
                ruleMinutes={ruleMinutes} setRuleMinutes={setRuleMinutes}
                ruleQuarters={ruleQuarters} setRuleQuarters={setRuleQuarters}
                ruleGames={ruleGames} setRuleGames={setRuleGames}
                isRulesSelected={isRulesSelected} setIsRulesSelected={setIsRulesSelected}
                refereeType={refereeType} setRefereeType={setRefereeType}
                isRefereeSelected={isRefereeSelected} setIsRefereeSelected={setIsRefereeSelected}
            />

            {/* SECTION 5: Operations Info */}
            <div id="section-operations">
            <MatchCreateOperations
                user={currentUser}
                teams={myTeams}
                onDataChange={setOperationsData}
            />
            </div>

            {/* Submit Button - inside form */}
            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={isPending || isLoadingEditData}
                    className="w-full h-14 text-lg font-bold bg-[#FF6600] hover:bg-[#FF6600]/90 text-white rounded-xl shadow-lg shadow-orange-100 disabled:opacity-50"
                >
                    {isPending
                      ? (isEditMode ? '수정 중...' : '생성 중...')
                      : (isEditMode ? '경기 수정하기' : '경기 생성하기')
                    }
                </Button>
            </div>

        </form>

        {/* Recent Matches Dialog */}
        <RecentMatchesDialog
          open={showRecentMatchesDialog}
          onOpenChange={setShowRecentMatchesDialog}
          matches={(recentMatches as MatchWithRelations[]) || []}
          isLoading={isLoadingRecentMatches}
          onSelect={async (match) => {
            await fillFromRecentMatch(match);
            toast.success("지난 경기 정보를 불러왔습니다. 경기 날짜를 선택해주세요.");
            setShowRecentMatchesDialog(false);
          }}
        />

        </div>
    </FormProvider>
  );
}
