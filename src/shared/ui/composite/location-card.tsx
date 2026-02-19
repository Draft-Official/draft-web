'use client';

import { X, MapPinned } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { LocationData } from '@/shared/types/location.types';

interface LocationCardProps {
  location: LocationData;
  isExistingGym: boolean;
  onClear: () => void;
}

export function LocationCard({ location, isExistingGym, onClear }: LocationCardProps) {
  const openKakaoMap = () => {
    if (location.placeUrl) {
      window.open(location.placeUrl, '_blank');
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-xl p-4 border transition-all',
        isExistingGym ? 'bg-brand-weak/30 border-brand-stroke-weak shadow-sm' : 'bg-background border-border'
      )}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-foreground truncate">{location.buildingName || location.address}</h3>
            {isExistingGym && (
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold text-primary bg-brand-weak-pressed rounded-md">
                등록된 체육관
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-[13px] text-muted-foreground">
            {location.buildingName && <span className="truncate">{location.address}</span>}

            {location.placeUrl && (
              <button
                type="button"
                onClick={openKakaoMap}
                className="shrink-0 flex items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors underline decoration-border hover:decoration-primary underline-offset-2"
                title="카카오맵에서 위치 보기"
              >
                <MapPinned className="w-3 h-3" />
                위치보기
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0 items-end">
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg p-1.5 text-muted-foreground/50 hover:bg-muted hover:text-muted-foreground transition-colors"
            title="장소 변경"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
