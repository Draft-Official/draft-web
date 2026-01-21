'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/model/auth-context';
import { useUpdateProfile } from '@/features/auth/api/mutations';
import { useCreateApplication } from '../api/mutations';
import { useUserTeams } from '../api/queries';
import type { ParticipantInfo, Profile, UserMetadata, UserUpdate } from '@/shared/types/database.types';

// 포지션 매핑
const POSITIONS = ['가드', '포워드', '센터'] as const;
const POSITION_MAP: Record<string, string> = {
  '가드': 'G',
  '포워드': 'F',
  '센터': 'C',
};
const POSITION_MAP_REVERSE: Record<string, string> = {
  'G': '가드',
  'F': '포워드',
  'C': '센터',
};

interface ApplyFormData {
  height: string;
  age: string;
  weight: string;
  position: string;
  teamId: string;
}

// DB Profile → Form Data 변환
function profileToFormData(dbProfile: Profile | null): ApplyFormData {
  if (!dbProfile) {
    return { height: '', age: '', weight: '', position: '', teamId: '' };
  }

  const metadata = dbProfile.metadata as UserMetadata & { age?: number; skill_level?: number };
  const position = dbProfile.positions?.[0];

  return {
    height: metadata?.height?.toString() || '',
    age: metadata?.age?.toString() || '',
    weight: metadata?.weight?.toString() || '',
    position: position ? (POSITION_MAP_REVERSE[position] || '') : '',
    teamId: '',
  };
}

// 프로필에서 비어있는 필드만 업데이트할 데이터 생성
function getProfileUpdates(
  formData: ApplyFormData,
  currentProfile: Profile | null
): UserUpdate | null {
  const metadata = (currentProfile?.metadata || {}) as UserMetadata & { age?: number; skill_level?: number };
  const currentPosition = currentProfile?.positions?.[0];

  const updates: UserUpdate = {};
  let hasUpdates = false;

  // metadata 업데이트
  const metadataUpdates: Record<string, number> = {};

  if (!metadata?.height && formData.height) {
    metadataUpdates.height = parseInt(formData.height, 10);
    hasUpdates = true;
  }
  if (!metadata?.age && formData.age) {
    metadataUpdates.age = parseInt(formData.age, 10);
    hasUpdates = true;
  }
  if (!metadata?.weight && formData.weight) {
    metadataUpdates.weight = parseInt(formData.weight, 10);
    hasUpdates = true;
  }

  if (Object.keys(metadataUpdates).length > 0) {
    updates.metadata = { ...metadata, ...metadataUpdates };
  }

  // positions 업데이트
  if (!currentPosition && formData.position) {
    const positionCode = POSITION_MAP[formData.position];
    if (positionCode) {
      updates.positions = [positionCode];
      hasUpdates = true;
    }
  }

  return hasUpdates ? updates : null;
}

interface ApplyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchId: string;
  matchTitle?: string;
  costAmount?: number;
}

