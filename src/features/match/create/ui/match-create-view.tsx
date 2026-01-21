'use client';

import { useState, useMemo, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Users,
  RefreshCw,
  Zap,
  X,
} from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { toast } from "sonner";

import { MatchCreateBasicInfo } from './components/match-create-basic-info';
import { MatchCreateFacilities } from './components/match-create-facilities';
import { MatchCreateRecruitment } from './components/match-create-recruitment';
import { MatchCreateSpecs } from './components/match-create-specs';
import { MatchCreateGameFormat } from './components/match-create-game-format';
import { MatchCreateOperations, OperationsData } from './components/match-create-operations';
import { RecentMatchesDialog, MatchWithRelations } from './components/recent-matches-dialog';
import { useCreateMatch } from '@/features/match/api/mutations';
import { useMyRecentMatches } from '@/features/match/api/queries';
import { MatchCreateFormData } from '@/features/match/create/model/schema';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createAuthService } from '@/services/auth';
import { createTeamService } from '@/services/team';

// Location data type
interface LocationData {
  address: string;
  buildingName?: string;
  bname?: string; // 동 이름 (지역 필터링용)
  placeUrl?: string; // Kakao Map URL
  x?: string; // Longitude
  y?: string; // Latitude
  kakaoPlaceId?: string; // 카카오 place_id (Gym 중복 방지)
}

// --- Helpers ---
import { getNext14Days } from '../../lib/utils';

