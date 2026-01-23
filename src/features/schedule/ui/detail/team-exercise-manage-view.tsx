'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  MoreVertical,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Users,
  Shield,
  Edit3,
  UserPlus,
  X,
  FileText,
} from 'lucide-react';
import { Button } from '@/shared/ui/base/button';
import { Textarea } from '@/shared/ui/base/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/base/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/base/dialog';
import { toast } from 'sonner';
import type { TeamExerciseManageDetail, Participant } from '../../model/types';
import { MOCK_TEAM_EXERCISE_MANAGE } from '../../model/mock-data';

export function TeamExerciseManageView() {
  const router = useRouter();

  const [exercise] = useState<TeamExerciseManageDetail>(MOCK_TEAM_EXERCISE_MANAGE);
  const [description, setDescription] = useState(exercise.description);
  const [participants, setParticipants] = useState<Participant[]>(exercise.participants);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  const handleSave = () => {
    toast.success('변경 사항이 저장되었습니다.');
  };

  const handleRemoveParticipant = (participantId: string) => {
    setParticipants(participants.filter((p) => p.id !== participantId));
    toast.success('멤버가 제거되었습니다.');
  };

  const handleAddParticipant = () => {
    toast.info('멤버 추가 기능은 준비중입니다.');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-slate-700" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">팀운동 관리</h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => router.push(`/matches/create?edit=${exercise.id}`)}>
              경기 정보 수정
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => {
                if (confirm('팀운동을 취소하시겠습니까?')) {
                  toast.error('팀운동이 취소되었습니다.');
                  router.back();
                }
              }}
            >
              운동 취소
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="max-w-[760px] mx-auto p-4 space-y-4">
        {/* 경기 기본 정보 */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <CalendarIcon className="w-5 h-5 text-slate-400" />
            <span>{exercise.date}</span>
            <Clock className="w-5 h-5 text-slate-400 ml-2" />
            <span>{exercise.time}</span>
          </div>

          <a
            href={exercise.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-700 hover:text-primary transition-colors"
          >
            <MapPin className="w-5 h-5 text-slate-400" />
            <span className="font-medium">{exercise.location}</span>
          </a>

          <div className="flex items-center gap-2 text-lg text-slate-700">
            <Shield className="w-5 h-5 text-slate-400" />
            <span className="font-medium">{exercise.teamName}</span>
          </div>
        </section>

        {/* 참여 명단 (편집 가능) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-slate-900">참여 명단</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-600">{participants.length}명</span>
              <Button
                onClick={handleAddParticipant}
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs font-bold border-primary text-primary hover:bg-orange-50"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1" />
                추가
              </Button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900">{participant.name}</span>
                    <span className="text-sm text-slate-500">{participant.position}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span>{participant.level}</span>
                    <span>•</span>
                    <span>{participant.ageGroup}</span>
                    <span>•</span>
                    <span>{participant.height}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`${participant.name}님을 명단에서 제거하시겠습니까?`)) {
                      handleRemoveParticipant(participant.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-lg transition-all"
                >
                  <X className="w-4 h-4 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 전술 및 안내사항 섹션 (편집 가능) */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg text-slate-900">전술 및 안내사항</h2>
            </div>
            <button
              onClick={() => setIsEditingDescription(!isEditingDescription)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          <div className="p-5">
            {isEditingDescription ? (
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="전술 및 안내사항을 입력하세요..."
                className="w-full min-h-[120px] resize-none text-slate-700 border-slate-200 focus:border-primary focus:ring-primary"
                autoFocus
              />
            ) : (
              <p
                className="text-slate-700 whitespace-pre-wrap cursor-pointer hover:bg-slate-50 -m-2 p-2 rounded-lg transition-colors"
                onClick={() => setIsEditingDescription(true)}
              >
                {description || '전술 및 안내사항을 입력하려면 클릭하세요'}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[240px] bg-white border-t border-slate-100 p-4 z-50">
        <div className="max-w-[760px] mx-auto">
          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-bold"
          >
            저장하기
          </Button>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={isCancelConfirmOpen} onOpenChange={setIsCancelConfirmOpen}>
        <DialogContent className="max-w-sm mx-4 rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>참여 취소</DialogTitle>
            <DialogDescription className="pt-2">
              이 팀운동 참여를 취소하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCancelConfirmOpen(false)}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              돌아가기
            </Button>
            <Button
              onClick={() => {
                setIsCancelConfirmOpen(false);
                toast.success('참여가 취소되었습니다.');
                router.back();
              }}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white h-12 rounded-xl font-bold"
            >
              취소하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
