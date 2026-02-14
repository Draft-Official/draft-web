'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/base/dialog';
import { Button } from '@/shared/ui/base/button';
import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/base/select';
import { Switch } from '@/shared/ui/base/switch';
import { Checkbox } from '@/shared/ui/shadcn/checkbox';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/shadcn/accordion';
import { cn } from '@/shared/lib/utils';
import { useAuth, useUpdateProfile } from '@/shared/session';
import { useCreateApplication, useUserTeams } from '@/features/application';
import type { ApplyCompanionDTO, ApplyFormDTO } from '../model/types';
import {
  buildCreateApplicationDTO,
  buildProfileUpdateFromApplyForm,
  sessionProfileToApplyFormDTO,
  sessionProfileToApplyModalViewDTO,
} from '../lib';
import { POSITION_OPTIONS } from '@/shared/config/match-constants';
import { SKILL_LEVELS } from '@/shared/config/skill-constants';

const MAX_COMPANIONS = 9;

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

  const [formData, setFormData] = useState<ApplyFormDTO>({
    height: '',
    age: '',
    weight: '',
    position: '',
    teamId: '',
  });
  const [hasCompanions, setHasCompanions] = useState(false);
  const [companions, setCompanions] = useState<ApplyCompanionDTO[]>([]);
  const [isAgreed, setIsAgreed] = useState(false);

  // 프로필 데이터로 폼 초기화
  useEffect(() => {
    if (profile) {
      setFormData(sessionProfileToApplyFormDTO(profile));
    }
  }, [profile]);

  const isFormValid = () => {
    if (formData.position === '') return false;
    if (hasCompanions && companions.length > 0) {
      return companions.every((c) => c.name.trim() !== '' && c.position !== '');
    }
    return true;
  };

  const getUserSkillLevel = (): string => {
    return sessionProfileToApplyModalViewDTO(profile).userSkillLevel;
  };

  const addCompanion = () => {
    if (companions.length < MAX_COMPANIONS) {
      setCompanions([...companions, { name: '', position: '', height: '', age: '', skillLevel: getUserSkillLevel() }]);
    }
  };

  const removeCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const updateCompanion = (index: number, field: keyof ApplyCompanionDTO, value: string) => {
    setCompanions(companions.map((c, i) => (i === index ? { ...c, [field]: value } : c)));
  };

  const totalCount = 1 + (hasCompanions ? companions.length : 0);
  const totalCost = (costAmount || 0) * totalCount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid() || !user) return;

    try {
      // 1. 프로필에 비어있는 필드가 있으면 자동 저장
      const profileUpdates = buildProfileUpdateFromApplyForm(formData, profile);
      if (profileUpdates && user) {
        await updateProfile.mutateAsync({ userId: user.id, updates: profileUpdates });
        await refreshProfile();
      }

      // 2. 신청 생성
      await createApplication.mutateAsync(buildCreateApplicationDTO({
        matchId,
        userId: user.id,
        formData,
        companions,
        hasCompanions,
        profile,
      }));

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
              {POSITION_OPTIONS.map((pos) => (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, position: pos.value })}
                  className={cn(
                    "h-12 rounded-lg font-medium transition-all",
                    formData.position === pos.value
                      ? "bg-primary text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  )}
                >
                  {pos.label}
                </button>
              ))}
            </div>
            </div>
          </div>

          {/* 동반인 섹션 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-slate-900">
                동반인 신청
              </Label>
              <Switch
                checked={hasCompanions}
                className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-200"
                onCheckedChange={(checked) => {
                  setHasCompanions(checked);
                  if (checked && companions.length === 0) {
                    setCompanions([{ name: '', position: '', height: '', age: '', skillLevel: getUserSkillLevel() }]);
                  }
                  if (!checked) {
                    setCompanions([]);
                  }
                }}
              />
            </div>

            {hasCompanions && (
              <div className="space-y-3">
                {companions.map((companion, index) => (
                  <div
                    key={index}
                    className="bg-slate-50 rounded-xl p-4 space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        동반인 {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeCompanion(index)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </div>

                    {/* 이름 */}
                    <div>
                      <Label className="text-sm text-slate-600 mb-1 block">
                        이름 <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        placeholder="동반인 이름"
                        value={companion.name}
                        onChange={(e) => updateCompanion(index, 'name', e.target.value)}
                        className="h-10 bg-white border-slate-300 focus-visible:ring-primary"
                      />
                    </div>

                    {/* 포지션 */}
                    <div>
                      <Label className="text-sm text-slate-600 mb-1 block">
                        포지션 <span className="text-red-500">*</span>
                      </Label>
                      <div className="grid grid-cols-3 gap-2">
                        {POSITION_OPTIONS.map((pos) => (
                          <button
                            key={pos.value}
                            type="button"
                            onClick={() => updateCompanion(index, 'position', pos.value)}
                            className={cn(
                              'h-10 rounded-lg text-sm font-medium transition-all',
                              companion.position === pos.value
                                ? 'bg-primary text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            )}
                          >
                            {pos.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 키 / 나이 */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm text-slate-600 mb-1 block">키</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="175"
                            value={companion.height}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              updateCompanion(index, 'height', value);
                            }}
                            className="h-10 bg-white border-slate-300 focus-visible:ring-primary pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">cm</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-slate-600 mb-1 block">나이</Label>
                        <div className="relative">
                          <Input
                            type="text"
                            inputMode="numeric"
                            placeholder="28"
                            value={companion.age}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              updateCompanion(index, 'age', value);
                            }}
                            className="h-10 bg-white border-slate-300 focus-visible:ring-primary pr-8"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">세</span>
                        </div>
                      </div>
                    </div>

                    {/* 실력 */}
                    <div>
                      <Label className="text-sm text-slate-600 mb-1 block">실력</Label>
                      <Select
                        value={companion.skillLevel}
                        onValueChange={(value) => updateCompanion(index, 'skillLevel', value)}
                      >
                        <SelectTrigger className="h-10 bg-white border-slate-300">
                          <SelectValue placeholder="실력 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          {SKILL_LEVELS.map((skill) => (
                            <SelectItem key={skill.level} value={skill.level.toString()}>
                              {skill.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                {companions.length < MAX_COMPANIONS && (
                  <button
                    type="button"
                    onClick={addCompanion}
                    className="w-full h-10 rounded-xl border-2 border-dashed border-slate-300 text-sm text-slate-500 hover:border-primary hover:text-primary transition-colors"
                  >
                    + 동반인 추가 (최대 {MAX_COMPANIONS}명)
                  </button>
                )}
              </div>
            )}
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
                <SelectValue placeholder="팀 없음" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">팀 없음</SelectItem>
                {userTeams?.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guest Essential Reading */}
          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full border border-slate-200 rounded-xl">
              <AccordionItem value="guest-rules">
                <AccordionTrigger className="px-4 text-base font-bold text-slate-900">
                  게스트 필독 수칙 및 법적 고지
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <ul className="space-y-3 text-sm text-slate-700">
                    <li>
                      <strong>입금 확인 주의:</strong> '입금 완료' 버튼을 누르면 자동 확정 처리됩니다. <span className="text-red-600">실제 입금 없이 허위로 버튼을 누를 경우</span>, 즉시 계정이 영구 정지되며 형법상 사기죄 및 업무방해죄로 형사 고소될 수 있습니다.
                    </li>
                    <li>
                      <strong>매너 준수:</strong> 당일 노쇼(No-Show), 폭언, 비매너 플레이 적발 시 서비스 이용이 제한됩니다.
                    </li>
                    <li>
                      <strong>부상 및 면책:</strong> 본 플랫폼은 매칭 중개자로서, 경기 중 발생한 부상 및 사고에 대해 플랫폼과 호스트는 <strong>일체의 법적 책임을 지지 않습니다</strong>. (개인 상해 보험 가입 권장)
                    </li>
                    <li>
                      <strong>문의 채널:</strong> 환불 지연 등 특별한 문제가 발생할 경우 아래 채널로 문의해주세요.
                      <br />
                      <a href="https://open.kakao.com/o/sEjOL3Yg" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        카카오톡 고객센터 바로가기
                      </a>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Agreement Checkbox */}
            <div className="flex items-start space-x-3">
              <Checkbox
                id="agree-terms"
                checked={isAgreed}
                onCheckedChange={(checked) => setIsAgreed(checked === true)}
                className="mt-1"
              />
              <label
                htmlFor="agree-terms"
                className="text-sm text-slate-700 leading-relaxed cursor-pointer"
              >
                위 내용을 모두 확인하였으며, <strong>취소 및 환불 규정, 법적 책임 면제 사항</strong>에 동의합니다.
              </label>
            </div>
          </div>

          {/* 신청하기 버튼 */}
          <Button
            type="submit"
            disabled={!isFormValid() || !isAgreed || createApplication.isPending || updateProfile.isPending}
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
