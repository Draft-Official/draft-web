'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/utils';
import { useSafeBack } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/shadcn/button';
import { Input } from '@/shared/ui/base/input';
import { Textarea } from '@/shared/ui/base/textarea';
import { Label } from '@/shared/ui/base/label';
import { useTeamByCode } from '@/features/team/api/core/queries';
import { useUpdateTeam } from '@/features/team/api/core/mutations';
import { useMyMembership } from '@/features/team/api/membership/queries';
import { useAuth } from '@/features/auth/model/auth-context';
import { GENDER_OPTIONS } from '@/shared/config/constants';
import { REGULAR_DAY_OPTIONS, REGULAR_DAY_VALUES } from '@/shared/config/team-constants';

// 프리셋 로고 옵션
const PRESET_LOGOS = [
  '/logos/preset/logo-01.webp',
  '/logos/preset/logo-02.webp',
] as const;

const schema = z.object({
  name: z.string().min(1, '팀 이름을 입력해주세요'),
  shortIntro: z.string().optional(),
  description: z.string().optional(),
  regionDepth1: z.string().optional(),
  regionDepth2: z.string().optional(),
  regularDay: z.enum(REGULAR_DAY_VALUES).nullable().optional(),
  regularStartTime: z.string().optional(),
  regularEndTime: z.string().optional(),
  teamGender: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface TeamProfileEditViewProps {
  code: string;
}

export function TeamProfileEditView({ code }: TeamProfileEditViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const handleBack = useSafeBack(`/team/${code}/settings`);

  const { data: team, isLoading: isLoadingTeam } = useTeamByCode(code);
  const { data: membership } = useMyMembership(team?.id, user?.id);
  const updateMutation = useUpdateTeam();

  // 로고 상태
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);

  const isLeader = membership?.role === 'LEADER';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        shortIntro: team.shortIntro || '',
        description: team.description || '',
        regionDepth1: team.regionDepth1 || '',
        regionDepth2: team.regionDepth2 || '',
        regularDay: team.regularDay || undefined,
        regularStartTime: team.regularStartTime || '',
        regularEndTime: team.regularEndTime || '',
        teamGender: team.teamGender || '',
      });
      setSelectedLogo(team.logoUrl || null);
    }
  }, [team, reset]);

  const onSubmit = async (data: FormData) => {
    if (!team) return;

    updateMutation.mutate(
      {
        teamId: team.id,
        input: {
          name: data.name,
          shortIntro: data.shortIntro || null,
          description: data.description || null,
          logoUrl: selectedLogo,
          regionDepth1: data.regionDepth1 || null,
          regionDepth2: data.regionDepth2 || null,
          regularDay: data.regularDay || null,
          regularStartTime: data.regularStartTime || null,
          regularEndTime: data.regularEndTime || null,
          teamGender: data.teamGender || null,
        },
      },
      {
        onSuccess: () => {
          toast.success('팀 정보가 수정되었습니다');
          handleBack();
        },
        onError: () => {
          toast.error('수정에 실패했습니다');
        },
      }
    );
  };

  if (isLoadingTeam) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!team || !isLeader) {
    return (
      <div className="min-h-screen bg-white">
        <Header onBack={handleBack} />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-5">
          <h2 className="text-xl font-bold text-slate-900 mb-2">접근 권한이 없습니다</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header onBack={handleBack} title="팀 프로필 수정" />

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-6 space-y-6">
        {/* 팀 로고 */}
        <div className="space-y-3">
          <Label>팀 로고</Label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_LOGOS.map((logoUrl, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedLogo(logoUrl)}
                className={cn(
                  'aspect-square rounded-xl flex items-center justify-center overflow-hidden transition-all border-2',
                  selectedLogo === logoUrl
                    ? 'border-primary bg-orange-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                )}
              >
                <Image
                  src={logoUrl}
                  alt={`로고 ${index + 1}`}
                  width={60}
                  height={60}
                  className="object-cover w-3/4 h-3/4"
                />
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">추후 사진 업로드 기능이 추가됩니다</p>
        </div>

        {/* 팀 이름 */}
        <div className="space-y-2">
          <Label>팀 이름 *</Label>
          <Input {...register('name')} placeholder="팀 이름" />
          {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
        </div>

        {/* 한줄 소개 */}
        <div className="space-y-2">
          <Label>한줄 소개</Label>
          <Input {...register('shortIntro')} placeholder="한줄 소개" />
        </div>

        {/* 팀 소개 */}
        <div className="space-y-2">
          <Label>팀 소개</Label>
          <Textarea {...register('description')} placeholder="팀 소개" rows={4} />
        </div>

        {/* 지역 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>시/도</Label>
            <Input {...register('regionDepth1')} placeholder="서울특별시" />
          </div>
          <div className="space-y-2">
            <Label>구/군</Label>
            <Input {...register('regionDepth2')} placeholder="강남구" />
          </div>
        </div>

        {/* 정기 운동 */}
        <div className="space-y-2">
          <Label>정기 운동 요일</Label>
          <select
            {...register('regularDay')}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
          >
            <option value="">선택 안함</option>
            {REGULAR_DAY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>시작 시간</Label>
            <Input {...register('regularStartTime')} type="time" />
          </div>
          <div className="space-y-2">
            <Label>종료 시간</Label>
            <Input {...register('regularEndTime')} type="time" />
          </div>
        </div>

        {/* 성별 */}
        <div className="space-y-2">
          <Label>성별</Label>
          <select
            {...register('teamGender')}
            className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
          >
            <option value="">선택 안함</option>
            {GENDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 저장 버튼 */}
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 font-semibold"
            disabled={isSubmitting || updateMutation.isPending}
          >
            {updateMutation.isPending ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Header({ onBack, title }: { onBack: () => void; title?: string }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center gap-3 px-4">
      <button onClick={onBack} className="p-2 -ml-2 hover:bg-slate-50 rounded-full">
        <ArrowLeft className="w-6 h-6" />
      </button>
      {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
    </header>
  );
}