export function ApplyModal({
  open,
  onOpenChange,
  matchId,
  matchTitle,
  costAmount,
}: ApplyModalProps) {
  const { user, profile, refreshProfile } = useAuth();
  const createApplication = useCreateApplication();
  const updateProfile = useUpdateProfile();
  const { data: userTeams } = useUserTeams(user?.id);

  const [formData, setFormData] = useState<ApplyFormData>({
    height: '',
    age: '',
    weight: '',
    position: '',
    teamId: '',
  });

  // 프로필 데이터로 폼 초기화
  useEffect(() => {
    if (profile) {
      setFormData(profileToFormData(profile));
    }
  }, [profile]);

  const isFormValid = () => {
    return formData.position !== '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid() || !user) return;

    const positionCode = POSITION_MAP[formData.position] || 'G';

    const participantsInfo: ParticipantInfo[] = [
      {
        type: 'MAIN',
        name: profile?.nickname || profile?.real_name || '',
        position: positionCode,
        cost: costAmount || 0,
      },
    ];

    try {
      // 1. 프로필에 비어있는 필드가 있으면 자동 저장
      const profileUpdates = getProfileUpdates(formData, profile);
      if (profileUpdates && user) {
        await updateProfile.mutateAsync({ userId: user.id, updates: profileUpdates });
        await refreshProfile();
      }

      // 2. 신청 생성
      await createApplication.mutateAsync({
        matchId,
        userId: user.id,
        participantsInfo,
        teamId: formData.teamId || null,
      });

      onOpenChange(false);
    } catch {
      // 에러는 mutation에서 toast로 처리됨
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-[95vh] overflow-y-auto p-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 mb-1">
            경기 신청
          </DialogTitle>
          {matchTitle && (
            <DialogDescription className="text-sm text-slate-600">
              {matchTitle}
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* 참가비 표시 */}
          {costAmount !== undefined && (
            <div className="bg-orange-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">참가비</span>
                <span className="text-lg font-bold text-primary">
                  {costAmount.toLocaleString()}원
                </span>
              </div>
            </div>
          )}

          {/* 내 정보 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-900">
                내 정보
              </Label>
              <span className="text-xs text-slate-400">
                빈 항목은 프로필에 자동 저장됩니다
              </span>
            </div>

            {/* 키 */}
            <div>
              <Label htmlFor="height" className="text-sm text-slate-600 mb-1 block">
                키 (cm)
              </Label>
              <div className="relative">
                <Input
                  id="height"
                  type="text"
                  inputMode="numeric"
                  placeholder="175"
                  value={formData.height}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, height: value });
                  }}
                  className="h-12 bg-white border-slate-300 focus-visible:ring-primary pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">cm</span>
              </div>
            </div>

            {/* 나이 */}
            <div>
              <Label htmlFor="age" className="text-sm text-slate-600 mb-1 block">
                나이
              </Label>
              <div className="relative">
                <Input
                  id="age"
                  type="text"
                  inputMode="numeric"
                  placeholder="28"
                  value={formData.age}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, age: value });
                  }}
                  className="h-12 bg-white border-slate-300 focus-visible:ring-primary pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">세</span>
              </div>
            </div>

            {/* 몸무게 */}
            <div>
              <Label htmlFor="weight" className="text-sm text-slate-600 mb-1 block">
                몸무게 (kg)
              </Label>
              <div className="relative">
                <Input
                  id="weight"
                  type="text"
                  inputMode="numeric"
                  placeholder="72"
                  value={formData.weight}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setFormData({ ...formData, weight: value });
                  }}
                  className="h-12 bg-white border-slate-300 focus-visible:ring-primary pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">kg</span>
              </div>
            </div>

            {/* 포지션 (필수) */}
            <div>
              <Label className="text-sm text-slate-600 mb-2 block">
                포지션 <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setFormData({ ...formData, position: pos })}
                    className={cn(
                      "h-12 rounded-lg font-medium transition-all",
                      formData.position === pos
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 팀 선택 */}
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              팀 선택
            </Label>
            <Select
              value={formData.teamId || 'none'}
              onValueChange={(value) => setFormData({ ...formData, teamId: value === 'none' ? '' : value })}
            >
              <SelectTrigger className="h-12 bg-white border-slate-300">
                <SelectValue placeholder="팀 없음 (개인 참가)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">팀 없음 (개인 참가)</SelectItem>
                {userTeams?.map((team: { id: string; name: string }) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 신청하기 버튼 */}
          <Button
            type="submit"
            disabled={!isFormValid() || createApplication.isPending || updateProfile.isPending}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl disabled:bg-slate-300 disabled:text-slate-500"
          >
            {createApplication.isPending || updateProfile.isPending ? '신청 중...' : '신청하기'}
          </Button>

          {/* 취소 버튼 */}
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full text-sm text-slate-500 hover:text-slate-700 py-2"
          >
            취소
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
