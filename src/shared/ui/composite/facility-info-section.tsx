'use client';

import type { ReactNode } from 'react';
import { Car, Droplets, Thermometer, BoxSelect, Droplet, CircleDot } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  BALL_LABELS,
  COURT_SIZE_LABELS,
  type BallValue,
  type CourtSizeValue,
} from '@/shared/config/match-constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/shadcn/accordion';

export interface FacilityInfoInput {
  parking?: boolean | string | null;
  parking_fee?: string | null;
  parking_location?: string | null;
  shower?: boolean | null;
  court_size_type?: string | null;
  ball?: boolean | null;
  water_purifier?: boolean | null;
  air_conditioner?: boolean | null;
}

interface FacilityInfoSectionProps {
  facilities: FacilityInfoInput | null | undefined;
  id?: string;
  title?: string;
  showCourtSizeFallback?: boolean;
}

interface ParkingInfo {
  value: string;
  fee?: string;
  location?: string;
  isActive: boolean;
}

function getParkingInfo(facilities: FacilityInfoInput | null | undefined): ParkingInfo {
  if (!facilities) return { value: '정보 없음', isActive: false };

  const parkingLocation = facilities.parking_location ?? undefined;
  const parkingFee = facilities.parking_fee ?? undefined;

  if (typeof facilities.parking === 'boolean') {
    if (facilities.parking) {
      const isFree = parkingFee === '무료' || parkingFee === '0' || !parkingFee;

      return {
        value: isFree ? '무료' : '유료',
        fee: !isFree ? parkingFee : undefined,
        location: parkingLocation,
        isActive: true,
      };
    }
    return { value: '불가', isActive: false };
  }

  if (facilities.parking === 'free') return { value: '무료', location: parkingLocation, isActive: true };
  if (facilities.parking === 'paid') return { value: '유료', fee: parkingFee, location: parkingLocation, isActive: true };
  if (facilities.parking === 'impossible') return { value: '불가', isActive: false };

  return { value: '불가', isActive: false };
}

function getShowerInfo(facilities: FacilityInfoInput | null | undefined) {
  if (!facilities) return { value: '정보 없음', isActive: false };
  return {
    value: facilities.shower ? '이용 가능' : '이용 불가',
    isActive: !!facilities.shower,
  };
}

function getCourtSizeInfo(
  facilities: FacilityInfoInput | null | undefined,
  showCourtSizeFallback: boolean
): string | null {
  const courtSizeType = (facilities?.court_size_type ?? undefined) as CourtSizeValue | undefined;
  if (courtSizeType && COURT_SIZE_LABELS[courtSizeType]) {
    return COURT_SIZE_LABELS[courtSizeType].label;
  }
  return showCourtSizeFallback ? '정규 사이즈' : null;
}

function getBallInfo(facilities: FacilityInfoInput | null | undefined) {
  if (!facilities || facilities.ball === undefined || facilities.ball === null) return null;
  const ballValue: BallValue = facilities.ball ? 'PROVIDED' : 'NOT_PROVIDED';
  return {
    value: BALL_LABELS[ballValue],
    isActive: !!facilities.ball,
  };
}

interface FacilityRowProps {
  icon: ReactNode;
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
      <span className={cn('text-sm font-medium', isActive ? 'text-slate-900' : 'text-slate-400')}>
        {value}
      </span>
    </div>
  );
}

export function FacilityInfoSection({
  facilities,
  id,
  title = '시설 정보',
  showCourtSizeFallback = false,
}: FacilityInfoSectionProps) {
  const parkingInfo = getParkingInfo(facilities);
  const showerInfo = getShowerInfo(facilities);
  const courtSizeInfo = getCourtSizeInfo(facilities, showCourtSizeFallback);
  const ballInfo = getBallInfo(facilities);
  const hasAirConditioner = facilities?.air_conditioner;
  const hasWaterPurifier = facilities?.water_purifier;
  const hasParkingDetails = parkingInfo.location || parkingInfo.fee;

  return (
    <div id={id} className="bg-white px-5 py-6 mb-2 scroll-mt-20">
      <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>

      <div className="divide-y divide-slate-100">
        {hasParkingDetails ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="parking" className="border-none">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-3">
                    <Car className={cn('w-5 h-5', parkingInfo.isActive ? 'text-slate-600' : 'text-slate-400')} />
                    <span className="text-sm text-slate-600">주차</span>
                  </div>
                  <span className={cn('text-sm font-medium', parkingInfo.isActive ? 'text-slate-900' : 'text-slate-400')}>
                    {parkingInfo.value}
                    {parkingInfo.fee && ` (${parkingInfo.fee})`}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="pl-8 text-sm text-slate-500">
                  {parkingInfo.location && <p>주차 위치 : {parkingInfo.location}</p>}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <FacilityRow
            icon={<Car className="w-5 h-5" />}
            label="주차"
            value={parkingInfo.value}
            isActive={parkingInfo.isActive}
          />
        )}

        <FacilityRow
          icon={<Droplets className="w-5 h-5" />}
          label="샤워실"
          value={showerInfo.value}
          isActive={showerInfo.isActive}
        />

        {courtSizeInfo && (
          <FacilityRow
            icon={<BoxSelect className="w-5 h-5" />}
            label="코트 사이즈"
            value={courtSizeInfo}
            isActive
          />
        )}

        {hasWaterPurifier !== undefined && hasWaterPurifier !== null && (
          <FacilityRow
            icon={<Droplet className="w-5 h-5" />}
            label="정수기"
            value={hasWaterPurifier ? '이용 가능' : '없음'}
            isActive={!!hasWaterPurifier}
          />
        )}

        {ballInfo && (
          <FacilityRow
            icon={<CircleDot className="w-5 h-5" />}
            label="공"
            value={ballInfo.value}
            isActive={ballInfo.isActive}
          />
        )}

        {hasAirConditioner !== undefined && hasAirConditioner !== null && (
          <FacilityRow
            icon={<Thermometer className="w-5 h-5" />}
            label="냉난방"
            value={hasAirConditioner ? '가동 중' : '없음'}
            isActive={!!hasAirConditioner}
          />
        )}
      </div>
    </div>
  );
}
