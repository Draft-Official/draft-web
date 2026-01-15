'use client';

import React from 'react';
import { Match } from '@/features/match/model/mock-data';
import { Car, Droplets, Thermometer, BoxSelect } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FacilitySectionProps {
  match: Match;
  id?: string;
}

export function FacilitySection({ match, id }: FacilitySectionProps) {
  const { facilities } = match;
  
  if (!facilities) return null;

  return (
    <div id={id} className="bg-white px-5 py-6 mb-2 scroll-mt-20">
      <h3 className="text-lg font-bold text-slate-900 mb-4">편의 시설 & 코트</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* Parking */}
        <FacilityCard 
            icon={<Car className="w-5 h-5" />}
            label="주차"
            value={facilities.parking === 'free' ? '무료 주차' : (facilities.parking === 'paid' ? '유료 주차' : '주차 불가')}
            isActive={facilities.parking !== 'impossible'}
        />
        {/* Shower (Mocked as boolean in interface for now) */}
        <FacilityCard 
            icon={<Droplets className="w-5 h-5" />}
            label="샤워실"
            value={facilities.shower ? '이용 가능' : '이용 불가'}
            isActive={!!facilities.shower}
        />
        {/* Court Type */}
        <FacilityCard 
            icon={<BoxSelect className="w-5 h-5" />}
            label="코트 종류"
            value={match.courtType === 'indoor' ? '실내 코트' : '야외 코트'}
            isActive={true}
        />
        {/* AC/Heat - Mock data doesn't have it explicitly yet, assume yes based on court type */}
        <FacilityCard 
            icon={<Thermometer className="w-5 h-5" />}
            label="냉난방"
            value={match.courtType === 'indoor' ? '가동 중' : '없음'}
            isActive={match.courtType === 'indoor'}
        />
      </div>
    </div>
  );
}

function FacilityCard({ icon, label, value, isActive }: { icon: React.ReactNode, label: string, value: string, isActive: boolean }) {
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
        </div>
    )
}
