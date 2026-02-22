'use client';

import { Car, Droplets, Thermometer, Droplet } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { TeamMatchDetailDTO } from '@/features/team/model/types';

interface FacilitySectionProps {
  match: TeamMatchDetailDTO;
  gym?: {
    name: string;
    address: string;
  };
}

// 시설 정보 타입 (gyms 테이블 기반)
interface FacilityInfo {
  parking?: boolean | string;
  parking_fee?: string;
  parking_location?: string;
  shower?: boolean;
  court_size_type?: string;
  ball?: boolean;
  water_purifier?: boolean;
  air_conditioner?: boolean;
}

export function FacilitySection({ match }: FacilitySectionProps) {
  const facilities: FacilityInfo = match.facilities || {};

  // 주차 정보 처리
  const getParkingInfo = (): { value: string; isActive: boolean } => {
    if (typeof facilities.parking === 'boolean') {
      return {
        value: facilities.parking ? '가능' : '불가',
        isActive: facilities.parking,
      };
    }
    if (facilities.parking === 'free') return { value: '무료', isActive: true };
    if (facilities.parking === 'paid') return { value: '유료', isActive: true };
    return { value: '정보 없음', isActive: false };
  };

  // 샤워실 정보
  const getShowerInfo = () => ({
    value: facilities.shower ? '이용 가능' : '이용 불가',
    isActive: !!facilities.shower,
  });

  const parkingInfo = getParkingInfo();
  const showerInfo = getShowerInfo();

  return (
    <section className="bg-white rounded-xl border border-slate-200 px-5 py-6">
      <h3 className="text-base font-bold text-slate-900 mb-4">시설 정보</h3>

      <div className="divide-y divide-slate-100">
        {/* 주차 */}
        <FacilityRow
          icon={<Car className="w-5 h-5" />}
          label="주차"
          value={parkingInfo.value}
          isActive={parkingInfo.isActive}
        />

        {/* 샤워실 */}
        <FacilityRow
          icon={<Droplets className="w-5 h-5" />}
          label="샤워실"
          value={showerInfo.value}
          isActive={showerInfo.isActive}
        />

        {/* 정수기 */}
        {facilities.water_purifier !== undefined && (
          <FacilityRow
            icon={<Droplet className="w-5 h-5" />}
            label="정수기"
            value={facilities.water_purifier ? '이용 가능' : '없음'}
            isActive={!!facilities.water_purifier}
          />
        )}

        {/* 냉난방 */}
        {facilities.air_conditioner !== undefined && (
          <FacilityRow
            icon={<Thermometer className="w-5 h-5" />}
            label="냉난방"
            value={facilities.air_conditioner ? '가동 중' : '없음'}
            isActive={!!facilities.air_conditioner}
          />
        )}
      </div>
    </section>
  );
}

interface FacilityRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  isActive: boolean;
}

function FacilityRow({ icon, label, value, isActive }: FacilityRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className={cn(isActive ? 'text-slate-600' : 'text-slate-400')}>
          {icon}
        </div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          isActive ? 'text-slate-900' : 'text-slate-400'
        )}
      >
        {value}
      </span>
    </div>
  );
}
