'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { useSafeBack } from '@/shared/lib/hooks';
import { Button } from '@/shared/ui/shadcn/button';
import { useTeamByCode } from '@/features/team/api/team-info/queries';
import { useUpdateTeam } from '@/features/team/api/team-info/mutations';
import { useMyMembership } from '@/features/team/api/membership/queries';
import { useAuth } from '@/shared/session';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createGymService, gymKeys, useGymById } from '@/entities/gym';
import { parseRegionFromAddress } from '@/shared/lib/parse-region';
import type { LocationData } from '@/shared/types/location.types';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';
import {
  ageRangeToSelectedAges,
  calcDurationFromTimes,
  calcEndTimeFromDuration,
  normalizeTimeValue,
  sanitizeShortIntro,
  selectedAgesToAgeRange,
} from '@/features/team/lib';
import {
  TeamProfileEditBasicInfoSection,
  TeamProfileEditScheduleSection,
  TeamProfileEditTraitsSection,
  type TeamProfileEditFormData,
  isResolvedLocationData,
  validateTeamProfileEditForm,
} from '../edit';

interface TeamProfileEditViewProps {
  code: string;
}

export function TeamProfileEditView({ code }: TeamProfileEditViewProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const handleBack = useSafeBack(`/team/${code}/settings`);

  const { data: team, isLoading: isLoadingTeam } = useTeamByCode(code);
  const { data: membership, isLoading: isLoadingMembership } = useMyMembership(
    team?.id,
    user?.id
  );
  const updateMutation = useUpdateTeam();
  const { data: homeGym } = useGymById(team?.homeGymId);

  const isLeader = membership?.role === 'LEADER';
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const gymInitializedRef = useRef(false);

  const { register, handleSubmit, watch, setValue, reset, control } =
    useForm<TeamProfileEditFormData>({
      defaultValues: {
        name: '',
        shortIntro: '',
        description: '',
        logoId: '/logos/preset/logo-01.webp',
        regularDay: '',
        regularTime: '20:00',
        duration: '2',
        gender: 'MALE',
        selectedAges: ['any'],
        levelMin: 1,
        levelMax: 7,
      },
    });

  useEffect(() => {
    if (!team) return;

    reset({
      name: team.name,
      shortIntro: sanitizeShortIntro(team.shortIntro ?? ''),
      description: team.description ?? '',
      logoId: team.logoUrl ?? '/logos/preset/logo-01.webp',
      regularDay: team.regularDay ?? '',
      regularTime: normalizeTimeValue(team.regularStartTime, '20:00'),
      duration: calcDurationFromTimes(team.regularStartTime, team.regularEndTime),
      gender: (team.teamGender as TeamProfileEditFormData['gender']) ?? 'MALE',
      selectedAges: ageRangeToSelectedAges(team.ageRange),
      levelMin: team.levelRange?.min ?? 1,
      levelMax: team.levelRange?.max ?? 7,
    });
  }, [team, reset]);

  useEffect(() => {
    gymInitializedRef.current = false;
  }, [team?.homeGymId]);

  useEffect(() => {
    if (!homeGym || gymInitializedRef.current) return;
    gymInitializedRef.current = true;
    setLocationData({
      address: homeGym.address,
      buildingName: homeGym.name,
      x: String(homeGym.longitude),
      y: String(homeGym.latitude),
      kakaoPlaceId: homeGym.kakaoPlaceId,
    });
  }, [homeGym]);

  const handleLocationResolvedChange = useCallback(
    (next: LocationSearchResolvedValue) => {
      setLocationData(next.locationData);
    },
    []
  );

  const selectedAges = watch('selectedAges');
  const regularDay = watch('regularDay');
  const gender = watch('gender');
  const levelMin = watch('levelMin');
  const levelMax = watch('levelMax');
  const logoId = watch('logoId');
  const shortIntro = watch('shortIntro') ?? '';

  const handleAgeSelection = (age: string) => {
    if (age === 'any') {
      setValue('selectedAges', ['any'], { shouldDirty: true, shouldTouch: true });
      return;
    }

    const current = selectedAges.filter((value) => value !== 'any');
    if (current.includes(age)) {
      const next = current.filter((value) => value !== age);
      setValue('selectedAges', next.length > 0 ? next : ['any'], {
        shouldDirty: true,
        shouldTouch: true,
      });
      return;
    }

    setValue('selectedAges', [...current, age], {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onSubmit = async (data: TeamProfileEditFormData) => {
    if (!team) return;

    const validationError = validateTeamProfileEditForm(data, locationData);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (!data.regularDay) {
      toast.error('정기 운동 요일을 선택해주세요');
      return;
    }

    if (!isResolvedLocationData(locationData)) {
      toast.error('홈구장을 다시 선택해주세요');
      return;
    }

    let homeGymId: string | null = team.homeGymId;
    try {
      const supabase = getSupabaseBrowserClient();
      const gymService = createGymService(supabase);
      homeGymId = await gymService.upsertGym({
        name: locationData.buildingName || locationData.address,
        address: locationData.address,
        latitude: parseFloat(locationData.y),
        longitude: parseFloat(locationData.x),
        kakaoPlaceId: locationData.kakaoPlaceId,
        facilities: {},
      });
      if (!homeGymId) {
        toast.error('홈구장 저장에 실패했습니다');
        return;
      }
      queryClient.invalidateQueries({ queryKey: gymKeys.all });
      queryClient.invalidateQueries({ queryKey: gymKeys.detail(homeGymId) });
      queryClient.invalidateQueries({
        queryKey: gymKeys.byKakaoPlaceId(locationData.kakaoPlaceId),
      });
      if (team.homeGymId && team.homeGymId !== homeGymId) {
        queryClient.invalidateQueries({ queryKey: gymKeys.detail(team.homeGymId) });
      }
    } catch {
      toast.error('홈구장 저장에 실패했습니다');
      return;
    }

    const region = parseRegionFromAddress(locationData.address);
    const regularStartTime = normalizeTimeValue(data.regularTime, '20:00');
    const regularEndTime = calcEndTimeFromDuration(regularStartTime, data.duration);

    updateMutation.mutate(
      {
        teamId: team.id,
        input: {
          name: data.name.trim(),
          shortIntro: sanitizeShortIntro(data.shortIntro).trim() || null,
          description: data.description.trim() || null,
          logoUrl: data.logoId,
          regionDepth1: region.depth1 ?? null,
          regionDepth2: region.depth2 ?? null,
          homeGymId,
          regularDay: data.regularDay,
          regularStartTime,
          regularEndTime,
          teamGender: data.gender,
          levelRange: { min: data.levelMin, max: data.levelMax },
          ageRange: selectedAgesToAgeRange(data.selectedAges),
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

  if (isLoadingTeam || isLoadingMembership) {
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

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-6 space-y-8">
        <TeamProfileEditBasicInfoSection
          logoId={logoId}
          shortIntro={shortIntro}
          register={register}
          setValue={setValue}
        />

        <div className="border-t border-slate-100" />

        <TeamProfileEditScheduleSection
          regularDay={regularDay}
          control={control}
          setValue={setValue}
          locationData={locationData}
          onLocationResolvedChange={handleLocationResolvedChange}
        />

        <div className="border-t border-slate-100" />

        <TeamProfileEditTraitsSection
          gender={gender}
          selectedAges={selectedAges}
          levelMin={levelMin}
          levelMax={levelMax}
          onAgeSelection={handleAgeSelection}
          setValue={setValue}
        />

        <div className="pt-2 pb-8">
          <Button
            type="submit"
            className="w-full h-14 bg-primary hover:bg-primary/90 font-semibold text-base"
            disabled={updateMutation.isPending}
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
      <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full">
        <ArrowLeft className="w-6 h-6" />
      </button>
      {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
      <div className="w-10" />
    </header>
  );
}
