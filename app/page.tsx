import Link from 'next/link';
import { MatchCard, MatchCardProps } from '@/components/match/match-card';
import { FilterBar } from '@/components/match/filter-bar';
import { RecruitFAB } from '@/components/ui/recruit-fab';

// Mock Data with New MatchCard Props and Logic
const matches: MatchCardProps[] = [
    {
        id: '1',
        dDay: 'D-2',
        date: '1월 24일 (금) 19:00',
        title: '강남구민회관 체육관',
        location: '서울시 강남구 (주차가능)',
        fee: '10,000원',
        badges: ['G(마감)', 'F(1)', 'C(급구)'],
        urgent: true
    },
    {
        id: '2',
        dDay: 'D-Today',
        date: '1월 22일 (수) 20:00',
        title: '반포종합운동장',
        location: '서울 서초구 • 샤워가능',
        fee: '15,000원',
        badges: ['전체 마감임박'],
        urgent: false
    },
    {
        id: '3',
        dDay: 'D-1',
        date: '1월 23일 (목) 19:30',
        title: '잠실 실내체육관 보조경기장',
        location: '서울 송파구',
        fee: '12,000원',
        badges: ['F(2)', 'C(1)'],
        urgent: false
    },
    {
        id: '4',
        dDay: 'D-3',
        date: '1월 25일 (토) 14:00',
        title: '광진구민체육센터',
        location: '서울 광진구 • 주차협소',
        fee: '10,000원',
        badges: ['무관 3명'],
        urgent: false
    },
    {
        id: '5',
        dDay: 'D-5',
        date: '1월 27일 (월) 21:00',
        title: '성동구민종합체육센터',
        location: '서울 성동구',
        fee: '8,000원',
        badges: ['가드/포워드'],
        urgent: false
    }
];

export default function Home() {
    return (
        <div className="min-h-full bg-background relative">
            {/* Advanced Filter Bar */}
            <FilterBar />

            {/* Content Feed */}
            <main className="p-4 space-y-4 pb-32"> {/* Increased padding bottom for FAB */}
                {matches.length > 0 ? (
                    matches.map((match) => (
                        <MatchCard key={match.id} {...match} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-2">
                             <span className="text-3xl">🏀</span>
                        </div>
                        <h3 className="font-bold text-lg text-foreground">
                            조건에 맞는 경기가 없어요.
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            필터를 변경하거나 직접 경기를 만들어보세요!
                        </p>
                    </div>
                )}
            </main>

            {/* Always Expanded FAB */}
            <RecruitFAB />
        </div>
    );
}