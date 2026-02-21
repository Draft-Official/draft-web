'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { X, Building2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { Label } from '@/shared/ui/shadcn/label';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { DateStrip, type DateOption } from '@/shared/ui/composite/date-strip';
import { TimePickerSelect } from '@/shared/ui/composite/time-picker-select';
import { LocationCard } from '@/shared/ui/composite/location-card';
import { useCreateTeamMatch } from '@/features/team/api/match/mutations';
import { useAuth } from '@/shared/session';
import { toast } from '@/shared/ui/shadcn/sonner';
import type { Team } from '@/features/team/model/types';
import type { RegularDayValue } from '@/shared/config/team-constants';
import type { LocationData } from '@/shared/types/location.types';

interface TeamMatchCreateFormProps {
  team: Team & { homeGymName: string | null };
  onClose?: () => void;
}

// 요일 매핑 (JS Date.getDay() -> RegularDayValue)
const DAY_MAP: Record<number, RegularDayValue> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

// 요일 표시용 한글
const DAY_LABELS: Record<string, string> = {
  SUN: '일',
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
};

/**
 * 2주 내 날짜 목록 생성
 */
function getNext14Days(): DateOption[] {
  const dates: DateOption[] = [];
  const today = new Date();

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayValue = DAY_MAP[d.getDay()];

    dates.push({
      dateISO: d.toISOString().split('T')[0],
      label: `${d.getMonth() + 1}.${d.getDate()} (${DAY_LABELS[dayValue]})`,
      dayNum: d.getDate(),
      dayStr: DAY_LABELS[dayValue],
    });
  }
  return dates;
}

/**
 * 정기운동일에 가장 가까운 날짜 찾기
 */
function findNextRegularDay(regularDay: RegularDayValue | null, dates: DateOption[]): string {
  if (!regularDay) return dates[0]?.dateISO || '';

  for (const date of dates) {
    const d = new Date(date.dateISO);
    if (DAY_MAP[d.getDay()] === regularDay) {
      return date.dateISO;
    }
  }
  return dates[0]?.dateISO || '';
}

/**
 * 시간을 HH:MM 형식으로 정규화 (초 제거)
 */
