'use client';

import React from 'react';
import { Match } from '@/features/match/model/types';

interface MatchRuleSectionProps {
  match: Match;
}

export function MatchRuleSection({ match }: MatchRuleSectionProps) {
  const { rule } = match;

  // rule이 없거나 모든 필드가 비어있으면 섹션 숨김
  if (!rule) return null;

  // 유효한 필드가 하나라도 있는지 확인
  const hasPlayStyle = !!rule.type;
  const hasQuarterRule = rule.quarterTime > 0 || rule.quarterCount > 0;
  const hasGuaranteedQuarters = rule.guaranteedQuarters > 0;
  const hasReferee = !!rule.referee;

  // 모든 필드가 비어있으면 숨김
  if (!hasPlayStyle && !hasQuarterRule && !hasGuaranteedQuarters && !hasReferee) {
    return null;
  }

  const typeLabel = {
      '2team': '자체전 (2파전)',
      '3team': '자체전 (3파전)',
      'lesson': '연습/레슨',
      'exchange': '팀 교류전'
  }[rule.type] || rule.type;

  const refereeLabel = {
      'self': '자체콜',
      'guest': '게스트/팀원',
      'pro': '전문 심판'
  }[rule.referee] || rule.referee;

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

        {/* 3. 보장 쿼터 - 0보다 클 때만 */}
        {hasGuaranteedQuarters && (
          <div className="flex items-start text-sm">
              <span className="text-slate-500 font-medium w-24 shrink-0">보장 쿼터</span>
              <span className="text-slate-900 font-bold">{rule.guaranteedQuarters}쿼터</span>
          </div>
        )}

        {/* 4. 심판 방식 - 값이 있을 때만 */}
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
