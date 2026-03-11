'use client';

import type { TeamMatchDetailDTO } from '@/features/team/model/types';
import { FacilityInfoSection, type FacilityInfoInput } from '@/shared/ui/composite/facility-info-section';

interface TeamFacilitySectionProps {
  match: TeamMatchDetailDTO;
  id?: string;
}

export function TeamFacilitySection({ match, id }: TeamFacilitySectionProps) {
  return (
    <FacilityInfoSection
      id={id}
      facilities={(match.facilities ?? null) as FacilityInfoInput | null}
      showCourtSizeFallback
    />
  );
}
