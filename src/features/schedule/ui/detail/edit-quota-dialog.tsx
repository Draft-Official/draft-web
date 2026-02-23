'use client';

import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/shadcn/button';
import { Checkbox } from '@/shared/ui/shadcn/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/ui/shadcn/dialog';
import { toast } from '@/shared/ui/shadcn/sonner';
import type { HostMatchDetailDTO, RecruitmentMode } from '../../model/types';
import type { RecruitmentSetup } from '@/shared/types/database.types';

interface EditQuotaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: HostMatchDetailDTO;
  onSave: (setup: RecruitmentSetup) => void;
}

function getQuotaMax(match: HostMatchDetailDTO, position: string): number {
  return match.positionQuotas?.find(q => q.position === position)?.max ?? 0;
}

export function EditQuotaDialog({
  open,
  onOpenChange,
  match,
  onSave,
}: EditQuotaDialogProps) {
  const [editMode, setEditMode] = useState<RecruitmentMode>('position');
  const [isFlexBigman, setIsFlexBigman] = useState(false);
  const [editPositions, setEditPositions] = useState({
    guard: 0,
    forward: 0,
    center: 0,
    bigman: 0,
    total: 0,
  });

  useEffect(() => {
    if (!open) return;
    setEditMode(match.recruitmentMode);

    if (match.recruitmentMode === 'total') {
      setIsFlexBigman(false);
      setEditPositions({
        guard: 0, forward: 0, center: 0, bigman: 0,
        total: match.totalQuota?.max ?? 0,
      });
    } else {
      const hasBigman = match.positionQuotas?.some(q => q.position === 'B');
      setIsFlexBigman(!!hasBigman);
      setEditPositions({
        guard: getQuotaMax(match, 'G'),
        forward: getQuotaMax(match, 'F'),
        center: getQuotaMax(match, 'C'),
        bigman: getQuotaMax(match, 'B'),
        total: 0,
      });
    }
  }, [open, match]);

  const updatePosition = (
    pos: 'guard' | 'forward' | 'center' | 'bigman' | 'total',
    delta: number
  ) => {
    setEditPositions((prev) => ({
      ...prev,
      [pos]: Math.max(pos === 'total' ? 1 : 0, prev[pos] + delta),
    }));
  };

  const getCurrentCount = (positionCode: string): number => {
    if (match.positionQuotas) {
      const quota = match.positionQuotas.find(q => q.position === positionCode);
      return quota?.current || 0;
    }
    return 0;
  };

  const handleSave = () => {
    // 포지션별 모드에서 전체 합계가 0이면 저장 불가
    if (editMode === 'position') {
      const total = isFlexBigman
        ? editPositions.guard + editPositions.bigman
        : editPositions.guard + editPositions.forward + editPositions.center;
      if (total === 0) {
        toast.error('최소 1명 이상 설정해야 합니다.');
        return;
      }
    }

    const modeChanged = (editMode === 'total' && match.recruitmentMode === 'position') ||
                        (editMode === 'position' && match.recruitmentMode === 'total');

    if (modeChanged) {
      toast.warning('모집 모드가 변경되어 현재 인원이 초기화됩니다.');
    }

    const recruitmentSetup: RecruitmentSetup =
      editMode === 'total'
        ? {
            type: 'ANY',
            max_count: editPositions.total,
            current_count: modeChanged ? 0 : (match.totalQuota?.current || 0),
          }
        : {
            type: 'POSITION',
            positions: isFlexBigman
              ? {
                  G: { max: editPositions.guard, current: modeChanged ? 0 : getCurrentCount('G') },
                  B: { max: editPositions.bigman, current: modeChanged ? 0 : getCurrentCount('B') },
                }
              : {
                  G: { max: editPositions.guard, current: modeChanged ? 0 : getCurrentCount('G') },
                  F: { max: editPositions.forward, current: modeChanged ? 0 : getCurrentCount('F') },
                  C: { max: editPositions.center, current: modeChanged ? 0 : getCurrentCount('C') },
                },
          };

    onSave(recruitmentSetup);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="base" className="rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle>모집 인원 수정</DialogTitle>
          <DialogDescription>경기의 모집 인원을 수정할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 모드 토글 */}
          <div className="flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <button
              onClick={() => setEditMode('total')}
              className={cn(
                'text-sm font-medium transition-colors',
                editMode === 'total' ? 'text-slate-900' : 'text-slate-400'
              )}
            >
              포지션 무관
            </button>
            <div
              className="relative w-12 h-6 bg-slate-200 rounded-full cursor-pointer"
              onClick={() => setEditMode(editMode === 'total' ? 'position' : 'total')}
            >
              <div
                className={cn(
                  'absolute top-1 w-4 h-4 bg-slate-900 rounded-full transition-transform',
                  editMode === 'position' ? 'translate-x-7' : 'translate-x-1'
                )}
              />
            </div>
            <button
              onClick={() => setEditMode('position')}
              className={cn(
                'text-sm font-medium transition-colors',
                editMode === 'position' ? 'text-slate-900' : 'text-slate-400'
              )}
            >
              포지션별
            </button>
          </div>

          {/* 포지션별 모드 */}
          {editMode === 'position' && (
            <div className="space-y-4">
              <div className="flex items-center justify-end space-x-2">
                <Checkbox
                  id="flex-bigman"
                  checked={isFlexBigman}
                  onCheckedChange={(c) => setIsFlexBigman(!!c)}
                />
                <label
                  htmlFor="flex-bigman"
                  className="text-sm font-medium text-slate-600"
                >
                  빅맨 통합 (F/C)
                </label>
              </div>

              <div className="space-y-3">
                {/* 가드 */}
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">가드 (G)</span>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updatePosition('guard', -1)}
                      className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="w-4 text-center font-bold text-lg">
                      {editPositions.guard}
                    </span>
                    <button
                      type="button"
                      onClick={() => updatePosition('guard', 1)}
                      className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {isFlexBigman ? (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700">빅맨 (F/C)</span>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => updatePosition('bigman', -1)}
                        className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-4 h-4 text-slate-600" />
                      </button>
                      <span className="w-4 text-center font-bold text-lg">
                        {editPositions.bigman}
                      </span>
                      <button
                        type="button"
                        onClick={() => updatePosition('bigman', 1)}
                        className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700">포워드 (F)</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updatePosition('forward', -1)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                        >
                          <Minus className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="w-4 text-center font-bold text-lg">
                          {editPositions.forward}
                        </span>
                        <button
                          type="button"
                          onClick={() => updatePosition('forward', 1)}
                          className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="font-bold text-slate-700">센터 (C)</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updatePosition('center', -1)}
                          className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                        >
                          <Minus className="w-4 h-4 text-slate-600" />
                        </button>
                        <span className="w-4 text-center font-bold text-lg">
                          {editPositions.center}
                        </span>
                        <button
                          type="button"
                          onClick={() => updatePosition('center', 1)}
                          className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 전체 모드 */}
          {editMode === 'total' && (
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700">전체 인원</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updatePosition('total', -1)}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                >
                  <Minus className="w-4 h-4 text-slate-600" />
                </button>
                <span className="w-12 text-center font-bold text-lg">
                  {editPositions.total}명
                </span>
                <button
                  type="button"
                  onClick={() => updatePosition('total', 1)}
                  className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-xl font-bold"
          >
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
