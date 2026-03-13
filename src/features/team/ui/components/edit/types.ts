import type { GenderValue } from '@/shared/config/match-constants';
import type { RegularDayValue } from '@/shared/config/team-constants';

export interface TeamProfileEditFormData {
  code: string;
  name: string;
  logoId: string;
  regularDays: RegularDayValue[];
  regularTime: string;
  duration: string;
  gender: GenderValue;
  selectedAges: string[];
  levelMin: number;
  levelMax: number;
}
