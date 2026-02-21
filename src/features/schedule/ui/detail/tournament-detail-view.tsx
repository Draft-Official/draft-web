'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MoreVertical,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Trophy,
  Users,
  FileText,
  Shield,
} from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/shadcn/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/dialog';
import { toast } from '@/shared/ui/shadcn/sonner';
import type { Participant, TournamentDetailDTO } from '../../model/types';
import { MOCK_TOURNAMENT_DETAIL } from '../../model/mock-data';

export function TournamentDetailView() {
  const router = useRouter();

  const [tournament] = useState<TournamentDetailDTO>(MOCK_TOURNAMENT_DETAIL);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // 참여자 프로필 열기
  const openProfile = (participant: Participant) => {
    setSelectedParticipant(participant);
    setIsProfileOpen(true);
  };

  // 참여 취소 처리
  const handleCancelParticipation = () => {
    toast.error('대회 참여를 취소했습니다.');
    setIsCancelConfirmOpen(false);
    router.back();
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-40">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-slate-50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>

        <h1 className="font-bold text-lg text-slate-900">대회 상세</h1>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 -mr-2 hover:bg-slate-50 rounded-lg transition-colors">
              <MoreVertical className="w-6 h-6 text-slate-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => router.push(`/tournaments/create?edit=${tournament.id}`)}>
              대회 정보 수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm('대회 참여를 취소하시겠습니까?')) {
                  toast.error('대회 참여가 취소되었습니다.');
                  router.back();
                }
              }}
            >
              대회 취소
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="app-content-container p-4 space-y-4">
        {/* 대회 정보 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-slate-900">
              {tournament.tournamentName}{' '}
              <span className="text-slate-500">·</span> {tournament.round}
            </h2>
          </div>

          <div className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            <span>{tournament.date}</span>
            <Clock className="w-5 h-5 text-slate-400 ml-2" />
            <span>{tournament.time}</span>
          </div>

          <a
            href={tournament.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors"
          >
            <MapPin className="w-5 h-5 text-slate-400" />
            <span className="font-medium">{tournament.location}</span>
          </a>

          <div className="flex items-center gap-2 text-lg text-slate-700">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="font-medium">{tournament.teamName}</span>
          </div>
        </section>

        {/* 출전 명단 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-slate-900">출전 명단</h2>
            </div>
            <span className="text-sm font-bold text-slate-600">
              {tournament.participants.length}명
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {tournament.participants.map((participant) => (
              <div
                key={participant.id}
                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => openProfile(participant)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-600 font-bold text-lg">
                      {participant.name.charAt(0)}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900">{participant.name}</p>
                    <p className="text-sm text-slate-500">
                      {participant.position} · {participant.level} · {participant.ageGroup}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 전술 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg text-slate-900">전술</h2>
          </div>
          <div className="bg-brand-weak border border-brand-stroke-weak rounded-xl p-4">
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
              {tournament.tactics}
            </p>
          </div>
        </section>
      </div>

      {/* 참여자 프로필 Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent size="base" className="rounded-2xl p-6">
          {selectedParticipant && (
            <div className="flex flex-col items-center space-y-6 pt-2">
              <div className="w-20 h-20 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-slate-600 font-bold text-3xl">
                  {selectedParticipant.name.charAt(0)}
                </span>
              </div>

              <DialogHeader className="space-y-2">
                <DialogTitle className="text-2xl font-bold text-slate-900 text-center">
                  {selectedParticipant.name}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  출전 선수의 상세 정보를 확인할 수 있습니다.
                </DialogDescription>
              </DialogHeader>

              <div className="w-full space-y-3 border-t border-b border-slate-100 py-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">포지션</span>
                  <span className="font-medium text-slate-900">
                    {selectedParticipant.position}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">실력</span>
                  <span className="font-medium text-slate-900">{selectedParticipant.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">나이대</span>
                  <span className="font-medium text-slate-900">
                    {selectedParticipant.ageGroup}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">키</span>
                  <span className="font-medium text-slate-900">{selectedParticipant.height}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 참여 취소 확인 Dialog */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent size="base" className="rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>참여 취소 확인</DialogTitle>
            <DialogDescription className="text-slate-600 pt-2">
              대회 참여를 취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={() => setIsCancelConfirmOpen(false)}
              variant="outline"
              className="flex-1 h-12 rounded-xl font-bold"
            >
              아니오
            </Button>
            <Button
              onClick={handleCancelParticipation}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl font-bold"
            >
              취소하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 하단 고정 버튼 */}
      <div className="app-overlay-shell app-overlay-shell--with-sidebar bg-white border-t border-slate-100 p-4 z-50">
        <div className="app-overlay-content">
          <Button
            onClick={() => setIsCancelConfirmOpen(true)}
            className="w-full bg-red-100 hover:bg-red-200 text-red-600 border border-red-200 h-14 rounded-xl font-bold"
          >
            참여 취소
          </Button>
        </div>
      </div>
    </div>
  );
}
