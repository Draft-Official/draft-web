'use client';

import type { LocationData } from '@/features/match-create/model/types';
import { LocationCard } from '@/shared/ui/composite/location-card';

interface SelectedLocationCardProps {
  location: LocationData;
  isExistingGym: boolean;
  onClear: () => void;
}

export function SelectedLocationCard({
  location,
  isExistingGym,
  onClear
}: SelectedLocationCardProps) {
  return <LocationCard location={location} isExistingGym={isExistingGym} onClear={onClear} />;
}
