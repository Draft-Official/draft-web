'use client';

import { useFormContext } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';

import { StepHeader } from './step-header';
import { TeamScheduleFields } from './team-schedule-fields';
import type { RegularDayValue } from '@/shared/config/team-constants';
import type { LocationData } from '@/shared/types/location.types';

interface TeamCreateStepScheduleProps {
  regularDays: RegularDayValue[];
  locationData: LocationData | null;
  onLocationResolvedChange: (next: LocationSearchResolvedValue) => void;
}

interface TeamCreateScheduleFormValues {
  regularDays: RegularDayValue[];
  regularTime: string;
  duration: string;
}

export function TeamCreateStepSchedule({
  regularDays,
  locationData,
  onLocationResolvedChange,
}: TeamCreateStepScheduleProps) {
  const { control, setValue } = useFormContext<TeamCreateScheduleFormValues>();

  const toggleDay = (day: RegularDayValue) => {
    const next = regularDays.includes(day)
      ? regularDays.filter((d) => d !== day)
      : [...regularDays, day];
    setValue('regularDays', next);
  };

  return (
    <div className="space-y-6">
      <StepHeader step={2} title="운동 정보" icon={Calendar} />
      <TeamScheduleFields
        regularDays={regularDays}
        control={control}
        onToggleDay={toggleDay}
        locationData={locationData}
        onLocationResolvedChange={onLocationResolvedChange}
      />
    </div>
  );
}
