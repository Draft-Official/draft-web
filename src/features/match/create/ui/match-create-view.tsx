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
import { MatchCreateTeamInfo } from './components/match-create-team-info';

// Location data type
interface LocationData {
  address: string;
  buildingName?: string;
  bname?: string; // 동 이름 (지역 필터링용)
  placeUrl?: string; // Kakao Map URL
  x?: string; // Longitude
  y?: string; // Latitude
}

// --- Helpers ---
import { getNext14Days } from '../../lib/utils';

export function MatchCreateView() {
  const router = useRouter();
  const methods = useForm();
  const { handleSubmit, setValue } = methods;

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
  const [showerOption, setShowerOption] = useState("unavailable");
  const [courtSize, setCourtSize] = useState("");

  // Match Specs
  const [matchType, setMatchType] = useState("5vs5");
  const [gender, setGender] = useState("male");
  const [level, setLevel] = useState(4); // 4 = Middle 2 (Default)
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
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

  // Admin Info
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [directTeamName, setDirectTeamName] = useState("");

  // Fee Type
  const [feeType, setFeeType] = useState<"cost" | "beverage">("cost");

  // Load Menu
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  // Tip Banner Visibility
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

  // Facilities Dialogs
  const [showParkingDialog, setShowParkingDialog] = useState(false);
  const [showShowerDialog, setShowShowerDialog] = useState(false);
  const [showCourtSizeDialog, setShowCourtSizeDialog] = useState(false);

  // Location - Kakao Map Integration
  const [location, setLocation] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationSearchResults, setLocationSearchResults] = useState<LocationData[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null); 
  
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
            y: place.y
        }));

        setLocationSearchResults(mappedResults);
        setShowLocationDropdown(mappedResults.length > 0);
      } catch (e) {
        console.error("Search error", e);
      }
    }, 300);
  };

  // Handle location selection
  const handleLocationSelect = (data: LocationData) => {
    setLocationData(data);
    setLocation(formatLocation(data));
    setShowLocationDropdown(false);
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

  // Auto Fill Mock Data
  const fillMockData = () => {
    const targetDate = calendarDates[1].dateISO;
    setSelectedDate(targetDate);

    // Simple location input
    setLocation('강남구민회관');
    setLocationData({
        address: '서울 강남구 개포동',
        buildingName: '강남구민회관',
        placeUrl: '',
        x: '127.058863', // Mock longitude
        y: '37.493922'  // Mock latitude
    });
    setValue('location', '강남구민회관');
    setValue('startTime', '19:00');
    setValue('duration', '2');
    setValue('fee', '10000');
    setValue('bankName', '카카오뱅크');
    setValue('accountNumber', '3333-01-2345678');
    setValue('kakaoLink', 'https://open.kakao.com/o/sXxXxXx');
    setValue('description', '즐겁게 농구하실 분 환영합니다! 주차 3시간 무료입니다.');

    // Facilities
    setParkingCost("0");
    setHasWater(true);
    setHasAcHeat(true);
    setShowerOption("free");
    setCourtSize("regular");

    // Recruitment
    setIsPositionMode(true);
    setPositions({ guard: 2, forward: 2, center: 1, bigman: 0 });
    setIsFlexBigman(false);

    // Specs
    setMatchType('5vs5');
    setGender('male');
    setLevel(4);
    setSelectedAges(['20', '30']);

    // Game Format
    setGameFormatType("internal_3");
    setRuleMinutes("10");
    setRuleQuarters("4");
    setRuleGames("3");
    setGuaranteedQuarters("6");
    setRefereeType("member");

    toast.success("이전 경기 정보를 불러왔습니다.");
  };

  const onSubmit = (data: any) => {
    if (!selectedDate) {
        toast.error("날짜를 선택해주세요.");
        return;
    }

    if (!location) {
        toast.error("장소를 입력해주세요.");
        return;
    }

    const payload = {
        ...data,
        date: selectedDate,
        location: {
            name: location,
            address: locationData?.address || "",
            latitude: locationData?.y ? parseFloat(locationData.y) : 0,
            longitude: locationData?.x ? parseFloat(locationData.x) : 0,
        },
        feeType,
        facilities: {
            parking: parkingCost,
            parkingDetail,
            water: hasWater,
            acHeat: hasAcHeat,
            shower: showerOption,
            courtSize
        },
        recruitment: isPositionMode ? {
            type: 'position',
            ...positions,
            isFlexBigman
        } : {
            type: 'any',
            count: totalCount
        },
        specs: {
            matchType,
            gender,
            level,
            ages: selectedAges
        },
        gameFormat: {
            type: gameFormatType,
            rules: { minutes: ruleMinutes, quarters: ruleQuarters, games: ruleGames },
            guaranteedQuarters,
            referee: refereeType
        },
        team: {
            selected: selectedTeam,
            directInput: isDirectInput ? directTeamName : null
        }
    };

    console.log("Submitting Match:", payload);
    toast.success("경기 모집이 등록되었습니다!");

    // Navigate to host dashboard or match list
    router.push('/');
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
                    onClick={() => setShowLoadMenu(!showLoadMenu)}
                    className="text-xs font-bold text-[#FF6600] flex items-center gap-1 bg-orange-50 px-2.5 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    이전 경기
                </button>

                {/* Dropdown Menu for Load Options */}
                {showLoadMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[140px]">
                    <button
                    type="button"
                    onClick={() => {
                        fillMockData();
                        setShowLoadMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                    <RefreshCw className="w-4 h-4 text-[#FF6600]" />
                    이전 경기
                    </button>
                    <button
                    type="button"
                    onClick={() => {
                        setSelectedTeam("team_slamdunk");
                        fillMockData();
                        setShowLoadMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-100"
                    >
                    <Users className="w-4 h-4 text-slate-600" />
                    팀 이전 운영
                    </button>
                </div>
                )}
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
            >
                <MatchCreateFacilities
                    hasWater={hasWater} setHasWater={setHasWater}
                    hasAcHeat={hasAcHeat} setHasAcHeat={setHasAcHeat}
                    hasBall={hasBall} setHasBall={setHasBall}
                    parkingCost={parkingCost} setParkingCost={setParkingCost}
                    parkingDetail={parkingDetail} setParkingDetail={setParkingDetail}
                    showerOption={showerOption} setShowerOption={setShowerOption}
                    courtSize={courtSize} setCourtSize={setCourtSize}
                    showParkingDialog={showParkingDialog} setShowParkingDialog={setShowParkingDialog}
                    showShowerDialog={showShowerDialog} setShowShowerDialog={setShowShowerDialog}
                    showCourtSizeDialog={showCourtSizeDialog} setShowCourtSizeDialog={setShowCourtSizeDialog}
                />
            </MatchCreateBasicInfo>

            {/* SECTION 2: Recruitment */}
            <MatchCreateRecruitment
                isPositionMode={isPositionMode} setIsPositionMode={setIsPositionMode}
                isFlexBigman={isFlexBigman} setIsFlexBigman={setIsFlexBigman}
                positions={positions} updatePosition={updatePosition}
                totalCount={totalCount} updateTotalCount={updateTotalCount}
            />

            {/* SECTION 3: Match Specs */}
            <MatchCreateSpecs 
                matchType={matchType} setMatchType={setMatchType}
                gender={gender} setGender={setGender}
                level={level} setLevel={setLevel}
                selectedAges={selectedAges} handleAgeSelection={handleAgeSelection}
                handleAgeRangeUpdate={handleAgeRangeUpdate}
                hasShoes={hasShoes} setHasShoes={setHasShoes}
                hasJersey={hasJersey} setHasJersey={setHasJersey}
            />

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

            {/* SECTION 5: Admin Info */}
            <MatchCreateTeamInfo 
                selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam}
                isDirectInput={isDirectInput} setIsDirectInput={setIsDirectInput}
                directTeamName={directTeamName} setDirectTeamName={setDirectTeamName}
            />

        </form>

        <div className="p-4 max-w-[760px] mx-auto">
            <Button
                onClick={handleSubmit(onSubmit)}
                className="w-full h-14 text-lg font-bold bg-[#FF6600] hover:bg-[#FF6600]/90 text-white rounded-xl shadow-lg shadow-orange-100"
            >
                경기 생성하기
            </Button>
        </div>

        </div>
    </FormProvider>
  );
}
