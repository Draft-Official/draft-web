'use client';

import { GuestMatchDetailDTO } from '@/features/match/model/types';
import { FacilityInfoSection, type FacilityInfoInput } from '@/shared/ui/composite/facility-info-section';

interface FacilitySectionProps {
  match: GuestMatchDetailDTO;
  id?: string;
}

export function FacilitySection({ match, id }: FacilitySectionProps) {
  return (
    <FacilityInfoSection
      id={id}
      facilities={(match.facilities ?? null) as FacilityInfoInput | null}
      showCourtSizeFallback={false}
    />
  );
}
