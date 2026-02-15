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
        isExistingGym ? 'bg-orange-50/30 border-orange-200 shadow-sm' : 'bg-white border-slate-200'
      )}
    >
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-bold text-slate-900 truncate">{location.buildingName || location.address}</h3>
            {isExistingGym && (
              <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-bold text-[#FF6600] bg-orange-100 rounded-md">
                등록된 체육관
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[13px] text-slate-500 mt-1">
            {location.buildingName && <span className="truncate">{location.address}</span>}

            {location.placeUrl && (
              <button
                type="button"
                onClick={openKakaoMap}
                className="shrink-0 flex items-center gap-0.5 text-slate-400 hover:text-[#FF6600] transition-colors underline decoration-slate-300 hover:decoration-[#FF6600] underline-offset-2"
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
            className="p-1.5 text-slate-300 hover:text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            title="장소 변경"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
