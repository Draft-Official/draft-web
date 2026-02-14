'use client';

import React from 'react';
import { GuestMatchDetailDTO } from '@/features/match/model/types';
import { Car, Droplets, Thermometer, BoxSelect, Droplet, CircleDot } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { COURT_SIZE_LABELS, BALL_LABELS, type CourtSizeValue, type BallValue } from '@/shared/config/match-constants';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/shadcn/accordion';

interface FacilitySectionProps {
  match: GuestMatchDetailDTO;
  id?: string;
}

export function FacilitySection({ match, id }: FacilitySectionProps) {
  const { facilities } = match;

  // 주차 정보 처리
  const getParkingInfo = (): { value: string; fee?: string; location?: string; isActive: boolean } => {
    if (!facilities) return { value: '정보 없음', isActive: false };

    const parkingLocation = facilities.parking_location as string | undefined;
    const parkingFee = facilities.parking_fee as string | undefined;

    // parking이 boolean인 경우
    if (typeof facilities.parking === 'boolean') {
      if (facilities.parking) {
        const isFree = parkingFee === '무료' || parkingFee === '0' || !parkingFee;

        return {
          value: isFree ? '무료' : '유료',
          fee: !isFree ? parkingFee : undefined,
          location: parkingLocation,
          isActive: true
        };
      }
      return { value: '불가', isActive: false };
    }

    // parking이 string인 경우 (legacy)
    if (facilities.parking === 'free') return { value: '무료', location: parkingLocation, isActive: true };
    if (facilities.parking === 'paid') return { value: '유료', fee: parkingFee, location: parkingLocation, isActive: true };
    if (facilities.parking === 'impossible') return { value: '불가', isActive: false };

    return { value: '불가', isActive: false };
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
    const courtSizeType = facilities?.court_size_type as CourtSizeValue | undefined;
    if (courtSizeType && COURT_SIZE_LABELS[courtSizeType]) {
      return COURT_SIZE_LABELS[courtSizeType].label;
    }
    return '정규 사이즈';
  };

  // 공 제공 정보 처리
  const getBallInfo = () => {
    if (!facilities || facilities.ball === undefined) return null;
    const ballValue: BallValue = facilities.ball ? 'PROVIDED' : 'NOT_PROVIDED';
    return {
      value: BALL_LABELS[ballValue],
      isActive: !!facilities.ball
    };
  };

  const parkingInfo = getParkingInfo();
  const showerInfo = getShowerInfo();
  const ballInfo = getBallInfo();

  // 냉난방 정보
  const hasAirConditioner = facilities?.air_conditioner;

  // 정수기 정보
  const hasWaterPurifier = facilities?.water_purifier;

  // 주차 위치 정보가 있는지 확인
  const hasParkingDetails = parkingInfo.location || parkingInfo.fee;

  return (
    <div id={id} className="bg-white px-5 py-6 mb-2 scroll-mt-20">
      <h3 className="text-lg font-bold text-slate-900 mb-4">시설 정보</h3>

      <div className="divide-y divide-slate-100">
        {/* 1. 주차 - 항상 표시 */}
        {hasParkingDetails ? (
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="parking" className="border-none">
              <AccordionTrigger className="py-3 hover:no-underline">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-3">
                    <Car className={cn("w-5 h-5", parkingInfo.isActive ? "text-slate-600" : "text-slate-400")} />
                    <span className="text-sm text-slate-600">주차</span>
                  </div>
                  <span className={cn("text-sm font-medium", parkingInfo.isActive ? "text-slate-900" : "text-slate-400")}>
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

        {/* 2. 샤워실 - 항상 표시 */}
        <FacilityRow
          icon={<Droplets className="w-5 h-5" />}
          label="샤워실"
          value={showerInfo.value}
          isActive={showerInfo.isActive}
        />

        {/* 3. 코트 사이즈 - 항상 표시 */}
        <FacilityRow
          icon={<BoxSelect className="w-5 h-5" />}
          label="코트 사이즈"
          value={getCourtSizeInfo()}
          isActive={true}
        />

        {/* 4. 정수기 - 값 있을 때만 표시 */}
        {hasWaterPurifier !== undefined && (
          <FacilityRow
            icon={<Droplet className="w-5 h-5" />}
            label="정수기"
            value={hasWaterPurifier ? '이용 가능' : '없음'}
            isActive={!!hasWaterPurifier}
          />
        )}

        {/* 5. 공 - 값 있을 때만 표시 */}
        {ballInfo && (
          <FacilityRow
            icon={<CircleDot className="w-5 h-5" />}
            label="공"
            value={ballInfo.value}
            isActive={ballInfo.isActive}
          />
        )}

        {/* 6. 냉난방 - 값 있을 때만 표시 */}
        {hasAirConditioner !== undefined && (
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
        <div className={cn(isActive ? "text-slate-600" : "text-slate-400")}>
          {icon}
        </div>
        <span className="text-sm text-slate-600">{label}</span>
      </div>
      <span className={cn("text-sm font-medium", isActive ? "text-slate-900" : "text-slate-400")}>
        {value}
      </span>
    </div>
  );
}
