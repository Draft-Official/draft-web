'use client';

import { useState, useMemo, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Minus,
  Plus,
  Check,
  Building2,
  MessageCircle,
  RefreshCw,
  Clock,
  FileText,
  Users,
  Settings,
  Info,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { toast } from "sonner";
import { searchPlaces, KakaoPlace } from '@/shared/api/kakao-map';

// --- Helpers ---
const getNext14Days = () => {
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const dates = [];
    const today = new Date();

    for(let i=0; i<14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const month = d.getMonth() + 1;
        const date = d.getDate();
        const day = days[d.getDay()];

        dates.push({
            dateISO: d.toISOString().split('T')[0],
            label: `${month}.${date} (${day})`,
            dayNum: date,
            dayStr: day,
            isToday: i === 0,
        });
    }
    return dates;
};

const DURATION_OPTIONS = [
    { label: '1시간', value: '1' },
    { label: '1시간 30분', value: '1.5' },
    { label: '2시간', value: '2' },
    { label: '2시간 30분', value: '2.5' },
    { label: '3시간', value: '3' },
    { label: '3시간 30분', value: '3.5' },
    { label: '4시간', value: '4' },
];

export function MatchCreateView() {
  const router = useRouter();
  const { register, handleSubmit, setValue, control } = useForm();

  // -- State --
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Recruitment
  const [isPositionMode, setIsPositionMode] = useState(true); // true: Position-based, false: Any
  const [isFlexBigman, setIsFlexBigman] = useState(false);
  const [positions, setPositions] = useState({ guard: 0, forward: 0, center: 0, bigman: 0 });
  const [totalCount, setTotalCount] = useState(1);

  // Facilities
  const [parkingCost, setParkingCost] = useState<string>("");
  const [hasWater, setHasWater] = useState(false);
  const [hasAcHeat, setHasAcHeat] = useState(false);
  const [showerOption, setShowerOption] = useState("unavailable");
  const [courtSize, setCourtSize] = useState("regular");

  // Match Specs
  const [matchType, setMatchType] = useState("5vs5");
  const [gender, setGender] = useState("mixed");
  const [level, setLevel] = useState("middle");
  const [selectedAges, setSelectedAges] = useState<string[]>([]);

  // Game Format (Optional)
  const [gameFormatType, setGameFormatType] = useState("internal_2");
  const [ruleMinutes, setRuleMinutes] = useState("");
  const [ruleQuarters, setRuleQuarters] = useState("");
  const [ruleGames, setRuleGames] = useState("");
  const [guaranteedQuarters, setGuaranteedQuarters] = useState("");
  const [refereeType, setRefereeType] = useState("self");

  // Game Format Visibility (for nudge UI)
  const [showRules, setShowRules] = useState(false);
  const [showGuaranteed, setShowGuaranteed] = useState(false);
  const [showReferee, setShowReferee] = useState(false);

  // Admin Info
  const [selectedTeam, setSelectedTeam] = useState("");
  const [isDirectInput, setIsDirectInput] = useState(false);
  const [directTeamName, setDirectTeamName] = useState("");

  // Load Menu
  const [showLoadMenu, setShowLoadMenu] = useState(false);

  // Facilities Dialogs
  const [showParkingDialog, setShowParkingDialog] = useState(false);
  const [showShowerDialog, setShowShowerDialog] = useState(false);
  const [showCourtSizeDialog, setShowCourtSizeDialog] = useState(false);

  // Location Search (Kakao Map Integration)
  const [locationSearchQuery, setLocationSearchQuery] = useState("");
  const [locationSearchResults, setLocationSearchResults] = useState<KakaoPlace[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<KakaoPlace | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const locationDebounceTimer = useRef<NodeJS.Timeout | null>(null);

  const calendarDates = useMemo(() => getNext14Days(), []);

  // -- Handlers --

  const updatePosition = (pos: keyof typeof positions, delta: number) => {
    setPositions(prev => ({
      ...prev,
      [pos]: Math.max(0, prev[pos] + delta)
    }));
  };

  const updateTotalCount = (delta: number) => {
    setTotalCount(prev => Math.max(1, prev + delta));
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

    let newAges = selectedAges.includes(age)
      ? selectedAges.filter(a => a !== age)
      : [...selectedAges, age];

    newAges = newAges.filter(a => a !== 'any');

    // Fill range logic
    const ageOrder = ['20', '30', '40', '50', '60', '70'];
    const ageValues: Record<string, number> = { '20': 20, '30': 30, '40': 40, '50': 50, '60': 60, '70': 70 };

    if (newAges.length >= 2) {
        const numericAges = newAges
            .map(a => ageValues[a])
            .filter((n): n is number => n !== undefined)
            .sort((a, b) => a - b);

        const min = numericAges[0];
        const max = numericAges[numericAges.length - 1];

        const filledAges: string[] = [];
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

  // Location Search with Debounce
  const handleLocationSearch = async (query: string) => {
    setLocationSearchQuery(query);

    if (locationDebounceTimer.current) {
      clearTimeout(locationDebounceTimer.current);
    }

    if (!query.trim()) {
      setLocationSearchResults([]);
      setShowLocationDropdown(false);
      return;
    }

    locationDebounceTimer.current = setTimeout(async () => {
      try {
        const results = await searchPlaces(query);
        setLocationSearchResults(results);
        setShowLocationDropdown(results.length > 0);
      } catch (error) {
        console.error('Location search failed:', error);
        toast.error('장소 검색에 실패했습니다');
      }
    }, 300);
  };

  const handleLocationSelect = (place: KakaoPlace) => {
    setSelectedLocation(place);
    setLocationSearchQuery(place.place_name);
    setValue('location', place.place_name);
    setShowLocationDropdown(false);
  };

  // Auto Fill Mock Data
  const fillMockData = () => {
    const targetDate = calendarDates[1].dateISO;
    setSelectedDate(targetDate);

    // Simulate Kakao Place selection
    setLocationSearchQuery('강남구민회관');
    setValue('location', '강남구민회관');
    setValue('startTime', '19:00');
    setValue('duration', '2');
    setValue('fee', '15000');
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
    setLevel('middle');
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

    if (!selectedLocation && !locationSearchQuery) {
        toast.error("장소를 선택해주세요.");
        return;
    }

    const payload = {
        ...data,
        date: selectedDate,
        location: selectedLocation ? {
            name: selectedLocation.place_name,
            address: selectedLocation.address_name,
            latitude: parseFloat(selectedLocation.y),
            longitude: parseFloat(selectedLocation.x),
        } : {
            name: locationSearchQuery,
            address: "",
            latitude: 0,
            longitude: 0,
        },
        facilities: {
            parking: parkingCost,
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

  return (
    <div className="min-h-screen bg-slate-50 pb-[120px] max-w-[760px] mx-auto relative font-sans">

      {/* Header */}
      <header className="bg-white px-5 h-14 flex items-center justify-between border-b border-slate-100">
          <h1 className="font-bold text-lg text-slate-900">경기 개설</h1>
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-4">

        {/* SECTION 1: Basic Info & Facilities */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-400" />
                기본 정보
            </h2>

            {/* Date */}
            <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-600">일시 <span className="text-[#FF6600] text-xs font-normal ml-1">(2주 내 예약 가능)</span></Label>
                <ScrollArea className="w-full whitespace-nowrap -mx-1">
                    <div className="flex gap-2 pb-2 px-1">
                        {calendarDates.map((d) => (
                            <button
                                type="button"
                                key={d.dateISO}
                                onClick={() => setSelectedDate(d.dateISO)}
                                className={cn(
                                    "flex flex-col items-center justify-center min-w-[64px] h-[64px] rounded-xl border transition-all active:scale-95",
                                    selectedDate === d.dateISO
                                        ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                        : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                                )}
                            >
                                <span className={cn("text-[11px] mb-1 font-medium", selectedDate === d.dateISO ? "text-slate-300" : "text-slate-500")}>{d.dayStr}</span>
                                <span className="text-lg font-bold leading-none">{d.dayNum}</span>
                            </button>
                        ))}
                    </div>
                    <ScrollBar orientation="horizontal" className="hidden" />
                </ScrollArea>
            </div>

            {/* Time & Duration */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600">시작 시간</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                        <Input
                            type="time"
                            step="600"
                            {...register('startTime')}
                            className="pl-10 h-12 bg-white border-slate-200 text-lg font-bold"
                            defaultValue="19:00"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600">진행 시간</Label>
                    <Controller
                        name="duration"
                        control={control}
                        defaultValue="2"
                        render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="h-12 bg-white border-slate-200 font-bold">
                                    <SelectValue placeholder="선택" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DURATION_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </div>
            </div>

            {/* Location with Kakao Search */}
            <div className="space-y-2 relative">
                <Label className="text-sm font-bold text-slate-600">장소</Label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input
                        ref={locationInputRef}
                        value={locationSearchQuery}
                        onChange={(e) => handleLocationSearch(e.target.value)}
                        placeholder="체육관 검색..."
                        className="pl-10 h-12 bg-white border-slate-200"
                        autoComplete="off"
                    />
                    {selectedLocation && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLocation(null);
                          setLocationSearchQuery("");
                          setValue('location', '');
                        }}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                </div>

                {/* Search Results Dropdown */}
                {showLocationDropdown && locationSearchResults.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-[300px] overflow-y-auto">
                    {locationSearchResults.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        onClick={() => handleLocationSelect(place)}
                        className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
                      >
                        <div className="font-medium text-slate-900 text-sm">{place.place_name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{place.address_name}</div>
                        {place.category_name && (
                          <div className="text-xs text-slate-400 mt-1">{place.category_name}</div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {selectedLocation && (
                  <div className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <MapPin className="w-4 h-4 text-[#FF6600] mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 text-sm">{selectedLocation.place_name}</div>
                      <div className="text-xs text-slate-600 mt-1">{selectedLocation.address_name}</div>
                    </div>
                    <Check className="w-4 h-4 text-[#FF6600] flex-shrink-0" />
                  </div>
                )}
            </div>

            {/* Fee */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">참가비 (1인)</Label>
                <div className="relative">
                    <Input
                        type="number"
                        {...register('fee', { required: true })}
                        className="h-12 bg-white border-slate-200 pr-10 text-right font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">원</span>
                </div>
            </div>

            {/* Facilities - Chip Style */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <Label className="text-sm font-bold text-slate-600">시설 정보</Label>

                <div className="flex flex-wrap gap-2">
                    {/* Simple Toggle: Water Purifier */}
                    <button
                        type="button"
                        onClick={() => setHasWater(!hasWater)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                            hasWater
                                ? "bg-[#FF6600] text-white border-[#FF6600]"
                                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                        )}
                    >
                        {hasWater && <Check className="w-3.5 h-3.5" />}
                        정수기
                    </button>

                    {/* Simple Toggle: AC/Heating */}
                    <button
                        type="button"
                        onClick={() => setHasAcHeat(!hasAcHeat)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                            hasAcHeat
                                ? "bg-[#FF6600] text-white border-[#FF6600]"
                                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                        )}
                    >
                        {hasAcHeat && <Check className="w-3.5 h-3.5" />}
                        냉난방
                    </button>

                    {/* Complex: Parking */}
                    <button
                        type="button"
                        onClick={() => setShowParkingDialog(true)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                            parkingCost !== ""
                                ? "bg-[#FF6600] text-white border-[#FF6600]"
                                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                        )}
                    >
                        {parkingCost !== "" && <Check className="w-3.5 h-3.5" />}
                        주차
                        {parkingCost === "0" && ": 무료"}
                        {parkingCost !== "" && parkingCost !== "0" && `: ${Number(parkingCost).toLocaleString()}원/시간`}
                    </button>

                    {/* Complex: Shower */}
                    <button
                        type="button"
                        onClick={() => setShowShowerDialog(true)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                            showerOption !== "unavailable"
                                ? "bg-[#FF6600] text-white border-[#FF6600]"
                                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                        )}
                    >
                        {showerOption !== "unavailable" && <Check className="w-3.5 h-3.5" />}
                        샤워실
                        {showerOption === "free" && ": 무료"}
                        {showerOption === "paid" && ": 유료"}
                    </button>

                    {/* Complex: Court Size */}
                    <button
                        type="button"
                        onClick={() => setShowCourtSizeDialog(true)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5",
                            courtSize !== "regular"
                                ? "bg-[#FF6600] text-white border-[#FF6600]"
                                : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                        )}
                    >
                        {courtSize !== "regular" && <Check className="w-3.5 h-3.5" />}
                        코트 크기
                        {courtSize === "short" && ": 세로 짧음"}
                        {courtSize === "narrow" && ": 가로 좁음"}
                    </button>
                </div>
            </div>
        </section>

        {/* SECTION 2: Recruitment */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-slate-400" />
                    모집 인원
                </h2>
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold", !isPositionMode ? "text-[#FF6600]" : "text-slate-400")}>포지션 무관</span>
                    <Switch checked={isPositionMode} onCheckedChange={setIsPositionMode} className="data-[state=checked]:bg-[#FF6600]" />
                    <span className={cn("text-xs font-bold", isPositionMode ? "text-[#FF6600]" : "text-slate-400")}>포지션별</span>
                </div>
            </div>

            {isPositionMode ? (
                // Position Based
                <div className="space-y-4">
                     <div className="flex items-center justify-end space-x-2 mb-2">
                        <Checkbox
                            id="flex-bigman"
                            checked={isFlexBigman}
                            onCheckedChange={(c) => setIsFlexBigman(!!c)}
                        />
                        <label
                            htmlFor="flex-bigman"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                        >
                            빅맨 통합 (F/C)
                        </label>
                    </div>

                    <div className="space-y-3">
                        {/* Guard */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-700">가드 (G)</span>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => updatePosition('guard', -1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4 text-slate-600"/></button>
                                <span className="w-4 text-center font-bold text-lg">{positions.guard}</span>
                                <button type="button" onClick={() => updatePosition('guard', 1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-4 h-4"/></button>
                            </div>
                        </div>

                        {isFlexBigman ? (
                            // Bigman Only
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="font-bold text-slate-700">빅맨 (F/C)</span>
                                <div className="flex items-center gap-3">
                                    <button type="button" onClick={() => updatePosition('bigman', -1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4 text-slate-600"/></button>
                                    <span className="w-4 text-center font-bold text-lg">{positions.bigman}</span>
                                    <button type="button" onClick={() => updatePosition('bigman', 1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-4 h-4"/></button>
                                </div>
                            </div>
                        ) : (
                            // Forward & Center
                            <>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="font-bold text-slate-700">포워드 (F)</span>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => updatePosition('forward', -1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4 text-slate-600"/></button>
                                        <span className="w-4 text-center font-bold text-lg">{positions.forward}</span>
                                        <button type="button" onClick={() => updatePosition('forward', 1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-4 h-4"/></button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <span className="font-bold text-slate-700">센터 (C)</span>
                                    <div className="flex items-center gap-3">
                                        <button type="button" onClick={() => updatePosition('center', -1)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-4 h-4 text-slate-600"/></button>
                                        <span className="w-4 text-center font-bold text-lg">{positions.center}</span>
                                        <button type="button" onClick={() => updatePosition('center', 1)} className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                // Any Position
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">전체 인원</span>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => updateTotalCount(-1)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"><Minus className="w-5 h-5 text-slate-600"/></button>
                        <span className="min-w-[40px] text-center font-bold text-xl">{totalCount}명</span>
                        <button type="button" onClick={() => updateTotalCount(1)} className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"><Plus className="w-5 h-5"/></button>
                    </div>
                </div>
            )}
        </section>

        {/* SECTION 3: Match Specs */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-slate-400" />
                매치 조건
            </h2>

            <div className="space-y-4">
                {/* Match Type */}
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600">매치 타입</Label>
                    <div className="flex gap-2">
                        {['5vs5', '3vs3'].map((type) => (
                            <Badge
                                key={type}
                                onClick={() => setMatchType(type)}
                                variant="outline"
                                className={cn(
                                    "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                    matchType === type
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-500 border-slate-200"
                                )}
                            >
                                {type}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Gender */}
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600">성별</Label>
                    <div className="flex gap-2">
                        {[{v:'male', l:'남성'}, {v:'female', l:'여성'}, {v:'mixed', l:'혼성'}].map((g) => (
                            <Badge
                                key={g.v}
                                onClick={() => setGender(g.v)}
                                variant="outline"
                                className={cn(
                                    "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                    gender === g.v
                                        ? "bg-slate-900 text-white border-slate-900"
                                        : "bg-white text-slate-500 border-slate-200"
                                )}
                            >
                                {g.l}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Level Progress Bar */}
                <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-600">권장 레벨</Label>
                    <div className="space-y-3">
                        <div className="flex gap-1">
                            {/* Beginner 1-2 (Green) */}
                            {[1, 2].map((i) => (
                                <button
                                    key={`low-${i}`}
                                    type="button"
                                    onClick={() => setLevel('low')}
                                    className={cn(
                                        "flex-1 h-10 rounded-lg transition-all",
                                        level === 'low' ? "" : "bg-slate-200"
                                    )}
                                    style={{
                                        backgroundColor: level === 'low' ? '#22C55E' : undefined
                                    }}
                                    aria-label="초보 레벨 선택"
                                >
                                    <span className="sr-only">초보</span>
                                </button>
                            ))}
                            {/* Intermediate 3-4 (Yellow) */}
                            {[1, 2].map((i) => (
                                <button
                                    key={`middle-${i}`}
                                    type="button"
                                    onClick={() => setLevel('middle')}
                                    className={cn(
                                        "flex-1 h-10 rounded-lg transition-all",
                                        level === 'middle' ? "" : "bg-slate-200"
                                    )}
                                    style={{
                                        backgroundColor: level === 'middle' ? '#EAB308' : undefined
                                    }}
                                    aria-label="중수 레벨 선택"
                                >
                                    <span className="sr-only">중수</span>
                                </button>
                            ))}
                            {/* Advanced 5-6 (Orange) */}
                            {[1, 2].map((i) => (
                                <button
                                    key={`high-${i}`}
                                    type="button"
                                    onClick={() => setLevel('high')}
                                    className={cn(
                                        "flex-1 h-10 rounded-lg transition-all",
                                        level === 'high' ? "" : "bg-slate-200"
                                    )}
                                    style={{
                                        backgroundColor: level === 'high' ? '#FF6600' : undefined
                                    }}
                                    aria-label="고수 레벨 선택"
                                >
                                    <span className="sr-only">고수</span>
                                </button>
                            ))}
                            {/* Pro (Red) */}
                            <button
                                type="button"
                                onClick={() => setLevel('pro')}
                                className={cn(
                                    "flex-1 h-10 rounded-lg transition-all",
                                    level === 'pro' ? "" : "bg-slate-200"
                                )}
                                style={{
                                    backgroundColor: level === 'pro' ? '#EF4444' : undefined
                                }}
                                aria-label="프로 레벨 선택"
                            >
                                <span className="sr-only">프로</span>
                            </button>
                        </div>

                        {/* Color Underlines */}
                        <div className="flex gap-1">
                            <div className="flex gap-1" style={{ flex: 2 }}>
                                <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
                                <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#22C55E' }}></div>
                            </div>
                            <div className="flex gap-1" style={{ flex: 2 }}>
                                <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#EAB308' }}></div>
                                <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#EAB308' }}></div>
                            </div>
                            <div className="flex gap-1" style={{ flex: 2 }}>
                                <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#FF6600' }}></div>
                                <div className="flex-1 h-[3px] rounded-full" style={{ backgroundColor: '#FF6600' }}></div>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div className="h-[3px] rounded-full" style={{ backgroundColor: '#EF4444' }}></div>
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="flex gap-1">
                            <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#22C55E' }}>초보</div>
                            <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#EAB308' }}>중급</div>
                            <div className="text-center font-medium text-xs" style={{ flex: 2, color: '#FF6600' }}>상급</div>
                            <div className="text-center font-medium text-xs" style={{ flex: 1, color: '#EF4444' }}>프로</div>
                        </div>
                    </div>
                </div>

                {/* Age */}
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600">권장 나이</Label>
                    <div className="flex items-center gap-2">
                        <Badge
                            onClick={() => handleAgeSelection('any')}
                            variant="outline"
                            className={cn(
                                "cursor-pointer px-4 py-2 text-sm font-bold border transition-all",
                                selectedAges.includes('any')
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-500 border-slate-200"
                            )}
                        >
                            무관
                        </Badge>

                        <div className="h-6 w-px bg-slate-300"></div>

                        <ScrollArea className="w-full whitespace-nowrap">
                          <div className="flex items-center gap-2 pb-2">
                            {[
                                {v:'20', l:'20대'},
                                {v:'30', l:'30대'},
                                {v:'40', l:'40대'},
                                {v:'50', l:'50대'},
                                {v:'60', l:'60대'},
                                {v:'70', l:'70대'}
                            ].map((a) => {
                                const isSelected = selectedAges.includes(a.v);

                                return (
                                    <Badge
                                        key={a.v}
                                        onClick={() => handleAgeSelection(a.v)}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer px-4 py-2 text-sm font-bold border transition-all flex-shrink-0",
                                            isSelected
                                                ? "bg-slate-900 text-white border-slate-900"
                                                : "bg-white text-slate-500 border-slate-200"
                                        )}
                                    >
                                        {a.l}
                                    </Badge>
                                );
                            })}
                          </div>
                          <ScrollBar orientation="horizontal" className="hidden" />
                        </ScrollArea>
                    </div>
                </div>
            </div>
        </section>

        {/* SECTION 4: Game Format (Optional) */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-50 px-3 py-1.5 rounded-bl-xl border-l border-b border-blue-100">
                <span className="text-[10px] font-bold text-blue-600">작성하면 문의가 줄어들어요!</span>
            </div>

            <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Info className="w-5 h-5 text-slate-400" />
                경기 진행 방식 (선택)
            </h2>

            <div className="space-y-4">
                {/* Game Type */}
                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600">경기 형태</Label>
                    <div className="flex flex-wrap gap-2">
                        {[
                            {v:'internal_2', l:'자체전(2파전)'},
                            {v:'internal_3', l:'자체전(3파전)'},
                            {v:'exchange', l:'팀 교류전'},
                            {v:'practice', l:'연습/레슨'}
                        ].map(t => (
                            <Badge
                                key={t.v}
                                onClick={() => setGameFormatType(t.v)}
                                variant="outline"
                                className={cn(
                                    "cursor-pointer px-3 py-2 text-sm font-medium border transition-all",
                                    gameFormatType === t.v
                                        ? "bg-slate-800 text-white border-slate-800"
                                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                )}
                            >
                                {t.l}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Rules - Nudge UI */}
                {!showRules ? (
                    <button
                        type="button"
                        onClick={() => setShowRules(true)}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>상세 룰 추가</span>
                    </button>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className={cn(
                                "text-sm font-bold",
                                (ruleMinutes || ruleQuarters || ruleGames) ? "text-[#FF6600]" : "text-slate-600"
                            )}>
                                상세 룰 {(ruleMinutes || ruleQuarters || ruleGames) && "✓"}
                            </Label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowRules(false);
                                    setRuleMinutes("");
                                    setRuleQuarters("");
                                    setRuleGames("");
                                }}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Input
                                value={ruleMinutes}
                                onChange={(e) => setRuleMinutes(e.target.value)}
                                className="w-16 h-10 text-center bg-white border-slate-200"
                                placeholder="0"
                            />
                            <span className="text-sm text-slate-500">분</span>
                            <span className="text-slate-300">/</span>
                            <Input
                                 value={ruleQuarters}
                                 onChange={(e) => setRuleQuarters(e.target.value)}
                                className="w-16 h-10 text-center bg-white border-slate-200"
                                placeholder="0"
                            />
                            <span className="text-sm text-slate-500">쿼터</span>
                            <span className="text-slate-300">/</span>
                            <Input
                                 value={ruleGames}
                                 onChange={(e) => setRuleGames(e.target.value)}
                                className="w-16 h-10 text-center bg-white border-slate-200"
                                placeholder="0"
                            />
                            <span className="text-sm text-slate-500">경기</span>
                        </div>
                    </div>
                )}

                {/* Guaranteed Quarters - Nudge UI */}
                {!showGuaranteed ? (
                    <button
                        type="button"
                        onClick={() => setShowGuaranteed(true)}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>보장 쿼터 추가</span>
                    </button>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className={cn(
                                "text-sm font-bold",
                                guaranteedQuarters ? "text-[#FF6600]" : "text-slate-600"
                            )}>
                                보장 쿼터 {guaranteedQuarters && "✓"}
                            </Label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowGuaranteed(false);
                                    setGuaranteedQuarters("");
                                }}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <Input
                            value={guaranteedQuarters}
                            onChange={(e) => setGuaranteedQuarters(e.target.value)}
                            placeholder="예: 최소 6쿼터"
                            className="h-11 bg-white border-slate-200"
                        />
                    </div>
                )}

                {/* Referee - Nudge UI */}
                {!showReferee ? (
                    <button
                        type="button"
                        onClick={() => setShowReferee(true)}
                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-[#FF6600] font-medium transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>심판 추가</span>
                    </button>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className={cn(
                                "text-sm font-bold",
                                refereeType !== 'self' ? "text-[#FF6600]" : "text-slate-600"
                            )}>
                                심판 {refereeType !== 'self' && "✓"}
                            </Label>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReferee(false);
                                    setRefereeType("self");
                                }}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {[
                                {v:'self', l:'자체콜'},
                                {v:'member', l:'게스트/팀원'},
                                {v:'pro', l:'전문 심판'}
                            ].map(r => (
                                <Badge
                                    key={r.v}
                                    onClick={() => setRefereeType(r.v)}
                                    variant="outline"
                                    className={cn(
                                        "cursor-pointer px-3 py-2 text-sm font-medium border transition-all",
                                        refereeType === r.v
                                            ? "bg-slate-800 text-white border-slate-800"
                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                    )}
                                >
                                    {r.l}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>

        {/* SECTION 5: Admin Info */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6 mb-8">
            <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-400" />
                    운영 정보
                </h2>
                <button
                    type="button"
                    onClick={() => {
                        toast.info("팀 정보를 불러왔습니다.");
                        setSelectedTeam("team_slamdunk");
                    }}
                    className="text-xs font-bold text-slate-600 hover:text-[#FF6600] transition-colors"
                >
                    불러오기
                </button>
            </div>

            {/* Team Selection */}
            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">팀 선택</Label>
                {!isDirectInput ? (
                    <Select
                        value={selectedTeam}
                        onValueChange={(value) => {
                            if (value === "direct_input") {
                                setIsDirectInput(true);
                                setSelectedTeam("");
                            } else {
                                setSelectedTeam(value);
                            }
                        }}
                    >
                        <SelectTrigger className="h-12 bg-white border-slate-200">
                            <SelectValue placeholder="팀을 선택해주세요" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="team_slamdunk">🏀 팀 슬램덩크</SelectItem>
                            <SelectItem value="team_jordan">⛹️ Team Jordan</SelectItem>
                            <SelectItem value="direct_input">✏️ 직접 입력</SelectItem>
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="flex gap-2">
                        <Input
                            value={directTeamName}
                            onChange={(e) => setDirectTeamName(e.target.value)}
                            placeholder="팀 이름을 입력해주세요"
                            className="h-12 bg-white border-slate-200"
                        />
                        <Button
                            type="button"
                            onClick={() => {
                                setIsDirectInput(false);
                                setDirectTeamName("");
                            }}
                            variant="outline"
                            className="h-12 px-3"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                )}
                <p className="text-xs text-slate-500 mt-1">
                    💡 팀을 생성하면 다음부터 불러오기로 3초 만에 개설할 수 있어요!
                </p>
            </div>

            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600">계좌 정보</Label>
                    <div className="flex gap-2">
                        <Input
                            {...register('bankName')}
                            placeholder="은행명"
                            className="w-[100px] h-11 bg-white border-slate-200"
                        />
                        <Input
                            {...register('accountNumber')}
                            placeholder="계좌번호 (- 없이)"
                            className="flex-1 h-11 bg-white border-slate-200"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600 flex justify-between">
                        문의하기 (연락처)
                        <span className="text-xs font-normal text-[#FF6600]">프로필 정보 사용됨</span>
                    </Label>
                    <div className="relative">
                        <MessageCircle className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                        <Input
                            {...register('kakaoLink')}
                            placeholder="오픈채팅 또는 연락처 (프로필 기본값)"
                            className="pl-9 h-11 bg-white border-slate-200 text-sm"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        * 승인된 게스트에게만 공개됩니다.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-600">공지 내용</Label>
                    <Textarea
                        {...register('description')}
                        placeholder="기타 규칙이나 알림이 있다면 자유롭게 적어주세요."
                        className="min-h-[120px] bg-white border-slate-200 resize-none text-base"
                    />
                </div>
            </div>
        </section>

      </form>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 max-w-[760px] mx-auto">
          <Button
            onClick={handleSubmit(onSubmit)}
            className="w-full h-14 text-lg font-bold bg-[#FF6600] hover:bg-[#FF6600]/90 text-white rounded-xl shadow-lg shadow-orange-100"
          >
              경기 생성하기
          </Button>
      </div>

      {/* Dialog: Parking */}
      <Dialog open={showParkingDialog} onOpenChange={setShowParkingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>주차 정보</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">시간당 주차 요금</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={parkingCost}
                  onChange={(e) => setParkingCost(e.target.value)}
                  placeholder="금액 입력 (0원 = 무료)"
                  className="h-12 bg-white border-slate-200 pr-12 text-right"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">원</span>
              </div>
              <p className="text-xs text-slate-500">💡 0원을 입력하면 무료로 표시됩니다.</p>
            </div>
            <Button
              onClick={() => setShowParkingDialog(false)}
              className="w-full h-12 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Shower */}
      <Dialog open={showShowerDialog} onOpenChange={setShowShowerDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>샤워실 정보</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">샤워실 이용</Label>
              <div className="flex gap-2">
                {[
                  { v: 'free', l: '무료' },
                  { v: 'paid', l: '유료' },
                  { v: 'unavailable', l: '불가' }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.v}
                    onClick={() => setShowerOption(opt.v)}
                    className={cn(
                      "flex-1 py-3 rounded-xl text-sm font-medium border transition-all",
                      showerOption === opt.v
                        ? "bg-[#FF6600] text-white border-[#FF6600]"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowShowerDialog(false)}
              className="w-full h-12 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Court Size */}
      <Dialog open={showCourtSizeDialog} onOpenChange={setShowCourtSizeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>코트 크기</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">코트 사이즈</Label>
              <div className="space-y-2">
                {[
                  { v: 'regular', l: '정규 사이즈', desc: '표준 코트입니다' },
                  { v: 'short', l: '세로가 좀 짧아요', desc: '정규보다 짧습니다' },
                  { v: 'narrow', l: '가로가 좀 좁아요', desc: '정규보다 좁습니다' }
                ].map(opt => (
                  <button
                    type="button"
                    key={opt.v}
                    onClick={() => setCourtSize(opt.v)}
                    className={cn(
                      "w-full p-4 rounded-xl text-left border transition-all",
                      courtSize === opt.v
                        ? "bg-orange-50 border-[#FF6600] ring-1 ring-[#FF6600]"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <div className="font-medium text-slate-900">{opt.l}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <Button
              onClick={() => setShowCourtSizeDialog(false)}
              className="w-full h-12 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-xl"
            >
              확인
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
