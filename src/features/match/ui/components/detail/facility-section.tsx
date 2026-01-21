'use client';

import React from 'react';
import { Match } from '@/features/match/model/mock-data';
import { Car, Droplets, Thermometer, BoxSelect, Droplet } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FacilitySectionProps {
  match: Match;
  id?: string;
}

// 코트 사이즈 라벨 매핑
const COURT_SIZE_LABELS: Record<string, string> = {
  REGULAR: '정규 사이즈',
  SHORT: '세로가 좀 짧아요',
  NARROW: '가로가 좀 좁아요',
};

export function FacilitySection({ match, id }: FacilitySectionProps) {
  const { facilities } = match;

  // 주차 정보 처리
  const getParkingInfo = (): { value: string; subValue?: string; isActive: boolean } => {
    if (!facilities) return { value: '정보 없음', isActive: false };

    const parkingLocation = facilities.parking_location as string | undefined;

    // parking이 boolean인 경우
    if (typeof facilities.parking === 'boolean') {
      if (facilities.parking) {
        const fee = facilities.parking_fee as string | undefined;
        const isFree = fee === '무료' || fee === '0';

        return {
          value: isFree ? '무료 주차' : fee ? `유료 (${fee})` : '주차 가능',
          subValue: parkingLocation,
          isActive: true
        };
      }
      return { value: '주차 불가', isActive: false };
    }

    // parking이 string인 경우 (legacy)
    if (facilities.parking === 'free') return { value: '무료 주차', subValue: parkingLocation, isActive: true };
    if (facilities.parking === 'paid') return { value: '유료 주차', subValue: parkingLocation, isActive: true };
    if (facilities.parking === 'impossible') return { value: '주차 불가', isActive: false };

    return { value: '주차 불가', isActive: false };
  };

  // 샤워실 정보 처리
  const getShowerInfo = () => {
    if (!facilities) return { value: '정보 없음', isActive: false };
    return {
      value: facilities.shower ? '이용 가능' : '이용 불가',
      isActive: !!facilities.shower
    };
  };

  // 코트 사이즈 정보 처리
  const getCourtSizeInfo = () => {
    const courtSizeType = facilities?.court_size_type as string | undefined;
    if (courtSizeType && COURT_SIZE_LABELS[courtSizeType]) {
      return COURT_SIZE_LABELS[courtSizeType];
    }
    return '정규 사이즈';
  };

  const parkingInfo = getParkingInfo();
  const showerInfo = getShowerInfo();

  // 냉난방 정보
  const hasAirConditioner = facilities?.air_conditioner;

  // 정수기 정보
  const hasWaterPurifier = facilities?.water_purifier;

  return (
    <div id={id} className="bg-white px-5 py-6 mb-2 scroll-mt-20">
      <h3 className="text-lg font-bold text-slate-900 mb-4">시설 정보</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* 주차 - 항상 표시 */}
        <FacilityCard
            icon={<Car className="w-5 h-5" />}
            label="주차"
            value={parkingInfo.value}
            subValue={parkingInfo.subValue}
            isActive={parkingInfo.isActive}
        />

        {/* 샤워실 - 항상 표시 */}
        <FacilityCard
            icon={<Droplets className="w-5 h-5" />}
            label="샤워실"
            value={showerInfo.value}
            isActive={showerInfo.isActive}
        />

        {/* 코트 사이즈 - 항상 표시 */}
        <FacilityCard
            icon={<BoxSelect className="w-5 h-5" />}
            label="코트 사이즈"
            value={getCourtSizeInfo()}
            isActive={true}
        />

        {/* 냉난방 - 있을 때만 표시 */}
        {hasAirConditioner !== undefined && (
          <FacilityCard
              icon={<Thermometer className="w-5 h-5" />}
              label="냉난방"
              value={hasAirConditioner ? '가동 중' : '없음'}
              isActive={!!hasAirConditioner}
          />
        )}

        {/* 정수기 - 있을 때만 표시 */}
        {hasWaterPurifier !== undefined && (
          <FacilityCard
              icon={<Droplet className="w-5 h-5" />}
              label="정수기"
              value={hasWaterPurifier ? '이용 가능' : '없음'}
              isActive={!!hasWaterPurifier}
          />
        )}
      </div>
    </div>
  );
}

interface FacilityCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
  isActive: boolean;
}

function FacilityCard({ icon, label, value, subValue, isActive }: FacilityCardProps) {
    return (
        <div className={cn(
            "flex flex-col p-3 rounded-xl border border-slate-100 bg-slate-50/50",
            !isActive && "opacity-50 grayscale"
        )}>
            <div className={cn("mb-2", isActive ? "text-slate-700" : "text-slate-400")}>
                {icon}
            </div>
            <div className="text-xs text-slate-500 mb-0.5">{label}</div>
            <div className="text-sm font-bold text-slate-900">{value}</div>
            {subValue && (
              <div className="text-xs text-slate-500 mt-0.5">{subValue}</div>
            )}
        </div>
    )
}
