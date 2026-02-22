import type { GenderValue } from '@/shared/config/match-constants';
import type { RegularDayValue } from '@/shared/config/team-constants';

export interface TeamProfileEditFormData {
  name: string;
  shortIntro: string;
  description: string;
  logoId: string;
  regularDay: RegularDayValue | '';
  regularTime: string;
  duration: string;
  gender: GenderValue;
  selectedAges: string[];
  levelMin: number;
  levelMax: number;
}
