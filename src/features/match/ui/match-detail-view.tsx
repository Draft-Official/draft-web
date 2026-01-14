'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Share2, Trophy, User, Users as UsersIcon, Calendar as CalendarIcon, UsersRound, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { MatchInfoCard } from './components/match-info-card';
import { RecruitmentStatusCard } from './components/recruitment-status-card';

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
            <ChevronLeft className="w-6 h-6 text-slate-900" />
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
            <MatchInfoCard
                icon={Trophy}
                label="레벨"
                value={match.level}
                color="orange"
            />
          )}

          {/* Gender */}
          <MatchInfoCard
              icon={User}
              label="성별"
              value={formatGender(match.gender)}
              color="blue"
          />

          {/* Game Format */}
          {match.gameFormat && (
            <MatchInfoCard
                icon={UsersIcon}
                label="진행 방식"
                value={match.gameFormat}
                color="red"
            />
          )}

          {/* Age Range */}
          {match.ageRange && (
            <MatchInfoCard
                icon={CalendarIcon}
                label="나이"
                value={match.ageRange}
                color="green"
            />
          )}
        </div>

        {/* Total Players */}
        {match.totalPlayers && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <MatchInfoCard
                icon={UsersRound}
                label="총인원"
                value={`${match.totalPlayers}명 (현재 ${match.currentPlayers || 0}명)`}
                color="purple"
            />
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
              <RecruitmentStatusCard
                positionCode="g"
                label="가드"
                status={match.positions.g.status}
                max={match.positions.g.max}
                current={0} // Mock current
                onClick={() => openDialogWithPosition('g')}
              />
            )}

            {/* Forward */}
            {match.positions.f && (
              <RecruitmentStatusCard
                positionCode="f"
                label="포워드"
                status={match.positions.f.status}
                max={match.positions.f.max}
                current={0}
                onClick={() => openDialogWithPosition('f')}
              />
            )}

            {/* Center */}
            {match.positions.c && (
              <RecruitmentStatusCard
                positionCode="c"
                label="센터"
                status={match.positions.c.status}
                max={match.positions.c.max}
                current={0}
                onClick={() => openDialogWithPosition('c')}
              />
            )}

            {/* All positions */}
            {match.positions.all && (
              <RecruitmentStatusCard
                positionCode="all"
                label="포지션 무관"
                status={match.positions.all.status}
                max={match.positions.all.max}
                current={0}
                onClick={() => openDialogWithPosition('all')}
              />
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
