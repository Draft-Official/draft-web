'use client';

import type { Control, UseFormSetValue } from 'react-hook-form';
import type { LocationData } from '@/shared/types/location.types';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';
import type { RegularDayValue } from '@/shared/config/team-constants';
import type { TeamProfileEditFormData } from '../../edit/types';
import { TeamScheduleFields } from '../../team-schedule-fields';

interface TeamProfileEditScheduleSectionProps {
  regularDays: RegularDayValue[];
  control: Control<TeamProfileEditFormData>;
  setValue: UseFormSetValue<TeamProfileEditFormData>;
  locationData: LocationData | null;
  onLocationResolvedChange: (next: LocationSearchResolvedValue) => void;
}

export function TeamProfileEditScheduleSection({
  regularDays,
  control,
  setValue,
  locationData,
  onLocationResolvedChange,
}: TeamProfileEditScheduleSectionProps) {
  const toggleDay = (day: RegularDayValue) => {
    const next = regularDays.includes(day)
      ? regularDays.filter((d) => d !== day)
      : [...regularDays, day];
    setValue('regularDays', next, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <TeamScheduleFields
      regularDays={regularDays}
      control={control}
      onToggleDay={toggleDay}
      locationData={locationData}
      onLocationResolvedChange={onLocationResolvedChange}
    />
  );
}
