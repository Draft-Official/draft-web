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
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/shared/lib/utils';
import { SkillSlider } from './SkillSlider';
import { ProfileData, POSITIONS } from '../model/types';

interface ProfileSetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (data: ProfileData) => void;
  initialData?: ProfileData;
  isEditing?: boolean;
}

export function ProfileSetupModal({
  open,
  onOpenChange,
  onComplete,
  initialData,
  isEditing = false,
}: ProfileSetupModalProps) {
  const [formData, setFormData] = useState<ProfileData>({
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
      onComplete(formData);
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
    if (!isEditing) {
      localStorage.setItem('profileSkipped', 'true');
    }
  };

  // Mock teams for demo - in real app, this would come from props or API
  const availableTeams = ['슬램덩크', '농구왕', '굿스타'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] max-h-[85vh] overflow-y-auto p-6 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 mb-1">
            {isEditing ? '프로필 수정' : '프로필을 완성해주세요'}
          </DialogTitle>
          {!isEditing && (
            <DialogDescription className="text-sm text-slate-600">
              매칭 정확도가 올라갑니다
            </DialogDescription>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Profile Photo - Only for editing */}
          {isEditing && (
            <div className="flex flex-col items-center space-y-3 pb-5 border-b border-slate-100">
              <Avatar className="h-20 w-20 border-2 border-slate-200">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-slate-200 text-slate-700 text-lg font-bold">
                  김농
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => {
                  // TODO: Implement photo upload
                  console.log('Photo change clicked');
                }}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                사진 변경
              </button>
            </div>
          )}

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
                  const value = e.target.value.replace(/[^0-9]/g, '');
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
                  const value = e.target.value.replace(/[^0-9]/g, '');
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
                  const value = e.target.value.replace(/[^0-9]/g, '');
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
                <SelectTrigger className="h-12 bg-white border-slate-200 font-bold">
                  <SelectValue placeholder="팀 없음" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">팀 없음</SelectItem>
                  {availableTeams.map((team) => (
                    <SelectItem key={team} value={team}>
                      팀 {team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">* 팀 탭에서 가입한 팀만 표시됩니다</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={!isFormValid()}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl disabled:bg-slate-300 disabled:text-slate-500"
          >
            {isEditing ? '저장하기' : '완료하기'}
          </Button>

          {/* Skip Button (only for initial setup) */}
          {!isEditing && (
            <button
              type="button"
              onClick={handleSkip}
              className="w-full text-sm text-slate-500 hover:text-slate-700 py-2"
            >
              나중에 입력하기
            </button>
          )}

          {/* Cancel Button (only for editing) */}
          {isEditing && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-full text-sm text-slate-500 hover:text-slate-700 py-2"
            >
              취소
            </button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
