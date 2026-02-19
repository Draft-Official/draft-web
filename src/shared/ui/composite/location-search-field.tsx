'use client';

import { useEffect, useRef } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useLocationSearch } from '@/shared/lib/hooks/use-location-search';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { LocationCard } from '@/shared/ui/composite/location-card';
import type { LocationData } from '@/shared/types/location.types';

interface LocationSearchFieldProps {
  label?: string;
  required?: boolean;
  placeholder?: string;
  value?: LocationData | null;
  onResolvedChange?: (next: LocationSearchResolvedValue) => void;
  onInputFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
}

function getLocationKey(data: LocationData | null | undefined) {
  if (!data) return '';
  return `${data.kakaoPlaceId ?? ''}|${data.address}|${data.buildingName ?? ''}|${data.x ?? ''}|${data.y ?? ''}`;
}

export function LocationSearchField({
  label = '장소',
  required = false,
  placeholder = '체육관 검색 (예: 서초종합체육관)',
  value,
  onResolvedChange,
  onInputFocus,
  className,
}: LocationSearchFieldProps) {
  const {
    location,
    locationData,
    searchResults,
    isDropdownOpen,
    isExistingGym,
    gymFacilities,
    handleSearch,
    handleSelect,
    handleClear,
  } = useLocationSearch();

  const externalKey = getLocationKey(value);
  const internalKeyRef = useRef('');
  const lastSyncedExternalKeyRef = useRef<string | null>(null);

  useEffect(() => {
    internalKeyRef.current = getLocationKey(locationData);
  }, [locationData]);

  useEffect(() => {
    if (value === undefined) return;
    if (lastSyncedExternalKeyRef.current === externalKey) return;

    lastSyncedExternalKeyRef.current = externalKey;

    if (!value) {
      handleClear();
      return;
    }

    if (externalKey === internalKeyRef.current) {
      return;
    }

    void handleSelect(value);
  }, [value, externalKey, handleSelect, handleClear]);

  useEffect(() => {
    onResolvedChange?.({
      locationData,
      isExistingGym,
      gymFacilities,
    });
  }, [locationData, isExistingGym, gymFacilities, onResolvedChange]);

  return (
    <div className={cn('space-y-2', className)}>
      <Label className="text-sm font-bold text-slate-900 mb-2 block">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Label>

      {locationData ? (
        <LocationCard
          location={locationData}
          isExistingGym={isExistingGym}
          onClear={handleClear}
        />
      ) : (
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
          <Input
            placeholder={placeholder}
            value={location}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={onInputFocus}
            onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
            className="pl-10 h-12 pr-12"
          />

          {isDropdownOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.kakaoPlaceId ?? result.address}-${index}`}
                  className="w-full flex items-center justify-between border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors group"
                >
                  <button
                    onClick={() => {
                      void handleSelect(result);
                    }}
                    className="flex-1 px-4 py-3 text-left flex items-start gap-2 min-w-0"
                    type="button"
                  >
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0 group-hover:text-primary" />
                    <div className="flex-1 min-w-0">
                      {result.buildingName && (
                        <div className="text-sm font-bold text-slate-900 mb-0.5 truncate">
                          {result.buildingName}
                        </div>
                      )}
                      <div className={cn(
                        'text-xs text-slate-600 truncate',
                        !result.buildingName && 'text-sm font-medium text-slate-900'
                      )}>
                        {result.address}
                      </div>
                    </div>
                  </button>

                  {result.placeUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(result.placeUrl, '_blank');
                      }}
                      className="px-3 py-3 text-slate-400 hover:text-primary transition-colors flex-shrink-0"
                      title="카카오맵에서 보기"
                      type="button"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
