'use client';

import React from 'react';
import { GuestMatchDetailDTO } from '@/features/match/model/types';
import { PLAY_STYLE_LABELS, REFEREE_TYPE_LABELS } from '@/shared/config/match-constants';

interface MatchRuleSectionProps {
  match: GuestMatchDetailDTO;
}

export function MatchRuleSection({ match }: MatchRuleSectionProps) {
  const { rule } = match;

  // rule이 없거나 모든 필드가 비어있으면 섹션 숨김
  if (!rule) return null;

  // 유효한 필드가 하나라도 있는지 확인
  const hasPlayStyle = !!rule.type;
  const hasQuarterRule = rule.quarterTime > 0 || rule.quarterCount > 0;
  const hasReferee = !!rule.referee;

  // 모든 필드가 비어있으면 숨김
  if (!hasPlayStyle && !hasQuarterRule && !hasReferee) {
    return null;
  }

  // Use constants LABELS for SSOT
  const typeLabel = PLAY_STYLE_LABELS[rule.type] || rule.type;
  const refereeLabel = REFEREE_TYPE_LABELS[rule.referee] || rule.referee;

  return (
    <section className="px-5 py-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">경기 진행 방식</h3>

      <div className="bg-slate-50 rounded-xl p-5 space-y-3">
        {/* 1. 경기 형태 - 값이 있을 때만 */}
        {hasPlayStyle && (
          <div className="flex items-start text-sm">
              <span className="text-slate-500 font-medium w-24 shrink-0">경기 형태</span>
              <span className="text-slate-900 font-bold">{typeLabel}</span>
          </div>
        )}

        {/* 2. 쿼터 진행 방식 - 값이 있을 때만 */}
        {hasQuarterRule && (
          <div className="flex items-start text-sm">
              <span className="text-slate-500 font-medium w-24 shrink-0">쿼터 진행 방식</span>
              <span className="text-slate-900 font-bold">
                  {rule.quarterTime}분 · {rule.quarterCount}쿼터
                  {rule.fullGames && rule.fullGames > 0 && ` · ${rule.fullGames}경기`}
              </span>
          </div>
        )}

        {/* 3. 심판 방식 - 값이 있을 때만 */}
        {hasReferee && (
          <div className="flex items-start text-sm">
              <span className="text-slate-500 font-medium w-24 shrink-0">심판 방식</span>
              <span className="text-slate-900 font-bold">{refereeLabel}</span>
          </div>
        )}
      </div>
    </section>
  );
}
