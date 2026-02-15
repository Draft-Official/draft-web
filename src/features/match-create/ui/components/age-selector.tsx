'use client';

import { AgeRangeSelector } from '@/shared/ui/composite/age-range-selector';

interface AgeSelectorProps {
  selectedAges: string[];
  onSelect: (age: string) => void;
  onRangeUpdate: (ages: string[]) => void;
}

export function AgeSelector({
  selectedAges,
  onSelect,
  onRangeUpdate
}: AgeSelectorProps) {
  return <AgeRangeSelector selectedAges={selectedAges} onSelect={onSelect} onRangeUpdate={onRangeUpdate} />;
}
