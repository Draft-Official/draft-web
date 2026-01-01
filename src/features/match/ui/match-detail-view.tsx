'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Trophy, User, Users as UsersIcon, Calendar as CalendarIcon, UsersRound, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/shared/lib/utils';
import { toast } from 'sonner';

interface Match {
  id: string;
  dateISO: string;
  startTime: string;
  endTime: string;
  price: string;
  priceNum?: number;
  title: string;
  teamName?: string;
  location: string;
  address: string;
  isClosed?: boolean;
  positions: {
    all?: { status: 'open' | 'closed'; max: number };
    g?: { status: 'open' | 'closed'; max: number };
    f?: { status: 'open' | 'closed'; max: number };
    c?: { status: 'open' | 'closed'; max: number };
  };
  level?: string;
  gender?: 'men' | 'women' | 'mixed';
  gameFormat?: string;
  ageRange?: string;
  totalPlayers?: number;
  currentPlayers?: number;
  hostName?: string;
  hostImage?: string;
  teamLogo?: string;
  hostMessage?: string;
  cancelPolicy?: string;
}

interface MatchDetailViewProps {
  match: Match;
}

export function MatchDetailView({ match }: MatchDetailViewProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [applied, setApplied] = useState(false);
  const [nickname, setNickname] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('');

  const openDialogWithPosition = (positionCode: string) => {
    setSelectedPosition(positionCode);
    setDialogOpen(true);
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 클립보드에 복사되었습니다');
    } catch (err) {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleAddressCopy = async () => {
    try {
      await navigator.clipboard.writeText(match.address);
      toast.success('주소가 클립보드에 복사되었습니다');
    } catch (err) {
      toast.error('복사에 실패했습니다');
    }
  };

  const handleMapClick = () => {
    // 카카오맵으로 주소 검색 (무료)
    const mapUrl = `https://map.kakao.com/link/search/${encodeURIComponent(match.address)}`;
    window.open(mapUrl, '_blank');
  };

  const handleApply = () => {
    if (!nickname.trim()) {
      toast.error('닉네임을 입력해주세요');
      return;
    }
    if (!selectedPosition) {
      toast.error('포지션을 선택해주세요');
      return;
    }

    setApplied(true);
    setDialogOpen(false);
    toast.success('신청이 완료되었습니다!');
  };

  // Format date
  const formatDate = (dateISO: string) => {
    const date = new Date(dateISO);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[date.getDay()];
    return `${month}월 ${day}일 ${dayName}요일`;
  };

  // Format gender
  const formatGender = (gender?: 'men' | 'women' | 'mixed') => {
    if (gender === 'men') return '남성';
    if (gender === 'women') return '여성';
    if (gender === 'mixed') return '남녀 무관';
    return '-';
  };

  // Available positions for application
  const availablePositions = [];
  if (match.positions.all?.status === 'open') {
    availablePositions.push({ code: 'all', label: '포지션 무관' });
  }
  if (match.positions.g?.status === 'open') {
    availablePositions.push({ code: 'g', label: '가드' });
  }
  if (match.positions.f?.status === 'open') {
    availablePositions.push({ code: 'f', label: '포워드' });
  }
  if (match.positions.c?.status === 'open') {
    availablePositions.push({ code: 'c', label: '센터' });
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5 text-slate-900" />
          </button>
          <button
            onClick={handleShareClick}
            className="p-2 hover:bg-slate-50 rounded-lg transition-colors -mr-2"
          >
            <Share2 className="w-5 h-5 text-slate-900" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-6">
        {/* Title */}
        <h1 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
          {match.teamName ? `${match.teamName}에서 게스트 모집합니다!` : '게스트 모집합니다!'}
        </h1>

        {/* Date & Time */}
        <div className="text-lg font-bold text-slate-900 mb-2">
          {formatDate(match.dateISO)} {match.startTime} ~ {match.endTime}
        </div>

        {/* Location */}
        <div className="mb-3">
          <div className="text-[21px] font-bold text-slate-900 mb-1">{match.location}</div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>{match.address}</span>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleAddressCopy}
              className="text-slate-500 hover:text-slate-700 underline"
            >
              주소복사
            </button>
            <button
              onClick={handleMapClick}
              className="text-slate-500 hover:text-slate-700 underline"
            >
              지도보기
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-4" />

        {/* Price */}
        <div>
          <div className="text-sm text-slate-500 mb-1">참가비</div>
          <div className="flex items-baseline">
            <span className="text-xl font-extrabold text-slate-900">{match.price}</span>
            <span className="ml-1 text-sm text-slate-400">/ 2시간</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 my-4" />

        {/* Game Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Level */}
          {match.level && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-50">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5 text-[#FF6600]" />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">레벨</div>
                <div className="font-bold text-sm text-slate-900">{match.level}</div>
              </div>
            </div>
          )}

          {/* Gender */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-0.5">성별</div>
              <div className="font-bold text-sm text-slate-900">{formatGender(match.gender)}</div>
            </div>
          </div>

          {/* Game Format */}
          {match.gameFormat && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-red-50">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <UsersIcon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">진행 방식</div>
                <div className="font-bold text-sm text-slate-900">{match.gameFormat}</div>
              </div>
            </div>
          )}

          {/* Age Range */}
          {match.ageRange && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <CalendarIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">나이</div>
                <div className="font-bold text-sm text-slate-900">{match.ageRange}</div>
              </div>
            </div>
          )}
        </div>

        {/* Total Players */}
        {match.totalPlayers && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0">
                <UsersRound className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-0.5">총인원</div>
                <div className="font-bold text-sm text-slate-900">
                  {match.totalPlayers}명 (현재 {match.currentPlayers || 0}명)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-8" />

        {/* Host Info */}
        {match.hostName && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <span className="text-2xl">
                  🏀
                </span>
              </div>
              <div>
                <div className="font-bold text-base text-slate-900">
                  {match.teamName || match.hostName}
                </div>
                <div className="text-xs text-slate-500">호스트 {match.hostName}</div>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              문의하기
            </Button>
          </div>
        )}

        {/* Host Message */}
        {match.hostMessage && (
          <div className="mb-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-start gap-2">
              <MessageCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-700 leading-relaxed">{match.hostMessage}</p>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-6" />

        {/* Recruitment Positions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">모집 포지션</h2>
          <div className="space-y-3">
            {/* Guard */}
            {match.positions.g && (
              <div className={cn(
                "flex items-center justify-between p-3 rounded-xl border-2",
                match.positions.g.status === 'closed'
                  ? "bg-slate-50 border-slate-200"
                  : "bg-white border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base",
                    match.positions.g.status === 'closed' ? "bg-slate-300" : "bg-slate-400"
                  )}>
                    G
                  </div>
                  <div>
                    <div className={cn(
                      "font-bold text-base mb-1",
                      match.positions.g.status === 'closed' ? "text-slate-400" : "text-slate-900"
                    )}>
                      가드
                    </div>
                    <div className={cn(
                      "text-sm",
                      match.positions.g.status === 'closed' ? "text-slate-400" : "text-slate-500"
                    )}>
                      {match.positions.g.status === 'closed' ? match.positions.g.max : 0}/{match.positions.g.max} 명
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (match.positions.g?.status === 'open') {
                      openDialogWithPosition('g');
                    }
                  }}
                  disabled={match.positions.g.status === 'closed'}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    match.positions.g.status === 'closed'
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-[#FF6600] text-white hover:bg-[#FF6600]/90 active:scale-95 cursor-pointer"
                  )}
                >
                  {match.positions.g.status === 'closed' ? '마감' : '신청가능'}
                </button>
              </div>
            )}

            {/* Forward */}
            {match.positions.f && (
              <div className={cn(
                "rounded-xl border-2",
                match.positions.f.status === 'open'
                  ? "bg-orange-50/30 border-orange-200"
                  : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base",
                      match.positions.f.status === 'open' ? "bg-[#FF6600]" : "bg-slate-300"
                    )}>
                      F
                    </div>
                    <div>
                      <div className={cn(
                        "font-bold text-base mb-1",
                        match.positions.f.status === 'closed' ? "text-slate-400" : "text-slate-900"
                      )}>
                        포워드
                      </div>
                      <div className={cn(
                        "text-sm",
                        match.positions.f.status === 'closed' ? "text-slate-400" : "text-slate-600"
                      )}>
                        {match.positions.f.status === 'closed' ? match.positions.f.max : 0}/{match.positions.f.max} 명
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (match.positions.f?.status === 'open') {
                        openDialogWithPosition('f');
                      }
                    }}
                    disabled={match.positions.f.status === 'closed'}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      match.positions.f.status === 'closed'
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-[#FF6600] text-white hover:bg-[#FF6600]/90 active:scale-95 cursor-pointer"
                    )}
                  >
                    {match.positions.f.status === 'closed' ? '마감' : '신청가능'}
                  </button>
                </div>
              </div>
            )}

            {/* Center */}
            {match.positions.c && (
              <div className={cn(
                "rounded-xl border-2",
                match.positions.c.status === 'open'
                  ? "bg-orange-50/30 border-orange-200"
                  : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base",
                      match.positions.c.status === 'open' ? "bg-[#FF6600]" : "bg-slate-300"
                    )}>
                      C
                    </div>
                    <div>
                      <div className={cn(
                        "font-bold text-base mb-1",
                        match.positions.c.status === 'closed' ? "text-slate-400" : "text-slate-900"
                      )}>
                        센터
                      </div>
                      <div className={cn(
                        "text-sm",
                        match.positions.c.status === 'closed' ? "text-slate-400" : "text-slate-600"
                      )}>
                        {match.positions.c.status === 'closed' ? match.positions.c.max : 0}/{match.positions.c.max} 명
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (match.positions.c?.status === 'open') {
                        openDialogWithPosition('c');
                      }
                    }}
                    disabled={match.positions.c.status === 'closed'}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                      match.positions.c.status === 'closed'
                        ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                        : "bg-[#FF6600] text-white hover:bg-[#FF6600]/90 active:scale-95 cursor-pointer"
                    )}
                  >
                    {match.positions.c.status === 'closed' ? '마감' : '신청가능'}
                  </button>
                </div>
              </div>
            )}

            {/* All positions */}
            {match.positions.all && (
              <div className={cn(
                "flex items-center justify-between p-3 rounded-xl border-2",
                match.positions.all.status === 'closed'
                  ? "bg-slate-50 border-slate-200"
                  : "bg-orange-50/30 border-orange-200"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm",
                    match.positions.all.status === 'closed' ? "bg-slate-300" : "bg-[#FF6600]"
                  )}>
                    ALL
                  </div>
                  <div>
                    <div className={cn(
                      "font-bold text-base mb-1",
                      match.positions.all.status === 'closed' ? "text-slate-400" : "text-slate-900"
                    )}>
                      포지션 무관
                    </div>
                    <div className={cn(
                      "text-sm",
                      match.positions.all.status === 'closed' ? "text-slate-400" : "text-slate-600"
                    )}>
                      {match.positions.all.status === 'closed' ? match.positions.all.max : 0}/{match.positions.all.max} 명
                    </div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (match.positions.all?.status === 'open') {
                      openDialogWithPosition('all');
                    }
                  }}
                  disabled={match.positions.all.status === 'closed'}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    match.positions.all.status === 'closed'
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-[#FF6600] text-white hover:bg-[#FF6600]/90 active:scale-95 cursor-pointer"
                  )}
                >
                  {match.positions.all.status === 'closed' ? '마감' : '신청가능'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mb-6" />

        {/* Cancellation Policy */}
        {match.cancelPolicy && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">취소 및 환불 규정</h2>
            <div className="p-4 rounded-xl bg-slate-50">
              <ul className="space-y-2 text-sm text-slate-700">
                {match.cancelPolicy.split('\n').filter(line => line.trim()).map((line, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 shadow-lg">
        <div className="max-w-[760px] mx-auto px-4 py-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full h-12 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold text-base rounded-xl transition-all active:scale-98"
                disabled={match.isClosed || applied}
              >
                {applied ? '신청 완료' : match.isClosed ? '마감되었습니다' : '신청하기'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">게스트 신청하기</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Nickname Input */}
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm font-bold text-slate-900">
                    닉네임
                  </Label>
                  <Input
                    id="nickname"
                    placeholder="사용하실 닉네임을 입력해주세요"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="h-11"
                  />
                </div>

                {/* Position Selection */}
                {availablePositions.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-900">
                      포지션 선택
                    </Label>
                    <RadioGroup value={selectedPosition} onValueChange={setSelectedPosition}>
                      {availablePositions.map((pos) => (
                        <div key={pos.code} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:border-[#FF6600]/50 transition-colors">
                          <RadioGroupItem value={pos.code} id={pos.code} />
                          <Label htmlFor={pos.code} className="flex-1 cursor-pointer font-medium">
                            {pos.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                )}

                {/* Payment Info */}
                <div className="p-4 rounded-lg bg-slate-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">참가비</span>
                    <span className="text-base font-bold text-slate-900">{match.price}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    신청 완료 후 주최자가 안내하는 계좌로 입금해주세요.
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleApply}
                  className="w-full h-11 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white font-bold rounded-lg"
                >
                  신청 완료하기
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
