'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Flag,
  Megaphone,
  Users,
  ClipboardList,
  ChevronRight,
  CheckCircle,
  User,
  Calendar,
  Settings,
  Copy,
  CreditCard,
  MessageCircle,
  ThumbsUp,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Types & Mock Data
import type { Match, Applicant } from '../model/types';
import { ApplicantStatus } from '../model/types';
import { MOCK_MATCHES, MOCK_APPLICANTS, MOCK_TEAM } from '../model/mock-data';

export function HostDashboardView() {
  const router = useRouter();
  const [hasTeam] = useState(true);
  const matchesRef = useRef<HTMLDivElement>(null);

  // Computed State for Smart Banner
  const pendingApplicantsCount = MOCK_MATCHES
    .filter(m => !m.isPast)
    .reduce((acc, match) => acc + match.pendingCount, 0);

  // Handlers
  const scrollToMatches = () => {
    matchesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans">
      {/* 1. Quick Action Menu (Top) */}
      <QuickActionMenu
        onTeamCreate={() => toast.info("팀 생성 페이지로 이동합니다 (준비중)")}
        onRecruit={() => router.push('/match/create')}
        onTeamManage={() => toast.info("팀원 관리 모달 오픈")}
        onMatchManage={scrollToMatches}
        hasTeam={hasTeam}
      />

      {/* 2. Smart Action Banner */}
      {pendingApplicantsCount > 0 && (
        <SmartActionBanner count={pendingApplicantsCount} />
      )}

      <div className="p-4 space-y-6 max-w-[760px] mx-auto">
        {/* 3. Team Identity Card */}
        {hasTeam && <TeamIdentityCard team={MOCK_TEAM} />}

        {/* 4. Match Feed */}
        <section ref={matchesRef} className="scroll-mt-20">
          <Tabs defaultValue="active" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">내 경기</h3>
              <TabsList className="bg-slate-100 p-1 h-9">
                <TabsTrigger value="active" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  진행중
                </TabsTrigger>
                <TabsTrigger value="past" className="text-xs h-7 px-3 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  종료됨
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="active" className="space-y-3 mt-0">
              {MOCK_MATCHES.filter(m => !m.isPast).length > 0 ? (
                MOCK_MATCHES.filter(m => !m.isPast).map(match => (
                  <UnifiedMatchCard key={match.id} match={match} />
                ))
              ) : (
                <EmptyMatchState />
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-3 mt-0">
              {MOCK_MATCHES.filter(m => m.isPast).length > 0 ? (
                MOCK_MATCHES.filter(m => m.isPast).map(match => (
                  <UnifiedMatchCard key={match.id} match={match} />
                ))
              ) : (
                <div className="py-10 text-center text-slate-400 text-sm">
                  종료된 경기가 없습니다.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </div>
  );
}

// --- Sub Components ---

interface QuickActionMenuProps {
  onTeamCreate: () => void;
  onRecruit: () => void;
  onTeamManage: () => void;
  onMatchManage: () => void;
  hasTeam: boolean;
}

const QuickActionMenu = ({
  onTeamCreate,
  onRecruit,
  onTeamManage,
  onMatchManage,
  hasTeam
}: QuickActionMenuProps) => (
  <div className="bg-white px-4 py-6 border-b border-slate-100">
    <div className="grid grid-cols-4 gap-2">
      {/* 1. Create Team */}
      <button
        onClick={onTeamCreate}
        className="flex flex-col items-center gap-2 group"
      >
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-slate-100 group-active:scale-95 transition-all">
          <Flag className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-slate-700">팀 생성</span>
      </button>

      {/* 2. Recruit */}
      <button
        onClick={onRecruit}
        className="flex flex-col items-center gap-2 group"
      >
        <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#FF6600] group-hover:bg-orange-100 group-active:scale-95 transition-all">
          <Megaphone className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-slate-700">공고 등록</span>
      </button>

      {/* 3. Team Members */}
      <button
        disabled={!hasTeam}
        onClick={onTeamManage}
        className={cn(
          "flex flex-col items-center gap-2 group",
          !hasTeam && "opacity-40 grayscale cursor-not-allowed"
        )}
      >
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600 group-hover:bg-slate-100 group-active:scale-95 transition-all">
          <Users className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-slate-700">팀원 관리</span>
      </button>

      {/* 4. Manage Matches */}
      <button
        onClick={onMatchManage}
        className="flex flex-col items-center gap-2 group"
      >
        <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-100 group-active:scale-95 transition-all">
          <ClipboardList className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-slate-700">경기 관리</span>
      </button>
    </div>
  </div>
);

const SmartActionBanner = ({ count }: { count: number }) => (
  <div className="bg-[#FFF9E6] border-y border-[#FFEDD5] p-4 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-[#FFE4B5] flex items-center justify-center text-[#FF8C00]">
        <Users className="w-5 h-5" />
      </div>
      <div>
        <p className="font-bold text-[#7C2D12] text-sm">신청자 관리</p>
        <p className="text-sm font-medium text-[#9A3412] mt-0.5">
          {count}명의 신청자가 승인을 기다리고 있어요!
        </p>
      </div>
    </div>
    <Button
      size="sm"
      className="bg-[#F97316] hover:bg-[#EA580C] text-white border-0 h-9 text-xs font-bold rounded-lg shadow-sm px-3 flex items-center gap-1"
    >
      승인하기
      <ChevronRight className="w-3.5 h-3.5" />
    </Button>
  </div>
);

const TeamIdentityCard = ({ team }: { team: typeof MOCK_TEAM }) => (
  <Card className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl relative overflow-hidden">
    {/* Background Decoration */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-10 -mt-10 z-0" />

    <div className="relative z-10 flex items-center gap-4">
      <Avatar className="w-14 h-14 border-2 border-white shadow-md">
        <AvatarImage src={team.avatar} />
        <AvatarFallback>Team</AvatarFallback>
      </Avatar>
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-slate-900">{team.name}</h2>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-slate-600 rounded-full">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
          <span className="font-bold text-slate-600">Leader {team.leaderName}</span>
          <span>•</span>
          <span>멤버 {team.memberCount}명</span>
        </div>
      </div>
    </div>
  </Card>
);

const UnifiedMatchCard = ({ match }: { match: Match }) => {
  return (
    <ApplicantManagementModal match={match}>
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative">

        {/* Alert Badge (Top Right) */}
        {match.pendingCount > 0 && !match.isPast && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-red-500 text-white border-0 hover:bg-red-600 animate-pulse px-2 h-5 text-[10px] font-bold shadow-sm">
              +{match.pendingCount}
            </Badge>
          </div>
        )}

        {/* Status Badges */}
        <div className="flex items-center gap-2 mb-4">
          {match.type === 'TEAM' ? (
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
              TEAM
            </Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold">
              SOLO
            </Badge>
          )}

          {!match.isPast && match.status === 'recruiting' && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-green-700">모집중</span>
            </div>
          )}
          {!match.isPast && match.status === 'closing_soon' && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span className="text-xs font-bold text-orange-700">마감임박</span>
            </div>
          )}
          {match.isPast && (
            <span className="text-xs font-bold text-slate-400">종료됨</span>
          )}
        </div>

        {/* Main Info */}
        <div className="mb-5">
          <h3 className={cn(
            "text-[26px] font-black tracking-tight leading-none mb-1",
            match.isPast ? "text-slate-500" : "text-slate-900"
          )}>
            {match.time}
          </h3>
          <div className={cn(
            "text-base font-medium mb-1",
            match.isPast ? "text-slate-400" : "text-slate-900"
          )}>
            {match.gymName}
          </div>
          <p className="text-sm font-medium text-slate-400">{match.date}</p>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-500">
              <User className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{match.stats.total}명 신청</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="font-medium text-slate-700">{match.stats.confirmed}명 확정</span>
            </div>
          </div>

          {!match.isPast && (
            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold mr-1">잔여</span>
              <span className="text-[#FF6600] font-black text-lg">{match.stats.left}</span>
            </div>
          )}
        </div>
      </div>
    </ApplicantManagementModal>
  );
};

const EmptyMatchState = () => (
  <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-slate-200 border-dashed text-center p-6">
    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
      <Calendar className="w-6 h-6 text-slate-300" />
    </div>
    <h4 className="text-slate-900 font-bold mb-1">예정된 경기가 없어요</h4>
    <p className="text-slate-500 text-sm mb-4">경기를 개설하고 게스트를 모집해보세요!</p>
  </div>
);

// --- Applicant Management Modal ---
const ApplicantManagementModal = ({
  match,
  children
}: {
  match: Match;
  children: React.ReactNode;
}) => {
  const [applicants, setApplicants] = useState(MOCK_APPLICANTS);
  const [showBankInfo, setShowBankInfo] = useState(false);

  // Traffic Light Logic
  const cycleStatus = (id: string, currentStatus: Applicant['status']) => {
    const flow: Applicant['status'][] = [
      ApplicantStatus.PENDING,
      ApplicantStatus.CHECKING,
      ApplicantStatus.CONFIRMED,
      ApplicantStatus.REJECTED
    ];
    const nextIndex = (flow.indexOf(currentStatus) + 1) % flow.length;
    const nextStatus = flow[nextIndex];

    setApplicants(prev => prev.map(app =>
      app.id === id ? { ...app, status: nextStatus } : app
    ));
  };

  const copyList = () => {
    const text = applicants
      .filter(a => a.status === 'confirmed')
      .map((a, i) => `${i+1}. ${a.nickname} (${a.position})`)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast.success("확정 인원 명단이 복사되었습니다.");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://draft.com/match/${match.id}`);
    toast.success("초대 링크가 복사되었습니다.");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[760px] w-full h-[90vh] flex flex-col p-0 gap-0 sm:rounded-2xl bg-slate-50">
        {/* Modal Header */}
        <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <DialogTitle className="text-lg font-bold">신청자 관리</DialogTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={copyLink} className="h-9 w-9 text-slate-500">
              <CheckCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white p-4 space-y-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-slate-500" />
              <span className="font-bold text-slate-700 text-sm">계좌 노출</span>
            </div>
            <Switch checked={showBankInfo} onCheckedChange={setShowBankInfo} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={copyList} className="bg-white border-slate-200 text-slate-700 h-10 font-bold text-sm">
              <Copy className="w-4 h-4 mr-2" />
              명단 복사
            </Button>
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700 h-10 font-bold text-sm">
              <MessageCircle className="w-4 h-4 mr-2" />
              초대 링크
            </Button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {applicants.map(app => (
            <div key={app.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
              {/* Left: User Info */}
              <UserProfileTrigger applicant={app}>
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar className="h-10 w-10 border border-slate-100">
                    <AvatarImage src={app.avatar} />
                    <AvatarFallback className="bg-slate-100 text-slate-500 text-xs font-bold">
                      {app.nickname.substring(0,2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-slate-900 text-sm">{app.nickname}</span>
                      <Badge variant="outline" className="h-5 px-1 text-[10px] text-slate-500 border-slate-200">
                        {app.position}
                      </Badge>
                      {app.noshowCount > 0 && (
                        <Badge variant="destructive" className="h-5 px-1 text-[10px] bg-red-50 text-red-500 border-red-100 hover:bg-red-50 shadow-none">
                          ⚠️ 노쇼 {app.noshowCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400 font-medium">🔥 {app.mannerTemp}°</span>
                    </div>
                  </div>
                </div>
              </UserProfileTrigger>

              {/* Right: Traffic Light Button */}
              <button
                onClick={() => cycleStatus(app.id, app.status)}
                className={cn(
                  "h-9 px-3 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm border min-w-[80px] justify-center",
                  app.status === 'pending' && "bg-white border-slate-200 text-slate-500 hover:bg-slate-50",
                  app.status === 'checking' && "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
                  app.status === 'confirmed' && "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
                  app.status === 'rejected' && "bg-red-50 border-red-200 text-red-400 hover:bg-red-100"
                )}
              >
                {app.status === 'pending' && "대기"}
                {app.status === 'checking' && "입금확인"}
                {app.status === 'confirmed' && (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    확정
                  </>
                )}
                {app.status === 'rejected' && "거절"}
              </button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// --- User Profile Trigger ---
const UserProfileTrigger = ({
  applicant,
  children
}: {
  applicant: Applicant;
  children: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[320px] rounded-2xl p-0 overflow-hidden bg-white">
        <div className="relative h-24 bg-slate-900 flex items-center justify-center">
          <Avatar className="h-20 w-20 border-4 border-white absolute -bottom-10 shadow-sm">
            <AvatarImage src={applicant.avatar} />
            <AvatarFallback className="text-xl font-bold text-slate-500">
              {applicant.nickname.substring(0,2)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="pt-12 pb-6 px-6 text-center space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
              {applicant.nickname}
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {applicant.position}
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">{applicant.height} • {applicant.level}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="text-xs text-slate-500 mb-1">출석률</div>
              <div className="text-lg font-bold text-slate-900">{applicant.attendanceRate}%</div>
            </div>
            <div className={cn(
              "bg-slate-50 p-3 rounded-xl border border-slate-100",
              applicant.noshowCount > 0 && "bg-red-50 border-red-100"
            )}>
              <div className={cn(
                "text-xs text-slate-500 mb-1",
                applicant.noshowCount > 0 && "text-red-500"
              )}>
                노쇼
              </div>
              <div className={cn(
                "text-lg font-bold text-slate-900",
                applicant.noshowCount > 0 && "text-red-600"
              )}>
                {applicant.noshowCount}회
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Play Style</span>
            <div className="flex flex-wrap gap-2">
              {applicant.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Manner */}
          <div className="space-y-2 text-left">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Manner</span>
            <div className="bg-green-50 p-3 rounded-xl border border-green-100 flex items-center gap-3">
              <ThumbsUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs font-bold text-green-800">"시간 약속을 잘 지켜요"</p>
                <p className="text-[10px] text-green-600">24명이 칭찬했어요</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
