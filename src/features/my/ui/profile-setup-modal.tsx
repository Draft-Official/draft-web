'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/dialog';
import { Button } from '@/shared/ui/shadcn/button';
import { User } from 'lucide-react';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { filterNumericInput } from '@/shared/lib/input-utils';
import { Toggle } from '@/shared/ui/shadcn/toggle';
import { SkillSlider } from '@/shared/ui/composite/skill-slider';
import { MyProfileFormDTO } from '../model/types';
import { POSITION_OPTIONS } from '@/shared/config/match-constants';

interface ProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: MyProfileFormDTO, avatarUrl: string | null | undefined) => void;
  initialData?: MyProfileFormDTO;
  isEditing?: boolean;
  avatarUrl?: string | null;
  kakaoAvatarUrl?: string | null;
  teams?: { id: string; name: string }[];
}

export function ProfileSetupModal({
  open,
  onOpenChange,
  onComplete,
  initialData,
  isEditing = false,
  avatarUrl,
  kakaoAvatarUrl,
  teams = [],
}: ProfileSetupModalProps) {
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [localAvatarUrl, setLocalAvatarUrl] = useState<string | null | undefined>(avatarUrl);

  useEffect(() => {
    setLocalAvatarUrl(avatarUrl);
  }, [avatarUrl, open]);

  const [formData, setFormData] = useState<MyProfileFormDTO>({
    nickname: initialData?.nickname || '',
    height: initialData?.height || '',
    age: initialData?.age || '',
    weight: initialData?.weight || '',
    position: initialData?.position || '',
    skillLevel: initialData?.skillLevel || 1,
    team: initialData?.team || '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const isFormValid = () => {
    return (
      formData.height.trim() !== '' &&
      formData.age.trim() !== '' &&
      formData.weight.trim() !== '' &&
      formData.position !== ''
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid()) {
      onComplete(formData, localAvatarUrl);
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    if (!isEditing) {
      localStorage.setItem('profileSkipped', 'true');
    }
  };

  const handleSelectAvatar = (url: string | null | undefined) => {
    setLocalAvatarUrl(url);
    setAvatarPickerOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setAvatarPickerOpen(false); onOpenChange(next); }}>
      <DialogContent size="xl" className="p-0 flex flex-col max-h-[90vh] gap-0 overflow-hidden">

        {/* 헤더 고정 */}
        <div className="px-6 pt-6 pb-4 pr-14 flex-shrink-0 border-b border-slate-100">
          <DialogTitle className="text-xl font-bold text-slate-900 mb-1">
            {isEditing ? '프로필 수정' : '프로필을 완성해주세요'}
          </DialogTitle>
          {!isEditing && (
            <DialogDescription className="text-sm text-slate-600">
              매칭 정확도가 올라갑니다
            </DialogDescription>
          )}
        </div>

        {/* 스크롤 영역 */}
        <form
          id="profile-form"
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto px-6 space-y-5 pb-4"
        >
          {/* Profile Photo - Only for editing */}
          {isEditing && (
            <div className="flex flex-col items-center pb-5 border-b border-slate-100">
              {(() => {
                const isKakaoSelected = localAvatarUrl === kakaoAvatarUrl;
                const leftUrl = localAvatarUrl;
                const leftLabel = isKakaoSelected ? '카카오톡' : '기본 프로필';
                const altUrl = isKakaoSelected ? null : kakaoAvatarUrl;
                const altLabel = isKakaoSelected ? '기본 프로필' : '카카오톡';
                return (
                  <div className="relative w-full h-[100px] overflow-hidden mb-3">
                    {/* 현재 선택 (왼쪽) */}
                    <div
                      className={`flex flex-col items-center gap-1.5 absolute top-0 -translate-x-1/2 transition-all duration-300 ${
                        avatarPickerOpen ? 'left-[30%]' : 'left-1/2'
                      }`}
                    >
                      <div className={`rounded-full border-2 flex items-center justify-center bg-slate-200 overflow-hidden transition-all duration-300 ${
                        avatarPickerOpen ? 'w-14 h-14 border-primary' : 'w-20 h-20 border-slate-200'
                      }`}>
                        {leftUrl ? (
                          <img src={leftUrl} alt="프로필" className="w-full h-full object-cover" />
                        ) : (
                          <User className={`text-slate-500 transition-all duration-300 ${avatarPickerOpen ? 'w-6 h-6' : 'w-9 h-9'}`} />
                        )}
                      </div>
                      <span className={`text-xs text-slate-500 transition-opacity duration-300 ${avatarPickerOpen ? 'opacity-100' : 'opacity-0'}`}>
                        {leftLabel}
                      </span>
                    </div>

                    {/* 대안 (오른쪽) */}
                    {kakaoAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => handleSelectAvatar(altUrl)}
                        className={`flex flex-col items-center gap-1.5 absolute top-0 -translate-x-1/2 transition-all duration-300 ${
                          avatarPickerOpen ? 'left-[70%] opacity-100' : 'left-full opacity-0 pointer-events-none'
                        }`}
                      >
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-transparent flex items-center justify-center bg-slate-200">
                          {altUrl ? (
                            <img src={altUrl} alt="카카오 프로필" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-slate-500" />
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{altLabel}</span>
                      </button>
                    )}
                  </div>
                );
              })()}

              {kakaoAvatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarPickerOpen((v) => !v)}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                  {avatarPickerOpen ? '닫기' : '사진 변경'}
                </button>
              )}
            </div>
          )}

          {/* Nickname */}
          <div>
            <Label htmlFor="nickname" className="text-sm font-semibold text-slate-900 mb-2 block">
              닉네임
            </Label>
            <Input
              id="nickname"
              type="text"
              placeholder="닉네임을 입력해주세요"
              value={formData.nickname}
              onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              maxLength={20}
              className="h-12 bg-white border-slate-300 focus-visible:ring-primary"
            />
          </div>

          {/* Height */}
          <div>
            <Label htmlFor="height" className="text-sm font-semibold text-slate-900 mb-2 block">
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
                  const value = filterNumericInput(e.target.value);
                  setFormData({ ...formData, height: value });
                }}
                className="h-12 bg-white border-slate-300 focus-visible:ring-primary pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">cm</span>
            </div>
          </div>

          {/* Age */}
          <div>
            <Label htmlFor="age" className="text-sm font-semibold text-slate-900 mb-2 block">
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
                  const value = filterNumericInput(e.target.value);
                  setFormData({ ...formData, age: value });
                }}
                className="h-12 bg-white border-slate-300 focus-visible:ring-primary pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">세</span>
            </div>
          </div>

          {/* Weight */}
          <div>
            <Label htmlFor="weight" className="text-sm font-semibold text-slate-900 mb-2 block">
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
                  const value = filterNumericInput(e.target.value);
                  setFormData({ ...formData, weight: value });
                }}
                className="h-12 bg-white border-slate-300 focus-visible:ring-primary pr-12"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">kg</span>
            </div>
          </div>

          {/* Position */}
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-2 block">
              주 포지션
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {POSITION_OPTIONS.filter((pos) => pos.value !== 'B').map((pos) => (
                <Toggle
                  key={pos.value}
                  variant="outline"
                  pressed={formData.position === pos.value}
                  onPressedChange={() => setFormData({ ...formData, position: pos.value })}
                  className="h-12 rounded-xl text-sm font-bold"
                >
                  {pos.label}
                </Toggle>
              ))}
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <Label className="text-sm font-semibold text-slate-900 mb-3 block">
              실력
            </Label>
            <SkillSlider
              value={formData.skillLevel}
              onChange={(value) => setFormData({ ...formData, skillLevel: value })}
            />
          </div>

          {/* Team Selection - Only for editing */}
          {isEditing && (
            <div>
              <Label htmlFor="team" className="text-sm font-semibold text-slate-900 mb-2 block">
                팀
              </Label>
              <Select
                value={formData.team || 'none'}
                onValueChange={(value) => setFormData({ ...formData, team: value === 'none' ? '' : value })}
              >
                <SelectTrigger className="h-(--dimension-x12) bg-white border-border">
                  <SelectValue placeholder="팀 없음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">팀 없음</SelectItem>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">* 팀 탭에서 가입한 팀만 표시됩니다</p>
            </div>
          )}
        </form>

        {/* 하단 고정 */}
        <div className="px-6 pb-6 pt-4 flex-shrink-0 space-y-2 border-t border-slate-100">
          <Button
            type="submit"
            form="profile-form"
            disabled={!isFormValid()}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isEditing ? '저장하기' : '완료하기'}
          </Button>

          {!isEditing && (
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-sm text-slate-500 hover:text-slate-700 py-2"
            >
              나중에 입력하기
            </button>
          )}

        </div>

      </DialogContent>
    </Dialog>
  );
}