function normalizeTime(time: string): string {
  const parts = time.split(':');
  const hours = (parts[0] || '00').padStart(2, '0');
  const minutes = (parts[1] || '00').padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 종료 시간 계산
 */
function calculateEndTime(startTime: string, duration: string): string {
  const normalized = normalizeTime(startTime);
  const [startHour, startMin] = normalized.split(':').map(Number);
  const durationHours = parseFloat(duration);
  const totalMinutes = startHour * 60 + startMin + durationHours * 60;
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMin = totalMinutes % 60;
  return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
}

/**
 * 시작/종료 시간으로 duration 계산
 */
function calculateDuration(startTime: string, endTime: string): string {
  const normStart = normalizeTime(startTime);
  const normEnd = normalizeTime(endTime);
  const [startHour, startMin] = normStart.split(':').map(Number);
  const [endHour, endMin] = normEnd.split(':').map(Number);
  const startTotal = startHour * 60 + startMin;
  let endTotal = endHour * 60 + endMin;
  if (endTotal < startTotal) endTotal += 24 * 60; // 다음날로 넘어가는 경우
  const diff = (endTotal - startTotal) / 60;
  return String(diff);
}

const DURATION_OPTIONS = [
  { label: '1시간', value: '1' },
  { label: '1시간 30분', value: '1.5' },
  { label: '2시간', value: '2' },
  { label: '2시간 30분', value: '2.5' },
  { label: '3시간', value: '3' },
  { label: '3시간 30분', value: '3.5' },
  { label: '4시간', value: '4' },
];

export function TeamMatchCreateForm({ team, onClose }: TeamMatchCreateFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  // 2주 내 날짜 목록
  const calendarDates = useMemo(() => getNext14Days(), []);

  // 정기운동일에 가장 가까운 날짜 자동 선택
  const initialDate = useMemo(
    () => findNextRegularDay(team.regularDay, calendarDates),
    [team.regularDay, calendarDates]
  );

  // 팀의 기본 시간 사용
  const defaultStartTime = team.regularStartTime || '19:00';
  const defaultEndTime = team.regularEndTime || '21:00';
  const defaultDuration = calculateDuration(defaultStartTime, defaultEndTime);

  // State
  const [selectedDate, setSelectedDate] = useState<string | null>(initialDate);
  const [startTime, setStartTime] = useState(defaultStartTime);
  const [duration, setDuration] = useState(defaultDuration);
  const [notice, setNotice] = useState('');

  // Mutation
  const { mutate: createMatch, isPending } = useCreateTeamMatch();

  // 종료 시간 계산
  const endTime = calculateEndTime(startTime, duration);

  // 장소 데이터 (LocationData 형식으로 변환)
  const locationData: LocationData | null = team.homeGymName
    ? {
        buildingName: team.homeGymName,
        address: '', // 주소 정보가 없으므로 빈 문자열
      }
    : null;

  const handleSubmit = () => {
    if (!selectedDate) {
      toast.error('날짜를 선택해주세요.');
      return;
    }

    if (!team.homeGymId) {
      toast.error('팀 홈구장이 설정되어 있지 않습니다. 팀 설정에서 홈구장을 추가해주세요.');
      return;
    }

    if (!user?.id) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    // ISO 시간 생성 (로컬 시간 기준, HH:MM:00 형식 보장)
    const startDateTime = `${selectedDate}T${normalizeTime(startTime)}:00`;
    const endDateTime = `${selectedDate}T${normalizeTime(endTime)}:00`;

    createMatch(
      {
        hostId: user.id,
        input: {
          teamId: team.id,
          startTime: startDateTime,
          endTime: endDateTime,
          gymId: team.homeGymId,
        },
      },
      {
        onSuccess: (data) => {
          toast.success('팀 운동이 생성되었습니다.');
          router.push(`/team/${team.code}/matches/${data.id}`);
        },
        onError: (error) => {
          toast.error('생성에 실패했습니다: ' + error.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white px-4 h-14 flex items-center justify-between border-b border-slate-100 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (onClose ? onClose() : router.back())}
            className="-ml-2 p-2 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="font-bold text-lg text-slate-900">팀 운동 개설</h1>
        </div>
      </header>

      <div className="px-3 pt-3 pb-[120px] space-y-2">
        {/* 기본 정보 섹션 */}
        <section className="bg-white px-5 py-6 space-y-6 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            기본 정보
          </h2>

          {/* 날짜 선택 */}
          <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
              경기 날짜
              {selectedDate && (() => {
                const [, m, d] = selectedDate.split('-');
                const normalizedStartTime = normalizeTime(startTime);
                const normalizedEndTime = normalizeTime(endTime);
                return (
                  <span className="text-primary">
                    {parseInt(m)}월 {parseInt(d)}일 {normalizedStartTime} ~ {normalizedEndTime}
                  </span>
                );
              })()}
              <span className="text-slate-400 text-xs font-normal ml-auto">
                (2주 이내)
              </span>
            </Label>
            <DateStrip
              dates={calendarDates}
              selectedDate={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              showAllOption={false}
              className="-mx-(--dimension-spacing-x-global-gutter)"
              listClassName="px-(--dimension-spacing-x-global-gutter)"
            />
          </div>

          {/* 시간 선택 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-600">시작 시간</Label>
              <TimePickerSelect
                value={startTime}
                onValueChange={setStartTime}
                defaultValue={defaultStartTime}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-600">진행 시간</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="h-12 bg-white border-slate-200 font-bold">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 장소 */}
          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-900">장소</Label>
            {locationData ? (
              <LocationCard
                location={locationData}
                isExistingGym={true}
                onClear={() => {
                  toast.error('팀 홈구장은 팀 설정에서 변경할 수 있습니다.');
                }}
              />
            ) : (
              <div className="p-4 bg-brand-weak/30 border border-brand-stroke-weak rounded-xl">
                <p className="text-sm text-brand-contrast font-medium">
                  홈구장이 설정되지 않았습니다.
                </p>
                <p className="text-xs text-brand mt-1">
                  팀 설정에서 홈구장을 먼저 설정해주세요.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* 공지 섹션 */}
        <section className="bg-white px-5 py-6 space-y-4 rounded-xl border border-slate-200">
          <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-slate-400" />
            공지 (선택)
          </h2>

          <Textarea
            placeholder="팀원들에게 전달할 공지사항을 작성해주세요."
            value={notice}
            onChange={(e) => setNotice(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </section>

        {/* 생성 버튼 */}
        <div className="bg-white px-5 pt-6 pb-4 rounded-xl border border-slate-200">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !team.homeGymId}
            className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-draft-100 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              '팀 운동 생성하기'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
