'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LogOut } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { useSafeBack } from '@/shared/lib/hooks';
import { useLeaveGuard } from '@/shared/lib/hooks/use-leave-guard';
import { Button } from '@/shared/ui/shadcn/button';
import { ConfirmDialog } from '@/shared/ui/composite/confirm-dialog';
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
  selectedAgesToAgeRange,
  TEAM_LOGO_BUCKET,
  uploadTeamLogoFile,
  validateTeamLogoFile,
} from '@/features/team/lib';
import {
  TeamProfileEditBasicInfoSection,
  TeamProfileEditScheduleSection,
  TeamProfileEditTraitsSection,
  type TeamProfileEditFormData,
  isResolvedLocationData,
  validateTeamProfileEditForm,
} from '../edit';
import { Spinner } from '@/shared/ui/shadcn/spinner';

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
  const { mutateAsync: updateTeamAsync, isPending: isUpdating } = useUpdateTeam();
  const { data: homeGym } = useGymById(team?.homeGymId);

  const isLeader = membership?.role === 'LEADER';
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const gymInitializedRef = useRef(false);

  const [isLocationDirty, setIsLocationDirty] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');

  const { register, handleSubmit, watch, setValue, reset, control, formState } =
    useForm<TeamProfileEditFormData>({
      defaultValues: {
        name: '',
        logoId: '',
        regularDays: [],
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
      logoId: team.logoUrl ?? '',
      regularDays: team.regularDays ?? [],
      regularTime: normalizeTimeValue(team.regularStartTime, '20:00'),
      duration: calcDurationFromTimes(team.regularStartTime, team.regularEndTime),
      gender: (team.teamGender as TeamProfileEditFormData['gender']) ?? 'MALE',
      selectedAges: ageRangeToSelectedAges(team.ageRange),
      levelMin: team.levelRange?.min ?? 1,
      levelMax: team.levelRange?.max ?? 7,
    });
    setPendingLogoFile(null);
    setLogoPreviewUrl((previous) => {
      if (previous.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }
      return '';
    });
    setLogoUploadError(null);
  }, [team, reset]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

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
      setIsLocationDirty(true);
    },
    []
  );

  const isDirty = formState.isDirty || isLocationDirty || pendingLogoFile !== null;
  const leaveGuard = useLeaveGuard(isDirty);

  const selectedAges = watch('selectedAges');
  const regularDays = watch('regularDays');
  const gender = watch('gender');
  const levelMin = watch('levelMin');
  const levelMax = watch('levelMax');
  const logoId = watch('logoId');
  const name = watch('name') ?? '';

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

  const handleLogoFileSelect = async (file: File) => {
    const validationError = validateTeamLogoFile(file);
    if (validationError) {
      setLogoUploadError(validationError);
      toast.error(validationError);
      throw new Error(validationError);
    }

    setLogoUploadError(null);
    setPendingLogoFile(file);
    setLogoPreviewUrl((previous) => {
      if (previous.startsWith('blob:')) {
        URL.revokeObjectURL(previous);
      }
      return URL.createObjectURL(file);
    });
    if (logoId) {
      setValue('logoId', '', {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

  const onSubmit = async (data: TeamProfileEditFormData) => {
    if (!team) return;

    if (submitLockRef.current || isUploadingLogo || isSubmitting) {
      toast.error('로고 업로드가 완료된 후 다시 시도해주세요');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      const validationError = validateTeamProfileEditForm(data, locationData);
      if (validationError) {
        toast.error(validationError);
        return;
      }
      if (data.regularDays.length === 0) {
        toast.error('정기 운동 요일을 선택해주세요');
        return;
      }

      if (!isResolvedLocationData(locationData)) {
        toast.error('홈구장을 다시 선택해주세요');
        return;
      }

      let uploadedLogoPath: string | null = null;
      let logoUrl: string | null = data.logoId.trim() || null;

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

      if (pendingLogoFile) {
        if (!user) {
          toast.error('로그인이 필요합니다');
          return;
        }
        setIsUploadingLogo(true);
        setLogoUploadError(null);
        try {
          const uploaded = await uploadTeamLogoFile({
            file: pendingLogoFile,
          });
          uploadedLogoPath = uploaded.path;
          logoUrl = uploaded.publicUrl;
        } catch (error) {
          const message = error instanceof Error
            ? error.message
            : '로고 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.';
          setLogoUploadError(message);
          toast.error(message);
          return;
        } finally {
          setIsUploadingLogo(false);
        }
      }

      try {
        await updateTeamAsync({
          teamId: team.id,
          input: {
            name: data.name.trim(),
            logoUrl,
            regionDepth1: region.depth1 ?? null,
            regionDepth2: region.depth2 ?? null,
            homeGymId,
            regularDays: data.regularDays,
            regularStartTime,
            regularEndTime,
            teamGender: data.gender,
            levelRange: { min: data.levelMin, max: data.levelMax },
            ageRange: selectedAgesToAgeRange(data.selectedAges),
          },
        });
        toast.success('팀 정보가 수정되었습니다');
        leaveGuard.bypassNavigation(() => handleBack());
      } catch {
        if (uploadedLogoPath?.startsWith('teams/')) {
          const supabase = getSupabaseBrowserClient();
          void supabase.storage.from(TEAM_LOGO_BUCKET).remove([uploadedLogoPath]);
        }
        toast.error('수정에 실패했습니다');
      }
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (isLoadingTeam || isLoadingMembership) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Spinner className="h-8 w-8 text-muted-foreground" />
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
      <Header onBack={leaveGuard.requestLeave} title="팀 프로필 수정" />

      <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-6 space-y-8">
        <TeamProfileEditBasicInfoSection
          logoId={logoPreviewUrl || logoId}
          name={name}
          register={register}
          onLogoFileSelect={handleLogoFileSelect}
          isUploadingLogo={isUploadingLogo}
          logoUploadError={logoUploadError}
        />

        <div className="border-t border-slate-100" />

        <TeamProfileEditScheduleSection
          regularDays={regularDays}
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
            disabled={isUpdating || isUploadingLogo || isSubmitting}
          >
            {isUpdating ? '저장 중...' : '저장'}
          </Button>
        </div>
      </form>

      <ConfirmDialog
        open={leaveGuard.showDialog}
        onOpenChange={leaveGuard.cancelLeave}
        icon={LogOut}
        title="정말 나가시겠습니까?"
        description="수정한 내용이 저장되지 않습니다."
        variant="destructive"
        confirmLabel="나가기"
        cancelLabel="계속 작성"
        onConfirm={leaveGuard.confirmLeave}
      />
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
