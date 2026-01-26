'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  Users,
  RefreshCw,
  Zap,
  X,
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
import { useCreateMatch } from '@/features/match-create/api/mutations';
import { useMyRecentMatches } from '@/features/match-create/api/queries';
import { MatchCreateFormData } from '@/features/match-create/model/schema';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createAuthService } from '@/features/auth/api/auth-api';
import { createTeamService } from '@/features/team/api/team-api';
import {
  GENDER_DEFAULT,
  PLAY_STYLE_DEFAULT,
  REFEREE_TYPE_DEFAULT,
  COURT_SIZE_DEFAULT,
  MATCH_FORMAT_DEFAULT,
  GenderValue,
  PlayStyleValue,
  RefereeTypeValue,
  CourtSizeValue,
  MatchFormatValue
} from '@/shared/config/constants';
import { useLocationSearch } from '@/src/features/match-create/lib/hooks/use-location-search';
import { useRecentMatchPrefill } from '@/src/features/match-create/lib/hooks/use-recent-match-prefill';
import type { LocationData } from '@/features/match-create/model/types';
import type { MatchWithRelations } from '@/shared/types/database.types';

// --- Helpers ---
import { getNext14Days } from '@/features/match-create/lib/utils';

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
  const [courtSize, setCourtSize] = useState<CourtSizeValue | "">("");

  // Match Specs
  const [matchFormat, setMatchFormat] = useState<MatchFormatValue>(MATCH_FORMAT_DEFAULT);
  const [gender, setGender] = useState<GenderValue>(GENDER_DEFAULT);
  const [level, setLevel] = useState(4); // 4 = Middle 2 (Default)
  const [selectedAges, setSelectedAges] = useState<string[]>(['any']);
  const [hasShoes, setHasShoes] = useState(true);
  const [hasJersey, setHasJersey] = useState(true);

  // Game Format (Optional)
  const [gameFormatType, setGameFormatType] = useState<PlayStyleValue>(PLAY_STYLE_DEFAULT);
  const [ruleMinutes, setRuleMinutes] = useState("8");
  const [ruleQuarters, setRuleQuarters] = useState("4");
  const [ruleGames, setRuleGames] = useState("2");
  const [guaranteedQuarters, setGuaranteedQuarters] = useState("6");
  const [refereeType, setRefereeType] = useState<RefereeTypeValue>(REFEREE_TYPE_DEFAULT);
  
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
        setParkingCost(gymFacilities.parking_fee ?? "0");
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

  // Recent Match Prefill Hook
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
    setLevel,
    setGameFormatType,
    setRuleMinutes,
    setRuleQuarters,
    setRuleGames,
    setGuaranteedQuarters,
    setRefereeType,
    setHasShoes,
    setHasJersey,
  });

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

    // 주최 정보 검증 (필수)
    // Refactored to use form data directly instead of synced state
    const opsHost = data.operations?.selectedHost;
    if (!opsHost) {
        toast.error("⚠️ 운영 정보를 확인해주세요: 주최자를 선택해주세요.");
        scrollToSection('section-operations'); 
        return;
    }

    // 계좌/연락처 정보 검증 (필수)
    if (!data.bankName || !data.accountNumber || !data.accountHolder) {
        toast.error("⚠️ 운영 정보를 확인해주세요: 계좌 정보를 모두 입력해주세요.");
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
        gameFormat: gameFormatType !== PLAY_STYLE_DEFAULT ? (gameFormatType as any) : undefined,
        level: level,
        gender: gender as any,
        ageRange: selectedAges.length > 0 ? { min: 20, max: 40 } : undefined, // Simplification for MVP
        
        // Detailed Rules
        rules: {
            quarterTime: ruleMinutes ? Number(ruleMinutes) : undefined,
            quarterCount: ruleQuarters ? Number(ruleQuarters) : undefined,
            fullGames: ruleGames ? Number(ruleGames) : undefined,
            guaranteedQuarters: guaranteedQuarters ? Number(guaranteedQuarters) : undefined,
            referee: refereeType !== REFEREE_TYPE_DEFAULT ? refereeType : undefined
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
        manualTeamName: undefined, // 팀 선택 시 자동 처리, 개인 시 필요없음
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
                    
                    // Update phone if contact type is PHONE
                    if (operationsData.contactInfo.type === 'PHONE') {
                      await authService.updateProfile(currentUser.id, {
                        phone: operationsData.contactInfo.content,
                      });
                    }
                  } else {
                    // Save team defaults
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
                    
                    // Contact info is always saved to user
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
