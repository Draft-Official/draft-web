'use client';

import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, ArrowDown } from 'lucide-react';
import { RecruitFAB } from '@/components/ui/recruit-fab';
import { FilterBar } from '@/features/match/ui/filter-bar';
import { getNext14Days } from '@/features/match/ui/date-strip';
import { MatchListItem, MatchListItemProps } from '@/features/match/ui/match-list-item';

// --- Mock Data ---
const TODAY = new Date();
const formatDateISO = (offset: number) => {
    const d = new Date(TODAY);
    d.setDate(TODAY.getDate() + offset);
    return d.toISOString().split('T')[0];
};

// Define Match Data Type
type MatchData = Omit<MatchListItemProps, 'id'> & { id: number };

const MATCHES: MatchData[] = [
  {
    id: 1,
    dateISO: formatDateISO(2), 
    time: '19:00',
    dDay: 'D-2',
    price: '10,000원',
    title: '강남구민회관 체육관',
    location: '서울시 강남구 (주차가능)',
    positions: {
      g: { status: 'closed', count: 2, max: 2 }, // Closed (2/2)
      f: { status: 'open', count: 1, max: 2 }, // 1/2
      c: { status: 'urgent', count: 0, max: 1 }, // 0/1 (Urgent)
    }
  },
  {
    id: 2,
    dateISO: formatDateISO(0), 
    time: '20:00',
    dDay: '오늘',
    price: '15,000원',
    title: '반포종합운동장',
    location: '서울 서초구 • 샤워가능',
    positions: {
      all: { status: 'closed', count: 0, label: '전체 마감임박' } 
    },
    isClosed: true 
  },
  {
    id: 3,
    dateISO: formatDateISO(1), 
    time: '19:30',
    dDay: '내일',
    price: '12,000원',
    title: '잠실 실내체육관',
    location: '서울 송파구',
    positions: {
      f: { status: 'open', count: 2, max: 3 },
      c: { status: 'open', count: 1, max: 1 },
    }
  },
  {
    id: 4,
    dateISO: formatDateISO(3),
    time: '14:00',
    dDay: 'D-3',
    price: '10,000원',
    title: '마포구민체육센터',
    location: '서울 마포구 망원동',
    positions: {
        g: { status: 'open', count: 1, max: 2 },
        f: { status: 'open', count: 1, max: 2 },
        c: { status: 'open', count: 1, max: 1 },
    }
  },
  {
      id: 5,
      dateISO: formatDateISO(3), 
      time: '16:00',
      dDay: 'D-3',
      price: '11,000원',
      title: '망원 유수지 체육공원',
      location: '서울 마포구',
      positions: {
          all: { status: 'open', count: 3 }
      }
  },
  {
      id: 6,
      dateISO: formatDateISO(7),
      time: '19:00',
      dDay: 'D-7',
      price: '5,000원',
      title: '도봉산 실내 농구장',
      location: '서울 도봉구',
      positions: {
           f: { status: 'urgent', count: 1, max: 2 }
      }
  }
];

export default function Home() {
    // State
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
    const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);

    // Generate Dates
    const calendarDates = useMemo(() => getNext14Days(), []);

    // Helper: Day Label (e.g., 1월 24일 (금))
    const getDayLabel = (iso: string) => {
        const found = calendarDates.find(d => d.dateISO === iso);
        return found ? found.label : iso;
    };

    // Filter & Group Matches
    const filteredAndGroupedMatches = useMemo(() => {
        // 1. Filter
        let filtered = MATCHES.filter(m => {
            // Date Filter
            if (selectedDateISO && m.dateISO !== selectedDateISO) return false;
            
            // Position Filter (AND Logic)
            // If multiple positions are selected (e.g. ['가드', '포워드']),
            // the match must have OPEN slots for ALL of them.
            if (selectedPositions.length > 0) {
                 // Exception: If match has 'all' (Any Position) tag that is open, show it regardless? 
                 // Based on requirements: "'포지션 무관' 태그가 있는 경기는 필터와 상관없이 항상 노출."
                 if (m.positions.all && m.positions.all.status !== 'closed') return true;

                 // Check each selected position
                 const meetsAllConditions = selectedPositions.every(pos => {
                     if (pos === '가드') return m.positions.g && m.positions.g.status !== 'closed';
                     if (pos === '포워드') return m.positions.f && m.positions.f.status !== 'closed';
                     if (pos === '센터') return m.positions.c && m.positions.c.status !== 'closed';
                     return false;
                 });
                 
                 if (!meetsAllConditions) return false;
            }
            return true;
        });

        // 2. Sort by Date & Time
        filtered.sort((a, b) => {
            if (a.dateISO !== b.dateISO) return a.dateISO.localeCompare(b.dateISO);
            return a.time.localeCompare(b.time);
        });

        // 3. Group by Date
        const groups: Record<string, typeof MATCHES> = {};
        filtered.forEach(match => {
            if (!groups[match.dateISO]) groups[match.dateISO] = [];
            groups[match.dateISO].push(match);
        });

        return groups;
    }, [selectedDateISO, selectedPositions]);


    return (
        <div className="min-h-screen bg-slate-50 relative pb-20">
            {/* Advanced Filter Bar (Sticky Top) */}
            <FilterBar 
                selectedDateISO={selectedDateISO}
                onDateSelect={setSelectedDateISO}
                selectedPositions={selectedPositions}
                onPositionsChange={setSelectedPositions}
            />

            {/* List Content */}
            <main className="pb-32 min-h-[50vh]">
                 {Object.keys(filteredAndGroupedMatches).length === 0 ? (
                    // Empty State
                    <div className="flex flex-col items-center justify-center pt-20 px-6 text-center animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <CalendarIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">이 날은 경기가 없어요</h3>
                        <p className="text-slate-500 text-sm mb-8">
                            원하는 경기가 없다면<br/>직접 게스트를 모집해보는 건 어때요?
                        </p>
                        <div className="flex flex-col items-center gap-2 animate-bounce">
                            <span className="text-xs text-[#FF6600] font-bold">직접 모집하기</span>
                            <ArrowDown className="w-5 h-5 text-[#FF6600]" />
                        </div>
                    </div>
                 ) : (
                    // Grouped List
                    Object.entries(filteredAndGroupedMatches).map(([dateISO, groupMatches]) => (
                        <div key={dateISO} className="relative">
                            {/* Sticky Date Header for List Section */}
                            <div className="sticky top-[195px] z-10 bg-slate-50/95 backdrop-blur-sm py-2 px-4 border-b border-slate-100/50 shadow-sm transition-all duration-300">
                                <span className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    {getDayLabel(dateISO)}
                                </span>
                            </div>

                            <div className="p-4 space-y-3">
                                {groupMatches.map((match) => (
                                    <MatchListItem key={match.id} {...match} />
                                ))}
                            </div>
                        </div>
                    ))
                 )}
            </main>

            {/* Floating Action Button */}
            <RecruitFAB />
        </div>
    );
}