'use client';

import React from 'react';
import { Match } from '@/features/match/model/mock-data';
import { Trophy, User, Swords, Calendar, Shirt } from 'lucide-react';
import { getLevelLabel, getRequirementLabels } from '@/shared/config/match-constants';

interface MatchInfoSectionProps {
  match: Match;
}

export function MatchInfoSection({ match }: MatchInfoSectionProps) {
  // 레벨 표시: 숫자면 변환, 아니면 그대로 사용
  const levelDisplay = match.level
    ? /^\d+$/.test(match.level)
      ? getLevelLabel(match.level)
      : match.level
    : '무관';

  // 준비물 표시
  const requirementsDisplay = match.requirements?.length
    ? getRequirementLabels(match.requirements).join(' / ')
    : null;

  return (
    <section className="px-5 py-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">매치 조건</h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {/* Method (1st) */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <Swords className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 mb-0.5">매치 타입</div>
            <div className="text-[13px] font-bold text-slate-900">{match.gameFormat || '5vs5'}</div>
          </div>
        </div>

        {/* Gender (2nd) */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 mb-0.5">성별</div>
            <div className="text-[13px] font-bold text-slate-900">
              {match.gender === 'mixed' ? '성별 무관' : (match.gender === 'men' ? '남성' : '여성')}
            </div>
          </div>
        </div>

        {/* Level (3rd) */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-[#FF6600]" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 mb-0.5">레벨</div>
            <div className="text-[13px] font-bold text-slate-900">{levelDisplay}</div>
          </div>
        </div>

        {/* Age (4th) */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-400 mb-0.5">나이</div>
            <div className="text-[13px] font-bold text-slate-900">{match.ageRange || '무관'}</div>
          </div>
        </div>

        {/* Supplies (5th) - 준비물이 있을 때만 표시 */}
        {requirementsDisplay && (
          <div className="flex items-start gap-3 col-span-2">
              <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                  <Shirt className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                  <div className="text-xs font-bold text-slate-400 mb-0.5">준비물</div>
                  <div className="text-[13px] font-bold text-slate-900">
                      {requirementsDisplay}
                  </div>
              </div>
          </div>
        )}
      </div>
    </section>
  );
}
