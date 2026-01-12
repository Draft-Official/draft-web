'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, MapPin, Clock, Minus, Plus, RotateCcw, MapPinned, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { matchCreateSchema } from '../model/schema';

// Location data type
interface LocationData {
  address: string;
  buildingName?: string;
  bname?: string; // 동 이름 (지역 필터링용)
  placeUrl?: string; // Kakao Map URL
}

export function MatchCreateView() {
  const router = useRouter();

  // Auto-scroll on input focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };
  
  // ... (Optimization: Keeping previous code structure, focusing on the changes)

  // 14-day calendar
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
        label: `${month}/${date}`,
        dayNum: date,
        dayStr: day,
        isToday: i === 0,
      });
    }
    return dates;
  };

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('07:00');
  const [duration, setDuration] = useState('2시간');
  const [location, setLocation] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [locationSearchResults, setLocationSearchResults] = useState<LocationData[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [price, setPrice] = useState('');
  const [hostType, setHostType] = useState('개인 (본인)');

  // Positions
  const [isFlexBigman, setIsFlexBigman] = useState(false);
  const [positions, setPositions] = useState({
    guard: 0,
    forward: 0,
    center: 0,
    bigman: 0
  });

  const updatePosition = (key: keyof typeof positions, delta: number) => {
    setPositions(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] + delta)
    }));
  };

  // Management Info
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  // Match Specs
  const [matchType, setMatchType] = useState<'5vs5' | '3vs3'>('5vs5');
  const [gender, setGender] = useState<'남성' | '혼성' | '여성'>('혼성');
  const [level, setLevel] = useState<'초보(C)' | '중수(B)' | '고수(A)'>('중수(B)');
  const [facilities, setFacilities] = useState<string[]>([]);

  const facilityOptions = ['주차가능', '샤워실', '실내', '냉난방', '정수기'];

  const toggleFacility = (facility: string) => {
    setFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    );
  };

  // Notes
  const [notes, setNotes] = useState('');

  // Auto-resize textarea
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

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
        
        const mappedResults: LocationData[] = results.map(place => ({
            address: place.road_address_name || place.address_name,
            buildingName: place.place_name,
            bname: place.address_name.split(' ')[2],
            placeUrl: place.place_url
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
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = () => {
    // Zod 스키마 검증
    const formData = {
      selectedDate: selectedDate || '',
      startTime,
      duration,
      location,
      locationData,
      price: price || '0',
      hostType,
      positions,
      isFlexBigman,
      bankName,
      accountNumber,
      contactInfo,
      matchType,
      gender,
      level,
      facilities,
      announcements: notes,
    };

    const result = matchCreateSchema.safeParse(formData);

    if (!result.success) {
      // 첫 번째 에러 메시지 표시
      const firstError = result.error.issues[0];
      toast.error(firstError.message);
      return;
    }

    const payload = {
      date: selectedDate,
      startTime,
      duration,
      location,
      locationData,
      price,
      hostType,
      positions: isFlexBigman
        ? { guard: positions.guard, bigman: positions.bigman }
        : { guard: positions.guard, forward: positions.forward, center: positions.center },
      bankName,
      accountNumber,
      contactInfo,
      matchType,
      gender,
      level,
      facilities,
      notes
    };

    console.log('Creating Match:', payload);
    toast.success('경기 모집이 등록되었습니다!');
  };

  const dates = getNext14Days();

  // Helper to open map
  const openKakaoMap = () => {
    if (locationData?.placeUrl) {
      window.open(locationData.placeUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* ... Header ... */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100">
        <div className="max-w-[760px] mx-auto flex items-center justify-between px-5 h-14">
          <h1 className="text-lg font-bold text-slate-900">경기 개설</h1>
          <Button
            variant="ghost"
            size="sm"
            className="text-[#FF6600] font-semibold hover:text-[#FF6600]/90 hover:bg-orange-50"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            불러오기
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[760px] mx-auto px-5 py-6 space-y-8">
        {/* Basic Info Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          {/* ... Date Picker & Time inputs (Keep existing) ... */}
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">기본 정보</h2>
          </div>

          {/* Date Picker */}
          <div className="mb-6">
            <Label className="text-sm font-bold text-slate-900 mb-3 block">
              일시 <span className="text-[#FF6600] ml-1">(2주 이내 경기만 개설 가능)</span>
            </Label>
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {dates.map((date) => (
                  <button
                    key={date.dateISO}
                    onClick={() => setSelectedDate(date.dateISO)}
                    className={cn(
                      "flex flex-col items-center justify-center min-w-[52px] h-[56px] rounded-lg border-2 transition-all",
                      selectedDate === date.dateISO
                        ? "border-[#FF6600] bg-orange-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className={cn(
                      "text-[10px] mb-0.5",
                      selectedDate === date.dateISO ? "text-[#FF6600]" : "text-slate-500"
                    )}>
                      {date.dayStr}
                    </div>
                    <div className={cn(
                      "text-xl font-bold",
                      selectedDate === date.dateISO ? "text-[#FF6600]" : "text-slate-900"
                    )}>
                      {date.dayNum}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Time & Duration */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-sm font-bold text-slate-900 mb-2 block">시작 시간</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm font-bold text-slate-900 mb-2 block">진행 시간</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1시간">1시간</SelectItem>
                  <SelectItem value="1시간 30분">1시간 30분</SelectItem>
                  <SelectItem value="2시간">2시간</SelectItem>
                  <SelectItem value="2시간 30분">2시간 30분</SelectItem>
                  <SelectItem value="3시간">3시간</SelectItem>
                  <SelectItem value="3시간 30분">3시간 30분</SelectItem>
                  <SelectItem value="4시간">4시간</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location with Map Link */}
          <div className="mb-6">
            <Label className="text-sm font-bold text-slate-900 mb-2 block">장소</Label>
            <div className="relative" ref={locationInputRef}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
              <Input
                placeholder="체육관 검색 (예: 서초종합체육관)"
                value={location}
                onChange={(e) => handleLocationSearch(e.target.value)}
                onFocus={(e) => {
                  handleInputFocus(e);
                  if (locationSearchResults.length > 0) {
                    setShowLocationDropdown(true);
                  }
                }}
                className="pl-10 h-12 pr-12" 
              />
              
              {/* Map Link Icon (Visible if placeUrl exists) */}
              {locationData?.placeUrl && (
                <button 
                  onClick={openKakaoMap}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors group flex items-center justify-center"
                  title="카카오맵에서 보기"
                >
                    <MapPinned className="w-4 h-4 text-[#FF6600]" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showLocationDropdown && locationSearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto">
                  {locationSearchResults.map((result, index) => (
                    <div
                      key={index}
                      className="w-full flex items-center justify-between border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors group"
                    >
                      {/* Main Select Action */}
                      <button
                         onClick={() => handleLocationSelect(result)}
                         className="flex-1 px-4 py-3 text-left flex items-start gap-2 min-w-0"
                      >
                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0 group-hover:text-[#FF6600]" />
                        <div className="flex-1 min-w-0">
                          {result.buildingName && (
                            <div className="text-sm font-bold text-slate-900 mb-0.5 truncate">
                              {result.buildingName}
                            </div>
                          )}
                          <div className={cn(
                            "text-xs text-slate-600 truncate",
                            !result.buildingName && "text-sm font-medium text-slate-900"
                          )}>
                            {result.address}
                          </div>
                        </div>
                      </button>

                      {/* Map Link Action */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(result.placeUrl, '_blank');
                        }}
                        className="px-3 py-3 text-slate-300 hover:text-[#FF6600] transition-colors"
                        title="카카오맵 보기"
                      >
                         <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <Label className="text-sm font-bold text-slate-900 mb-2 block">참가비 (1인)</Label>
            <div className="relative">
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                value={price}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setPrice(value);
                }}
                onFocus={handleInputFocus}
                className="h-12 pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">원</span>
            </div>
          </div>

          {/* Host Type */}
          <div>
            <Label className="text-sm font-bold text-slate-900 mb-2 block">주최자 정보</Label>
            <Select value={hostType} onValueChange={setHostType}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="개인 (본인)">개인 (본인)</SelectItem>
                <SelectItem value="팀">팀</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Recruitment Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">모집 내용</h2>

          {/* Position Mode Toggle */}
          <div className="flex items-center justify-between mb-6">
            <Label className="text-sm font-bold text-slate-900">포지션별 인원</Label>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={isFlexBigman}
                onCheckedChange={(checked) => setIsFlexBigman(checked as boolean)}
              />
              <Label className="text-sm text-slate-600">빅맨 통합 (F/C)</Label>
            </div>
          </div>

          {/* Position Counters */}
          <div className="space-y-2">
            {/* Guard */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
              <span className="text-sm font-bold text-slate-900">가드 (G)</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updatePosition('guard', -1)}
                  className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="text-xl font-bold text-slate-900 min-w-[32px] text-center">
                  {positions.guard}
                </span>
                <button
                  onClick={() => updatePosition('guard', 1)}
                  className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Forward (or Bigman) */}
            {!isFlexBigman ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm font-bold text-slate-900">포워드 (F)</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePosition('forward', -1)}
                    className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-xl font-bold text-slate-900 min-w-[32px] text-center">
                    {positions.forward}
                  </span>
                  <button
                    onClick={() => updatePosition('forward', 1)}
                    className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm font-bold text-slate-900">빅맨 (F/C)</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePosition('bigman', -1)}
                    className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-xl font-bold text-slate-900 min-w-[32px] text-center">
                    {positions.bigman}
                  </span>
                  <button
                    onClick={() => updatePosition('bigman', 1)}
                    className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}

            {/* Center */}
            {!isFlexBigman && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <span className="text-sm font-bold text-slate-900">센터 (C)</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updatePosition('center', -1)}
                    className="w-8 h-8 rounded-full border-2 border-slate-300 flex items-center justify-center hover:border-slate-400 transition-colors"
                  >
                    <Minus className="w-4 h-4 text-slate-600" />
                  </button>
                  <span className="text-xl font-bold text-slate-900 min-w-[32px] text-center">
                    {positions.center}
                  </span>
                  <button
                    onClick={() => updatePosition('center', 1)}
                    className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Management Info Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-2">운영 정보 <span className="text-sm text-slate-500 font-normal">(비공개)</span></h2>

          <div className="space-y-4 mb-6">
            {/* Bank Account */}
            <div>
              <Label className="text-sm font-bold text-slate-900 mb-2 block">계좌 정보</Label>
              <div className="grid grid-cols-[120px_1fr] gap-3">
                <Input
                  placeholder="은행명"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  onFocus={handleInputFocus}
                  className="h-12"
                />
                <Input
                  placeholder="계좌번호 (- 없이)"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  onFocus={handleInputFocus}
                  className="h-12"
                />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-bold text-slate-900">문의하기 (연락처)</Label>
                <button className="text-xs text-[#FF6600] font-semibold">프로필 정보 사용팁</button>
              </div>
              <Input
                placeholder="오픈채팅 또는 연락처 (프로필 기본값)"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                onFocus={handleInputFocus}
                className="h-12"
              />
            </div>
          </div>

          <p className="text-xs text-slate-500">* 승인된 게스트에게만 공개됩니다.</p>
        </section>

        {/* Match Specs Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          {/* Match Type */}
          <div className="mb-6">
            <Label className="text-sm font-bold text-slate-900 mb-3 block">매치 타입</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMatchType('5vs5')}
                className={cn(
                  "h-12 rounded-xl font-bold transition-all",
                  matchType === '5vs5'
                    ? "bg-white text-slate-900 border-2 border-slate-900"
                    : "bg-slate-50 text-slate-400 border-2 border-transparent"
                )}
              >
                5vs5
              </button>
              <button
                onClick={() => setMatchType('3vs3')}
                className={cn(
                  "h-12 rounded-xl font-bold transition-all",
                  matchType === '3vs3'
                    ? "bg-white text-slate-900 border-2 border-slate-900"
                    : "bg-slate-50 text-slate-400 border-2 border-transparent"
                )}
              >
                3vs3
              </button>
            </div>
          </div>

          {/* Gender */}
          <div className="mb-6">
            <Label className="text-sm font-bold text-slate-900 mb-3 block">성별</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['남성', '혼성', '여성'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={cn(
                    "h-12 rounded-xl font-bold transition-all",
                    gender === g
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 border-2 border-slate-200"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Level */}
          <div className="mb-6">
            <Label className="text-sm font-bold text-slate-900 mb-3 block">레벨</Label>
            <div className="grid grid-cols-3 gap-3">
              {(['초보(C)', '중수(B)', '고수(A)'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "h-12 rounded-xl font-bold transition-all",
                    level === l
                      ? "bg-[#FF6600] text-white"
                      : "bg-white text-slate-600 border-2 border-slate-200"
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div>
            <Label className="text-sm font-bold text-slate-900 mb-3 block">편의 시설</Label>
            <div className="flex flex-wrap gap-2">
              {facilityOptions.map((facility) => (
                <Badge
                  key={facility}
                  onClick={() => toggleFacility(facility)}
                  className={cn(
                    "px-4 py-2 text-sm cursor-pointer transition-all",
                    facilities.includes(facility)
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  )}
                >
                  {facility}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">참고 사항</h2>

          <div>
            <Label className="text-sm font-bold text-slate-900 mb-2 block">공지 내용</Label>
            <Textarea
              placeholder="경기 진행 방식, 주차 안내, 기타 공지사항을 자유롭게 적어주세요."
              value={notes}
              onChange={handleNotesChange}
              onFocus={handleInputFocus}
              className="min-h-[120px] resize-none overflow-hidden"
            />
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 shadow-lg">
        <div className="max-w-[760px] mx-auto px-5 py-4">
          <Button
            onClick={handleSubmit}
            className="w-full h-14 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold text-lg rounded-xl"
          >
            경기 생성하기
          </Button>
        </div>
      </div>
    </div>
  );
}
