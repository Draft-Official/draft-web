'use client';

import { useEffect, useState } from 'react';
import {
  MapPin,
  Home,
  Clock,
  Users,
  Trophy,
  User,
  Users2,
  Pencil,
} from 'lucide-react';
import { formatTeamRegion, formatTeamRegularSchedule } from '@/features/team/lib';
import { useUpdateTeam } from '@/features/team/api/team-info/mutations';
import { GENDER_LABELS, type GenderValue } from '@/shared/config/match-constants';
import { SKILL_LEVEL_NAMES } from '@/shared/config/skill-constants';
import type { TeamInfoDTO, TeamMembershipDTO } from '@/features/team/model/types';
import { Button } from '@/shared/ui/shadcn/button';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { toast } from '@/shared/ui/shadcn/sonner';

interface TeamHomeTabProps {
  team: TeamInfoDTO;
  homeGymName: string | null;
  memberCount: number;
  membership: TeamMembershipDTO | null;
}

/**
 * 팀 홈 탭 - 팀 정보 대시보드
 */
export function TeamHomeTab({
  team,
  homeGymName,
  memberCount,
  membership,
}: TeamHomeTabProps) {
  const updateTeamMutation = useUpdateTeam();
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState(team.description ?? '');

  const canEditDescription =
    membership?.status === 'ACCEPTED' &&
    membership.role === 'LEADER';
  const hasDescription = (team.description ?? '').trim().length > 0;
  const showDescriptionSection = hasDescription || canEditDescription;
  const isDescriptionEditorOpen = canEditDescription && isEditingDescription;

  useEffect(() => {
    if (!isEditingDescription) {
      setDescriptionDraft(team.description ?? '');
    }
  }, [team.description, isEditingDescription]);

  const handleSaveDescription = () => {
    const currentDescription = (team.description ?? '').trim();
    const nextDescription = descriptionDraft.trim();

    if (currentDescription === nextDescription) {
      setIsEditingDescription(false);
      return;
    }

    updateTeamMutation.mutate(
      {
        teamId: team.id,
        input: {
          description: nextDescription || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('팀 소개가 저장되었습니다');
          setIsEditingDescription(false);
        },
        onError: () => {
          toast.error('팀 소개 저장에 실패했습니다');
        },
      }
    );
  };

  const handleCancelDescriptionEdit = () => {
    setDescriptionDraft(team.description ?? '');
    setIsEditingDescription(false);
  };

  // 지역 정보
  const regionText = formatTeamRegion(team.regionDepth1, team.regionDepth2);

  // 정기운동 스케줄
  const scheduleText = formatTeamRegularSchedule(
    team.regularDays,
    team.regularStartTime,
    team.regularEndTime
  );

  // 나이 범위 표시
  const ageRangeText = team.ageRange
    ? team.ageRange.max && team.ageRange.min !== team.ageRange.max
      ? `${team.ageRange.min}대~${team.ageRange.max}대`
      : `${team.ageRange.min}대`
    : null;

  // 레벨 (levelRange에서 표시)
  const levelText = team.levelRange
    ? team.levelRange.min === team.levelRange.max
      ? SKILL_LEVEL_NAMES[team.levelRange.min] || `레벨 ${team.levelRange.min}`
      : `${SKILL_LEVEL_NAMES[team.levelRange.min] || `레벨 ${team.levelRange.min}`} ~ ${SKILL_LEVEL_NAMES[team.levelRange.max] || `레벨 ${team.levelRange.max}`}`
    : null;

  // 성별 라벨
  const genderText = team.teamGender
    ? GENDER_LABELS[team.teamGender as GenderValue] || team.teamGender
    : null;

  const infoItems = [
    {
      icon: MapPin,
      label: '지역',
      value: regionText,
      valueColor: 'text-primary',
    },
    {
      icon: Home,
      label: '홈 구장',
      value: homeGymName,
      valueColor: 'text-primary',
    },
    {
      icon: Clock,
      label: '모임 시간',
      value: scheduleText,
      valueColor: 'text-slate-900',
    },
    {
      icon: Users2,
      label: '성별',
      value: genderText,
      valueColor: 'text-slate-900',
    },
    {
      icon: User,
      label: '나이',
      value: ageRangeText,
      valueColor: 'text-slate-900',
    },
    {
      icon: Users,
      label: '멤버',
      value: `${memberCount}명`,
      valueColor: 'text-slate-900',
    },
    {
      icon: Trophy,
      label: '레벨',
      value: levelText,
      valueColor: 'text-slate-900',
    },
  ];

  return (
    <div className="bg-white">
      {/* 팀 소개 */}
      {showDescriptionSection && (
        <section className="px-5 py-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">팀 소개</h2>
            {canEditDescription && !isDescriptionEditorOpen && (
              hasDescription ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingDescription(true)}
                >
                  수정
                </Button>
              ) : (
                <button
                  type="button"
                  aria-label="팀 소개 작성"
                  onClick={() => setIsEditingDescription(true)}
                  className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              )
            )}
          </div>

          {isDescriptionEditorOpen ? (
            <div className="space-y-3">
              <Textarea
                value={descriptionDraft}
                onChange={(event) => setDescriptionDraft(event.target.value)}
                placeholder="팀을 소개해주세요"
                rows={4}
                disabled={updateTeamMutation.isPending}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelDescriptionEdit}
                  disabled={updateTeamMutation.isPending}
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveDescription}
                  disabled={updateTeamMutation.isPending}
                >
                  {updateTeamMutation.isPending ? '저장 중...' : '저장'}
                </Button>
              </div>
            </div>
          ) : (
            hasDescription ? (
              <p className="text-base text-slate-600 whitespace-pre-wrap">
                {team.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400">
                아직 등록된 팀 소개가 없습니다.
              </p>
            )
          )}
        </section>
      )}

      {/* 팀 정보 섹션 */}
      <section className={`px-5 py-6 ${showDescriptionSection ? 'border-t border-slate-100' : ''}`}>
        <h2 className="text-lg font-bold text-slate-900 mb-4">팀 정보</h2>

        <div className="space-y-4">
          {infoItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-slate-500">
                <item.icon className="w-5 h-5" />
                <span className="text-base">{item.label}</span>
              </div>
              <span className={`text-base font-medium ${item.valueColor}`}>
                {item.value || '-'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
