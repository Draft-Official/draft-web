'use client';

import React from 'react';
import { GuestMatchDetailDTO } from '@/features/match/model/types';
import { Trophy, User, Swords, Calendar } from 'lucide-react';
import { GENDER_LABELS, MATCH_FORMAT_LABELS, GenderValue } from '@/shared/config/match-constants';
import { getLevelLabel, SKILL_LEVELS } from '@/shared/config/skill-constants';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/shared/ui/shadcn/accordion';

interface MatchInfoSectionProps {
  match: GuestMatchDetailDTO;
}

export function MatchInfoSection({ match }: MatchInfoSectionProps) {
  // 레벨 표시: 숫자면 변환, 아니면 그대로 사용
  const levelDisplay = match.level
    ? /^\d+$/.test(match.level)
      ? getLevelLabel(match.level)
      : match.level
    : '무관';

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
            <div className="text-xs font-normal text-slate-500 mb-0.5">매치 타입</div>
            <div className="text-sm font-medium text-slate-900">{MATCH_FORMAT_LABELS[match.matchFormat] || match.matchFormat}</div>
          </div>
        </div>

        {/* Gender (2nd) */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-normal text-slate-500 mb-0.5">성별</div>
            <div className="text-sm font-medium text-slate-900">
              {GENDER_LABELS[match.gender as GenderValue] || match.gender}
            </div>
          </div>
        </div>

        {/* Level (3rd) - Accordion */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--color-bg-brand-weak)] flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-normal text-slate-500 mb-0.5">레벨</div>
            {match.levelMin && match.levelMax ? (
              <Accordion type="single" collapsible className="w-full -mt-0.5">
                <AccordionItem value="level" className="border-0">
                  <AccordionTrigger className="py-0 hover:no-underline justify-start gap-1">
                    <span className="text-sm font-medium text-slate-900">{levelDisplay}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 pb-0">
                    <div className="space-y-3">
                      {/* Min Level */}
                      <div className="border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-400">최소</span>
                          <span className="text-sm font-medium text-slate-900">
                            {SKILL_LEVELS.find(l => l.level === match.levelMin)?.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {SKILL_LEVELS.find(l => l.level === match.levelMin)?.description}
                        </p>
                      </div>
                      {/* Max Level */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-400">최대</span>
                          <span className="text-sm font-medium text-slate-900">
                            {SKILL_LEVELS.find(l => l.level === match.levelMax)?.name}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {SKILL_LEVELS.find(l => l.level === match.levelMax)?.description}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <div className="text-sm font-medium text-slate-900">{levelDisplay}</div>
            )}
          </div>
        </div>

        {/* Age (4th) */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <div className="text-xs font-normal text-slate-500 mb-0.5">나이</div>
            <div className="text-sm font-medium text-slate-900">{match.ageRange || '무관'}</div>
          </div>
        </div>

      </div>
    </section>
  );
}
