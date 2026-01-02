'use client';

import { useState, useEffect, useRef } from 'react';
import { FileText, MapPin, Clock, Minus, Plus, RotateCcw, ExternalLink } from 'lucide-react';
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

// Location data type from Kakao Local API
interface LocationData {
  place_name: string;
  address_name: string;
  x: string; // longitude
  y: string; // latitude
  place_url?: string;
}

export function MatchCreateView() {
  // Auto-scroll on input focus
  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
  };

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
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const locationInputRef = useRef<HTMLDivElement>(null);
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

  // Debounce timer
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Search places using Next.js API route (which calls Kakao API)
  const searchPlaces = async (keyword: string) => {
    if (keyword.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `/api/search-places?query=${encodeURIComponent(keyword)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch places');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const places: LocationData[] = data.documents.map((place: any) => ({
        place_name: place.place_name,
        address_name: place.address_name,
        x: place.x,
        y: place.y,
        place_url: place.place_url,
      }));

      setSearchResults(places);
      setShowDropdown(places.length > 0);
    } catch (error) {
      console.error('Place search error:', error);
      toast.error('장소 검색에 실패했습니다');
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle location input change with debounce
  const handleLocationInput = (value: string) => {
    setLocation(value);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer (200ms debounce)
    debounceTimer.current = setTimeout(() => {
      searchPlaces(value);
    }, 200);
  };

  // Handle location selection from dropdown
  const handleLocationSelect = (place: LocationData) => {
    setLocationData(place);
    setLocation(`${place.address_name} (${place.place_name})`);
    setShowDropdown(false);
    setSearchResults([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationInputRef.current && !locationInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error('날짜를 선택해주세요');
      return;
    }
    if (!location) {
      toast.error('장소를 입력해주세요');
      return;
    }

    const totalPositions = isFlexBigman
      ? positions.guard + positions.bigman
      : positions.guard + positions.forward + positions.center;

    if (totalPositions === 0) {
      toast.error('최소 1명 이상 모집해야 합니다');
      return;
    }

    const payload = {
      date: selectedDate,
      startTime,
      duration,
      location,
      locationData, // Contains structured address and buildingName
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

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
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

          {/* Location */}
          <div className="mb-6">
            <Label className="text-sm font-bold text-slate-900 mb-2 block">장소</Label>
            <div className="relative" ref={locationInputRef}>
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
              <Input
                placeholder="체육관 검색..."
                value={location}
                onChange={(e) => handleLocationInput(e.target.value)}
                onFocus={(e) => {
                  handleInputFocus(e);
                  if (searchResults.length > 0) {
                    setShowDropdown(true);
                  }
                }}
                className={cn("pl-10 h-12", locationData?.place_url && "pr-12")}
              />
              {locationData?.place_url && (
                <a
                  href={locationData.place_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-[#FF6600] hover:bg-orange-50 rounded-md transition-colors z-10"
                  title="카카오맵에서 확인"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}

              {/* Search Results Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[280px] overflow-y-auto">
                  {isSearching ? (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      검색 중...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((place, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-2 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                      >
                        <button
                          onClick={() => handleLocationSelect(place)}
                          className="flex-1 flex items-start gap-2 text-left min-w-0"
                        >
                          <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-slate-900 mb-0.5">
                              {place.place_name}
                            </div>
                            <div className="text-xs text-slate-600">
                              {place.address_name}
                            </div>
                          </div>
                        </button>
                        {place.place_url && (
                          <a
                            href={place.place_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0 p-2 text-slate-400 hover:text-[#FF6600] hover:bg-orange-50 rounded-md transition-colors"
                            title="카카오맵에서 확인"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-slate-500">
                      검색 결과가 없습니다
                    </div>
                  )}
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
