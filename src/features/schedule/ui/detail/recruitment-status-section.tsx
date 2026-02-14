'use client';

import { Users } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import type { HostMatchDetailDTO } from '../../model/types';

interface RecruitmentStatusSectionProps {
  match: HostMatchDetailDTO;
  confirmedCountByPosition: Record<string, number>;
  totalConfirmedCount: number;
  isEnded: boolean;
  onEditClick: () => void;
}

export function RecruitmentStatusSection({
  match,
  confirmedCountByPosition,
  totalConfirmedCount,
  isEnded,
  onEditClick,
}: RecruitmentStatusSectionProps) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-lg text-slate-900">모집 현황</h2>
        </div>
        {!isEnded && (
          <button
            onClick={onEditClick}
            className="text-primary font-medium text-sm hover:underline"
          >
            수정
          </button>
        )}
      </div>

      {/* 포지션별 모집 */}
      {match.recruitmentMode === 'position' && match.positionQuotas && (
        <div className="space-y-3">
          {match.positionQuotas.map((quota, index) => {
            const currentCount = confirmedCountByPosition[quota.position] || 0;
            const isOverQuota = currentCount > quota.max;
            const progressPercent = Math.min((currentCount / quota.max) * 100, 100);

            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {quota.label} ({quota.position})
                  </span>
                  <span
                    className={cn(
                      'font-bold',
                      isOverQuota ? 'text-primary' : 'text-slate-900'
                    )}
                  >
                    {currentCount}/{quota.max}
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all bg-primary"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 전체 모집 */}
      {match.recruitmentMode === 'total' && match.totalQuota && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">포지션 무관</span>
            <span
              className={cn(
                'font-bold',
                totalConfirmedCount > match.totalQuota.max
                  ? 'text-primary'
                  : 'text-slate-900'
              )}
            >
              {totalConfirmedCount}/{match.totalQuota.max}명
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-primary"
              style={{
                width: `${Math.min(
                  (totalConfirmedCount / match.totalQuota.max) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
