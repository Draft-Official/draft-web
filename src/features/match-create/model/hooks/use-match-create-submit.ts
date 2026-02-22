import { toast } from '@/shared/ui/shadcn/sonner';
import type {
  CourtSizeValue,
  GenderValue,
  MatchFormatValue,
  PlayStyleValue,
  RefereeTypeValue,
} from '@/shared/config/match-constants';
import { useCreateMatch, useSaveMatchCreateDefaults, useUpdateMatch } from '@/features/match-create/api/mutations';
import { buildMatchCreatePayload, validateMatchCreateSubmit } from '@/features/match-create/lib/submit';
import type { LocationData } from '@/features/match-create/model/types';
import type { MatchCreateSubmitFormValues } from '@/features/match-create/model/submit-form.types';

interface RecruitmentState {
  isPositionMode: boolean;
  isFlexBigman: boolean;
  positions: {
    guard: number;
    forward: number;
    center: number;
    bigman: number;
  };
  totalCount: number;
}

interface MatchSpecState {
  matchFormat: MatchFormatValue;
  gameFormatType: PlayStyleValue | undefined;
  isGameFormatSelected: boolean;
  levelMin: number;
  levelMax: number;
  gender: GenderValue;
  selectedAges: string[];
  isRulesSelected: boolean;
  ruleMinutes: string;
  ruleQuarters: string;
  ruleGames: string;
  refereeType: RefereeTypeValue | undefined;
  isRefereeSelected: boolean;
}

interface FacilitiesState {
  feeType: 'cost' | 'beverage';
  parkingCost: string;
  parkingDetail: string;
  hasWater: boolean;
  hasAcHeat: boolean;
  hasShower: boolean;
  courtSize: CourtSizeValue | '';
  hasBall: boolean;
  hasBeverage: boolean;
}

interface UseMatchCreateSubmitParams {
  isEditMode: boolean;
  editMatchId: string | null;
  selectedDate: string | null;
  locationData: LocationData | null;
  recruitment: RecruitmentState;
  matchSpec: MatchSpecState;
  facilities: FacilitiesState;
  currentUserId?: string;
  onSuccessNavigate: (publicId?: string) => void;
}

function scrollToSection(sectionId: string) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

export function useMatchCreateSubmit({
  isEditMode,
  editMatchId,
  selectedDate,
  locationData,
  recruitment,
  matchSpec,
  facilities,
  currentUserId,
  onSuccessNavigate,
}: UseMatchCreateSubmitParams) {
  const { mutate: createMatch, isPending: isCreating } = useCreateMatch();
  const { mutate: updateMatch, isPending: isUpdating } = useUpdateMatch();
  const { mutateAsync: saveMatchCreateDefaults } = useSaveMatchCreateDefaults();

  const isPending = isCreating || isUpdating;

  const onSubmit = async (data: MatchCreateSubmitFormValues) => {
    const validationResult = validateMatchCreateSubmit({
      form: data,
      selectedDate,
      locationData,
      isPositionMode: recruitment.isPositionMode,
      positions: recruitment.positions,
      totalCount: recruitment.totalCount,
    });

    if (!validationResult.ok) {
      toast.error(validationResult.error.message);
      scrollToSection(validationResult.error.sectionId);
      return;
    }

    const {
      selectedDate: validatedSelectedDate,
      locationData: selectedLocationData,
      opsHost,
      normalizedContactType,
      opsContactContent,
    } = validationResult.data;

    const payload = buildMatchCreatePayload({
      form: data,
      selectedDate: validatedSelectedDate,
      locationData: selectedLocationData,
      feeType: facilities.feeType,
      isPositionMode: recruitment.isPositionMode,
      isFlexBigman: recruitment.isFlexBigman,
      positions: recruitment.positions,
      totalCount: recruitment.totalCount,
      matchFormat: matchSpec.matchFormat,
      gameFormatType: matchSpec.gameFormatType,
      isGameFormatSelected: matchSpec.isGameFormatSelected,
      levelMin: matchSpec.levelMin,
      levelMax: matchSpec.levelMax,
      gender: matchSpec.gender,
      selectedAges: matchSpec.selectedAges,
      isRulesSelected: matchSpec.isRulesSelected,
      ruleMinutes: matchSpec.ruleMinutes,
      ruleQuarters: matchSpec.ruleQuarters,
      ruleGames: matchSpec.ruleGames,
      refereeType: matchSpec.refereeType,
      isRefereeSelected: matchSpec.isRefereeSelected,
      parkingCost: facilities.parkingCost,
      parkingDetail: facilities.parkingDetail,
      hasWater: facilities.hasWater,
      hasAcHeat: facilities.hasAcHeat,
      hasShower: facilities.hasShower,
      courtSize: facilities.courtSize,
      hasBall: facilities.hasBall,
      hasBeverage: facilities.hasBeverage,
      opsHost,
      normalizedContactType,
      opsContactContent,
    });

    const handleSuccess = async (match?: { id: string; short_id?: string | null }) => {
      if (data.operations?.saveAsDefault && currentUserId) {
        try {
          await saveMatchCreateDefaults({
            userId: currentUserId,
            selectedHost: opsHost,
            accountInfo: {
              bank: data.bankName || '',
              number: data.accountNumber || '',
              holder: data.accountHolder || '',
            },
            contactInfo: {
              type: normalizedContactType,
              content: opsContactContent,
            },
            hostNotice: data.description || '',
          });
        } catch (saveDefaultsError) {
          console.error('Failed to save defaults:', saveDefaultsError);
        }
      }

      onSuccessNavigate(match?.short_id ?? match?.id);
    };

    const handleError = (error: unknown) => {
      console.error(error);
      const message = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error(isEditMode ? `경기 수정에 실패했습니다: ${message}` : `경기 생성에 실패했습니다: ${message}`);
    };

    if (isEditMode && editMatchId) {
      updateMatch(
        { matchId: editMatchId, form: payload },
        { onSuccess: handleSuccess, onError: handleError }
      );
      return;
    }

    createMatch(payload, { onSuccess: handleSuccess, onError: handleError });
  };

  return {
    isPending,
    onSubmit,
  };
}
