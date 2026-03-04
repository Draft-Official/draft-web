'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, LogOut } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Spinner } from '@/shared/ui/shadcn/spinner';

import { Button } from '@/shared/ui/shadcn/button';
import { ConfirmDialog } from '@/shared/ui/composite/confirm-dialog';
import { useLeaveGuard } from '@/shared/lib/hooks/use-leave-guard';

import { useCreateTeam } from '@/features/team/api/team-info/mutations';
import { useAuth } from '@/shared/session';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createGymService, gymKeys } from '@/entities/gym';
import { createTeamService } from '@/entities/team';

import { StepProgressBar } from './components/step-progress-bar';
import { TeamCreateStepInfo } from './components/team-create-step-info';
import { TeamCreateStepSchedule } from './components/team-create-step-schedule';
import { TeamCreateStepTraits } from './components/team-create-step-traits';
import {
  calcEndTimeFromDuration,
  selectedAgesToAgeRange,
  TEAM_LOGO_BUCKET,
  uploadTeamLogoFile,
  validateTeamLogoFile,
} from '@/features/team/lib';

import {
  TEAM_CODE_REGEX,
  TEAM_CODE_ERROR_MESSAGE,
  TEAM_NAME_MAX_LENGTH,
  TEAM_NAME_ERROR_MESSAGE,
  TEAM_NAME_CHARACTER_ERROR_MESSAGE,
  isValidTeamName,
} from '@/shared/config/team-constants';
import type { RegularDayValue } from '@/shared/config/team-constants';
import type { LocationData } from '@/shared/types/location.types';
import type { GenderValue } from '@/shared/config/match-constants';
import type { CreateTeamInput } from '@/features/team/model/types';
import type { LevelRange } from '@/shared/types/jsonb.types';
import { parseRegionFromAddress } from '@/shared/lib/parse-region';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';

interface TeamCreateFormData {
  // Step 1: 팀 정보
  name: string;
  code: string;
  logoId: string;

  // Step 2: 운동 정보
  regularDays: RegularDayValue[];
  regularTime: string;
  duration: string;

  // Step 3: 팀 특성
  gender: GenderValue;
  selectedAges: string[];
  levelMin: number;
  levelMax: number;
}