export function MatchCreateView() {
  const router = useRouter();
  const methods = useForm();
  const { handleSubmit, setValue, formState: { errors } } = methods;

  // Debug: form errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log('[Form Errors]', errors);
    }
  }, [errors]);

  // -- State --
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
  const [courtSize, setCourtSize] = useState("");

  // Match Specs
  const [matchType, setMatchType] = useState("5vs5");
  const [gender, setGender] = useState("men");
  const [level, setLevel] = useState(4); // 4 = Middle 2 (Default)
  const [selectedAges, setSelectedAges] = useState<string[]>(['any']);
  const [hasShoes, setHasShoes] = useState(true);
  const [hasJersey, setHasJersey] = useState(true);

  // Game Format (Optional)
  const [gameFormatType, setGameFormatType] = useState("internal_2");
  const [ruleMinutes, setRuleMinutes] = useState("8");
  const [ruleQuarters, setRuleQuarters] = useState("4");
  const [ruleGames, setRuleGames] = useState("2");
  const [guaranteedQuarters, setGuaranteedQuarters] = useState("6");
  const [refereeType, setRefereeType] = useState("self");
  
  // ...



  // Game Format Visibility (for nudge UI)
  const [showGameFormatType, setShowGameFormatType] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showGuaranteed, setShowGuaranteed] = useState(false);
  const [showReferee, setShowReferee] = useState(false);

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

  // Facilities Dialogs
  const [showParkingDialog, setShowParkingDialog] = useState(false);
  const [showCourtSizeDialog, setShowCourtSizeDialog] = useState(false);

  // Location - Kakao Map Integration
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationSearchResults, setLocationSearchResults] = useState<LocationData[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Gym 프리필 상태
  const [isExistingGym, setIsExistingGym] = useState(false); 
  
  const calendarDates = useMemo(() => getNext14Days(), []);

  // -- Handlers --

  // Format location string: "address (buildingName)" if buildingName exists
  const formatLocation = (data: LocationData): string => {
    if (data.buildingName) {
      return `${data.address} (${data.buildingName})`;
    }
    return data.address;
  };

  // Handle location search with debounce
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleLocationSearch = (query: string) => {
    setLocation(query);

    if (query.trim().length < 2) {
      setLocationSearchResults([]);
      setShowLocationDropdown(false);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const { searchPlaces } = await import('@/shared/api/kakao-map');
        const results = await searchPlaces(query);
        const mappedResults: LocationData[] = results.map((place: any) => ({
            address: place.road_address_name || place.address_name,
            buildingName: place.place_name,
            bname: place.address_name.split(' ')[2],
            placeUrl: place.place_url,
            x: place.x,
            y: place.y,
            kakaoPlaceId: place.id,
        }));

        setLocationSearchResults(mappedResults);
        setShowLocationDropdown(mappedResults.length > 0);
      } catch (e) {
        console.error("Search error", e);
      }
    }, 200);
  };

  // 시설 정보 초기화
  const resetFacilities = () => {
    setHasBall(false);
    setHasWater(false);
    setHasAcHeat(false);
    setHasShower(false);
    setParkingCost("");
    setParkingDetail("");
    setCourtSize("");
  };

  // 시설 정보 프리필 (빈 값 대비: ?? 연산자 사용)
  const prefillFacilities = (facilities: any) => {
    if (!facilities) {
      resetFacilities();
      return;
    }

    setHasBall(facilities.ball ?? false);
    setHasWater(facilities.water_purifier ?? false);
    setHasAcHeat(facilities.air_conditioner ?? false);
    setHasShower(facilities.shower ?? false);

    // parking 처리
    if (facilities.parking) {
      setParkingCost(facilities.parking_fee ?? "0");
    } else {
      setParkingCost("");
    }
    setParkingDetail(facilities.parking_location ?? "");

    // court_size_type 처리
    if (facilities.court_size_type) {
      const sizeMap: Record<string, string> = {
        'REGULAR': 'regular',
        'SHORT': 'short',
        'NARROW': 'narrow'
      };
      setCourtSize(sizeMap[facilities.court_size_type] ?? "");
    } else {
      setCourtSize("");
    }
  };

  // Handle location selection
  const handleLocationSelect = async (data: LocationData) => {
    setLocationData(data);
    setLocation(formatLocation(data));
    setShowLocationDropdown(false);

    // Gym 조회 및 프리필
    if (data.kakaoPlaceId) {
      try {
        const { lookupGymByKakaoPlaceId } = await import('@/shared/api/gym');
        const existingGym = await lookupGymByKakaoPlaceId(data.kakaoPlaceId);

        if (existingGym) {
          setIsExistingGym(true);
          prefillFacilities(existingGym.facilities);
        } else {
          setIsExistingGym(false);
          resetFacilities();
        }
      } catch (error) {
        console.error('Gym lookup error:', error);
        setIsExistingGym(false);
        resetFacilities();
      }
    } else {
      setIsExistingGym(false);
      resetFacilities();
    }
  };

  // 장소 선택 해제
  const handleClearLocation = () => {
    setLocationData(null);
    setLocation("");
    
    // 기존 Gym 데이터였던 경우에만 시설 정보 초기화
    if (isExistingGym) {
      resetFacilities();
    }
    
    setIsExistingGym(false);
  };

  // Open Kakao Map
  const openKakaoMap = () => {
    if (locationData?.placeUrl) {
      window.open(locationData.placeUrl, '_blank');
    }
  };

  // Auto-scroll on input focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
    // Logic from original onFocus to show dropdown
    if (locationSearchResults.length > 0) {
        setShowLocationDropdown(true);
    }
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
    const ageValues: Record<string, number> = { '20': 20, '30': 30, '40': 40, '50': 50, '60': 60, '70': 70 };
    
    // Helper to sort ages
    const sortAges = (ages: string[]) => ages.sort((a, b) => (ageValues[a] || 0) - (ageValues[b] || 0));

    if (isRemoving) {
        // Split & Keep Logic
        const sortedCurrent = sortAges([...selectedAges]);
        const removeIndex = sortedCurrent.indexOf(age);
        
        if (removeIndex === -1) return; // Should not happen

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
            .map(a => ageValues[a])
            .filter((n): n is number => n !== undefined)
            .sort((a, b) => a - b);

        const min = numericAges[0];
        const max = numericAges[numericAges.length - 1];

        const filledAges: string[] = [];
        const ageOrder = ['20', '30', '40', '50', '60', '70'];
        
        ageOrder.forEach(ageStr => {
            const val = ageValues[ageStr];
            if (val >= min && val <= max) {
                filledAges.push(ageStr);
            }
        });

        newAges = filledAges;
    }

    setSelectedAges(newAges);
  };

  // Fill Form from Recent Match (날짜 제외)
  const fillFromRecentMatch = (match: MatchWithRelations) => {
    // 1. 날짜는 매핑하지 않음 - 사용자가 직접 선택

    // 2. 장소 정보 (gym 데이터 있으면 prefill)
    if (match.gym) {
      const gymData = match.gym;
      setLocationData({
        address: gymData.address,
        buildingName: gymData.name,
        placeUrl: '', // 이전 경기에서는 없을 수 있음
        x: String(gymData.longitude),
        y: String(gymData.latitude),
        kakaoPlaceId: gymData.kakao_place_id || '',
      });
      setLocation(`${gymData.address} (${gymData.name})`);
      setValue('location', gymData.name);

      // 시설 정보 프리필
      if (gymData.facilities) {
        prefillFacilities(gymData.facilities);
        setIsExistingGym(true);
      }
    }

    // 3. 시간 정보
    if (match.start_time && match.end_time) {
      const startDate = new Date(match.start_time);
      const endDate = new Date(match.end_time);
      const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
      const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
      setValue('startTime', startTime);

      // duration 계산
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);
      setValue('duration', String(durationHours));
    }

    // 4. 가격 정보
    setValue('fee', String(match.cost_amount || 0));
    setFeeType(match.cost_type === 'BEVERAGE' ? 'beverage' : 'cost');
    setHasBeverage(match.provides_beverage || false);

    // 5. 계좌 정보
    if (match.account_bank) setValue('bankName', match.account_bank);
    if (match.account_number) setValue('accountNumber', match.account_number);
    if (match.account_holder) setValue('accountHolder', match.account_holder);

    // 6. 연락처 정보
    if (match.contact_content) setValue('kakaoLink', match.contact_content);

    // 7. 공지사항
    if (match.host_notice) setValue('description', match.host_notice);

    // 8. 모집 설정
    const recruitment = match.recruitment_setup;
    if (recruitment?.type === 'POSITION') {
      setIsPositionMode(true);
      const pos = recruitment.positions || {};
      setPositions({
        guard: pos.G?.max || 0,
        forward: pos.F?.max || 0,
        center: pos.C?.max || 0,
        bigman: pos.B?.max || 0,
      });
      setIsFlexBigman((pos.B?.max || 0) > 0);
    } else {
      setIsPositionMode(false);
      setTotalCount(recruitment?.max_count || 1);
    }

    // 9. 경기 스펙
    setMatchType(match.match_type || '5vs5');

    const genderMap: Record<string, string> = {
      MALE: 'men', FEMALE: 'women', MIXED: 'mixed'
    };
    setGender(genderMap[match.gender_rule] || 'men');

    setLevel(Number(match.level_limit) || 4);

    // 10. 경기 형식 (match_options)
    const options = match.match_options;
    if (options) {
      // play_style
      const formatMap: Record<string, string> = {
        INTERNAL_2WAY: 'internal_2',
        INTERNAL_3WAY: 'internal_3',
        EXCHANGE: 'exchange',
        PRACTICE: 'practice',
      };
      if (options.play_style) {
        setGameFormatType(formatMap[options.play_style] || 'internal_2');
        setShowGameFormatType(true);
      }

      // quarter_rule
      if (options.quarter_rule) {
        setRuleMinutes(String(options.quarter_rule.minutes_per_quarter || 8));
        setRuleQuarters(String(options.quarter_rule.quarter_count || 4));
        setRuleGames(String(options.quarter_rule.game_count || 2));
        setShowRules(true);
      }

      // guaranteed_quarters
      if (options.guaranteed_quarters) {
        setGuaranteedQuarters(String(options.guaranteed_quarters));
        setShowGuaranteed(true);
      }

      // referee_type
      const refMap: Record<string, string> = {
        SELF: 'self', STAFF: 'member', PRO: 'pro'
      };
      if (options.referee_type) {
        setRefereeType(refMap[options.referee_type] || 'self');
        setShowReferee(true);
      }
    }

    // 11. 준비물
    const reqs = match.requirements || [];
    setHasShoes(reqs.includes('INDOOR_SHOES'));
    setHasJersey(reqs.includes('WHITE_BLACK_JERSEY'));

    // 12. Toast 메시지
    toast.success("지난 경기 정보를 불러왔습니다. 경기 날짜를 선택해주세요.");
  };

  // Mutation
  const { mutate: createMatch, isPending } = useCreateMatch();

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
        matchType: matchType as any, // 5vs5, 3vs3
        gameFormat: showGameFormatType ? (gameFormatType as any) : undefined,
        level: level,
        gender: gender as any,
        ageRange: selectedAges.length > 0 ? { min: 20, max: 40 } : undefined, // Simplification for MVP
        
        // Detailed Rules
        rules: {
            quarterTime: showRules ? Number(ruleMinutes) : undefined,
            quarterCount: showRules ? Number(ruleQuarters) : undefined,
            fullGames: showRules ? Number(ruleGames) : undefined,
            guaranteedQuarters: showGuaranteed ? Number(guaranteedQuarters) : undefined,
            referee: showReferee ? (refereeType as 'self' | 'member' | 'pro') : undefined
        },

        facilities: {
            parking: parkingCost,
            parkingDetail: parkingDetail || undefined,
            water: hasWater,
            acHeat: hasAcHeat,
            shower: hasShower,
            courtSize: courtSize as 'regular' | 'short' | 'narrow',
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
        contactType: operationsData?.contactInfo.type === 'KAKAO_OPEN_CHAT' ? 'KAKAO_OPEN_CHAT' : 'PHONE',
        contactContent: operationsData?.contactInfo.content || '',

        // Admin Info
        price: Number(data.fee || 0),
        bank: data.bankName,
        accountNumber: data.accountNumber,
        accountHolder: "예금주", // Missing in form input? Assuming data has it or default
        refundPolicy: "환불 규정...", // Default or from form
        notice: data.description,
    };
    
    // Add missing fields if they exist in data but not in payload
    if (data.accountHolder) payload.accountHolder = data.accountHolder;
    if (data.refundPolicy) payload.refundPolicy = data.refundPolicy;

    console.log("Submitting Match:", payload);
    
    createMatch(payload, {
        onSuccess: async () => {
            // Save defaults if checkboxes were checked
            if (operationsData && currentUser) {
              const supabase = getSupabaseBrowserClient();
              const authService = createAuthService(supabase);
              const teamService = createTeamService(supabase);

              try {
                // Save all defaults if checkbox was checked
                if (operationsData.saveAsDefault) {
                  // Save to user or team based on selectedHost
                  if (operationsData.selectedHost === 'me') {
                    // Save all user defaults
                    await authService.updateOperationsDefaults(currentUser.id, {
                      default_account_bank: operationsData.accountInfo.bank,
                      default_account_number: operationsData.accountInfo.number,
                      default_account_holder: operationsData.accountInfo.holder,
                      default_contact_type: operationsData.contactInfo.type,
                      kakao_open_chat_url: operationsData.contactInfo.type === 'KAKAO_OPEN_CHAT' 
                        ? operationsData.contactInfo.content 
                        : null,
                      default_host_notice: operationsData.hostNotice,
                    });
                    
                    // Update phone if contact type is PHONE
                    if (operationsData.contactInfo.type === 'PHONE') {
                      await authService.updateProfile(currentUser.id, {
                        phone: operationsData.contactInfo.content,
                      });
                    }
                  } else {
                    // Save team defaults
                    await teamService.updateTeamDefaults(operationsData.selectedHost, {
                      account_bank: operationsData.accountInfo.bank,
                      account_number: operationsData.accountInfo.number,
                      account_holder: operationsData.accountInfo.holder,
                      host_notice: operationsData.hostNotice,
                    });
                    
                    // Contact info is always saved to user
                    await authService.updateOperationsDefaults(currentUser.id, {
                      default_contact_type: operationsData.contactInfo.type,
                      kakao_open_chat_url: operationsData.contactInfo.type === 'KAKAO_OPEN_CHAT' 
                        ? operationsData.contactInfo.content 
                        : null,
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
                // Don't block navigation on save failure
              }
            }

            router.push('/');
        },
        onError: (err) => {
            console.error(err);
            toast.error("경기 생성에 실패했습니다: " + err.message);
        }
    });
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
                <h1 className="font-bold text-lg text-slate-900">경기 개설</h1>
            </div>
            
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
        </header>

        {/* Onboarding Tip Banner */}
        {showTip && (
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
                    showParkingDialog={showParkingDialog} setShowParkingDialog={setShowParkingDialog}
                    showCourtSizeDialog={showCourtSizeDialog} setShowCourtSizeDialog={setShowCourtSizeDialog}
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
                  matchType={matchType} setMatchType={setMatchType}
                  gender={gender} setGender={setGender}
                  level={level} setLevel={setLevel}
                  selectedAges={selectedAges} handleAgeSelection={handleAgeSelection}
                  handleAgeRangeUpdate={handleAgeRangeUpdate}
                  hasShoes={hasShoes} setHasShoes={setHasShoes}
                  hasJersey={hasJersey} setHasJersey={setHasJersey}
              />
            </div>

            {/* SECTION 4: Game Format (Optional) */}
            <MatchCreateGameFormat
                gameFormatType={gameFormatType} setGameFormatType={setGameFormatType}
                ruleMinutes={ruleMinutes} setRuleMinutes={setRuleMinutes}
                ruleQuarters={ruleQuarters} setRuleQuarters={setRuleQuarters}
                ruleGames={ruleGames} setRuleGames={setRuleGames}
                guaranteedQuarters={guaranteedQuarters} setGuaranteedQuarters={setGuaranteedQuarters}
                refereeType={refereeType} setRefereeType={setRefereeType}
                showGameFormatType={showGameFormatType} setShowGameFormatType={setShowGameFormatType}
                showRules={showRules} setShowRules={setShowRules}
                showGuaranteed={showGuaranteed} setShowGuaranteed={setShowGuaranteed}
                showReferee={showReferee} setShowReferee={setShowReferee}
            />

            {/* SECTION 5: Operations Info */}
            <MatchCreateOperations
                user={currentUser}
                teams={myTeams}
                onDataChange={setOperationsData}
            />

            {/* Submit Button - inside form */}
            <div className="pt-4">
                <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-14 text-lg font-bold bg-[#FF6600] hover:bg-[#FF6600]/90 text-white rounded-xl shadow-lg shadow-orange-100 disabled:opacity-50"
                >
                    {isPending ? '생성 중...' : '경기 생성하기'}
                </Button>
            </div>

        </form>

        {/* Recent Matches Dialog */}
        <RecentMatchesDialog
          open={showRecentMatchesDialog}
          onOpenChange={setShowRecentMatchesDialog}
          matches={(recentMatches as MatchWithRelations[]) || []}
          isLoading={isLoadingRecentMatches}
          onSelect={(match) => {
            fillFromRecentMatch(match);
            setShowRecentMatchesDialog(false);
          }}
        />

        </div>
    </FormProvider>
  );
}