export function TeamCreateForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>('');

  const methods = useForm<TeamCreateFormData>({
    defaultValues: {
      name: '',
      code: '',
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

  const { handleSubmit, watch, setValue, trigger } = methods;

  const handleLocationResolvedChange = useCallback((next: LocationSearchResolvedValue) => {
    setLocationData(next.locationData);
  }, []);

  // Team code validation state
  const [isCheckingCode, setIsCheckingCode] = useState(false);
  const [codeStatus, setCodeStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');

  // Create team mutation
  const { mutateAsync: createTeamAsync, isPending: isCreating } = useCreateTeam();

  // Watch form values
  const name = watch('name');
  const code = watch('code');
  const logoId = watch('logoId');
  const regularDays = watch('regularDays');
  const gender = watch('gender');
  const selectedAges = watch('selectedAges');
  const levelMin = watch('levelMin');
  const levelMax = watch('levelMax');
  const trimmedName = name.trim();
  const isLogoChanged = logoId !== '' || pendingLogoFile !== null;

  const isDirty = trimmedName !== '' || code !== '' || locationData !== null || isLogoChanged;
  const leaveGuard = useLeaveGuard(isDirty);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  // Step별 다음 버튼 disabled 여부
  const isStep1Valid = Boolean(
    trimmedName &&
    trimmedName.length <= TEAM_NAME_MAX_LENGTH &&
    isValidTeamName(trimmedName) &&
    code &&
    codeStatus === 'available'
  );
  const isStep2Valid = Boolean(regularDays.length > 0 && locationData);

  const isNextDisabled =
    (currentStep === 1 && (!isStep1Valid || isUploadingLogo || isSubmitting)) ||
    (currentStep === 2 && (!isStep2Valid || isSubmitting));

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

  // 팀 코드 검증
  const validateCode = async (value: string) => {
    if (!value) {
      setCodeStatus('idle');
      return;
    }

    if (!TEAM_CODE_REGEX.test(value)) {
      setCodeStatus('invalid');
      return;
    }

    setIsCheckingCode(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const teamService = createTeamService(supabase);
      const exists = await teamService.checkTeamCodeExists(value);
      setCodeStatus(exists ? 'taken' : 'available');
    } catch {
      setCodeStatus('idle');
    } finally {
      setIsCheckingCode(false);
    }
  };

  // 나이 선택 핸들러
  const handleAgeSelection = (age: string) => {
    if (age === 'any') {
      setValue('selectedAges', ['any']);
      return;
    }

    const current = selectedAges.filter(a => a !== 'any');
    if (current.includes(age)) {
      const newAges = current.filter(a => a !== age);
      setValue('selectedAges', newAges.length > 0 ? newAges : ['any']);
    } else {
      setValue('selectedAges', [...current, age]);
    }
  };

  // Step validation
  const validateStep = async (step: number): Promise<boolean> => {
    switch (step) {
      case 1: {
        const isValid = await trigger(['name', 'code']);
        if (!trimmedName) {
          toast.error('팀 이름을 입력해주세요');
          return false;
        }
        if (trimmedName.length > TEAM_NAME_MAX_LENGTH) {
          toast.error(TEAM_NAME_ERROR_MESSAGE);
          return false;
        }
        if (!isValidTeamName(trimmedName)) {
          toast.error(TEAM_NAME_CHARACTER_ERROR_MESSAGE);
          return false;
        }
        if (!code) {
          toast.error('팀 코드를 입력해주세요');
          return false;
        }
        if (codeStatus === 'invalid') {
          toast.error(TEAM_CODE_ERROR_MESSAGE);
          return false;
        }
        if (codeStatus === 'taken') {
          toast.error('이미 사용 중인 팀 코드입니다');
          return false;
        }
        if (codeStatus !== 'available') {
          toast.error('팀 코드 확인이 필요합니다');
          return false;
        }
        return isValid;
      }
      case 2: {
        if (regularDays.length === 0) {
          toast.error('정기 운동 요일을 선택해주세요');
          return false;
        }
        if (!locationData) {
          toast.error('홈구장을 선택해주세요');
          return false;
        }
        return true;
      }
      case 3:
        return true;
      default:
        return true;
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit handler
  const onSubmit = async (data: TeamCreateFormData) => {
    // 마지막 step이 아니면 submit 무시 (Enter 키로 인한 의도치 않은 submit 방지)
    if (currentStep !== totalSteps) return;

    if (submitLockRef.current || isUploadingLogo || isSubmitting) {
      toast.error('로고 업로드가 완료된 후 다시 시도해주세요');
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      if (!user) {
        toast.error('로그인이 필요합니다');
        return;
      }

      let uploadedLogoPath: string | null = null;
      let logoUrl = data.logoId || undefined;

      // Gym upsert 먼저 실행: locationData가 있으면 gym을 찾거나 생성하여 UUID 획득
      let homeGymId: string | undefined;
      if (locationData && locationData.kakaoPlaceId && locationData.x && locationData.y) {
        try {
          const supabase = getSupabaseBrowserClient();
          const gymService = createGymService(supabase);

          // Gym upsert를 createTeam 전에 완료하여 데이터베이스에 먼저 저장
          homeGymId = await gymService.upsertGym({
            name: locationData.buildingName || locationData.address,
            address: locationData.address,
            latitude: parseFloat(locationData.y),
            longitude: parseFloat(locationData.x),
            kakaoPlaceId: locationData.kakaoPlaceId,
            facilities: {}, // 빈 객체: 기존 facilities 덮어쓰지 않음
          });

          // Gym이 정상적으로 저장되었는지 확인
          if (!homeGymId) {
            toast.error('홈구장 정보 저장에 실패했습니다');
            return;
          }
          queryClient.invalidateQueries({ queryKey: gymKeys.all });
          queryClient.invalidateQueries({ queryKey: gymKeys.detail(homeGymId) });
          queryClient.invalidateQueries({
            queryKey: gymKeys.byKakaoPlaceId(locationData.kakaoPlaceId),
          });
        } catch (error) {
          console.error('Gym upsert error:', error);
          toast.error('홈구장 정보 저장에 실패했습니다');
          return;
        }
      }

      // Region 파싱
      const region = locationData?.address
        ? parseRegionFromAddress(locationData.address)
        : { depth1: null, depth2: null };

      // Level Range 변환
      const levelRange: LevelRange = {
        min: data.levelMin,
        max: data.levelMax,
      };

      const ageRange = selectedAgesToAgeRange(data.selectedAges) ?? undefined;

      const regularEndTime = data.regularTime && data.duration
        ? calcEndTimeFromDuration(data.regularTime, data.duration)
        : undefined;

      if (pendingLogoFile) {
        setIsUploadingLogo(true);
        setLogoUploadError(null);
        try {
          const uploaded = await uploadTeamLogoFile({
            file: pendingLogoFile,
            userId: user.id,
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

      const input: CreateTeamInput = {
        code: data.code,
        name: data.name.trim(),
        logoUrl,
        regionDepth1: region.depth1 || undefined,
        regionDepth2: region.depth2 || undefined,
        regularDays: data.regularDays.length > 0 ? data.regularDays : undefined,
        regularStartTime: data.regularTime || undefined,
        regularEndTime,
        teamGender: data.gender,
        levelRange,
        ageRange,
        homeGymId,
      };

      try {
        const createdTeam = await createTeamAsync({ userId: user.id, input });
        toast.success('팀이 생성되었습니다!');
        router.push(`/team/${createdTeam.code || createdTeam.id}`);
      } catch (error) {
        if (uploadedLogoPath) {
          const supabase = getSupabaseBrowserClient();
          void supabase.storage.from(TEAM_LOGO_BUCKET).remove([uploadedLogoPath]);
        }
        const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
        toast.error(`팀 생성 실패: ${message}`);
      }
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 h-14 flex items-center justify-between px-4">
          <button
            type="button"
            onClick={() => currentStep > 1 ? handlePrev() : leaveGuard.requestLeave()}
            className="p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">팀 만들기</h1>
          <div className="w-10" />
        </header>

        {/* Progress Bar */}
        <div className="px-4 py-3 border-b border-slate-100">
          <StepProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-6">
          <div>
            {/* Step 1: 팀 정보 */}
            {currentStep === 1 && (
              <TeamCreateStepInfo
                logoId={logoPreviewUrl || logoId}
                codeStatus={codeStatus}
                isCheckingCode={isCheckingCode}
                onCodeChange={validateCode}
                onLogoFileSelect={handleLogoFileSelect}
                isUploadingLogo={isUploadingLogo}
                logoUploadError={logoUploadError}
              />
            )}

            {/* Step 2: 운동 정보 */}
            {currentStep === 2 && (
              <TeamCreateStepSchedule
                regularDays={regularDays}
                locationData={locationData}
                onLocationResolvedChange={handleLocationResolvedChange}
              />
            )}

            {/* Step 3: 팀 특성 */}
            {currentStep === 3 && (
              <TeamCreateStepTraits
                gender={gender}
                selectedAges={selectedAges}
                levelMin={levelMin}
                levelMax={levelMax}
                onAgeSelection={handleAgeSelection}
              />
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-8 flex gap-3">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                className="flex-1 h-14 text-base font-bold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                이전
              </Button>
            )}

            {currentStep < totalSteps ? (
              <Button
                key="next-button"
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled}
                className="flex-1 h-14 text-base font-bold bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                key="submit-button"
                type="submit"
                disabled={isCreating || isUploadingLogo || isSubmitting}
                className="flex-1 h-14 text-base font-bold bg-primary hover:bg-primary/90"
              >
                {isCreating ? (
                  <>
                    <Spinner className="w-4 h-4 mr-2 " />
                    생성 중...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    팀 만들기
                  </>
                )}
              </Button>
            )}
          </div>
        </form>

        <ConfirmDialog
          open={leaveGuard.showDialog}
          onOpenChange={leaveGuard.cancelLeave}
          icon={LogOut}
          title="정말 나가시겠습니까?"
          description="입력한 정보가 삭제됩니다."
          variant="destructive"
          confirmLabel="나가기"
          cancelLabel="계속 작성"
          onConfirm={leaveGuard.confirmLeave}
        />
      </div>
    </FormProvider>
  );
}
