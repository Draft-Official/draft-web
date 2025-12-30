'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users } from 'lucide-react';

type ApplicationStatus = 'pending_payment' | 'verification_pending' | 'confirmed' | 'cancelled' | 'noshow';

type MyApplication = {
    id: string;
    matchTitle: string;
    matchDate: string;
    description: string;
    location: string;
    status: ApplicationStatus;
};

// Mock Data for Guest (Participated)
const initialApplications: MyApplication[] = [
    { id: '1', matchTitle: '강남구민회관 농구', matchDate: '1월 24일 19:00', location: '서울시 강남구', description: '가드 모집', status: 'pending_payment' },
    { id: '2', matchTitle: '반포 종합운동장', matchDate: '1월 28일 20:00', location: '서울시 서초구', description: '센터 모집', status: 'confirmed' },
];

// Mock Data for Host (Created)
const initialHostedMatches = [
    { id: 'h1', title: '금요일 야간 농구', date: '1월 30일 20:00', location: '잠실 실내체육관', currentPlayers: 3, maxPlayers: 10 },
];

export default function MyMatchesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('guest');
    const [applications, setApplications] = useState<MyApplication[]>(initialApplications);
    const [hostedMatches, setHostedMatches] = useState(initialHostedMatches);

    const getStatusBadge = (status: ApplicationStatus) => {
        switch (status) {
            case 'pending_payment': return <Badge variant="outline" className="text-orange-500 border-orange-200 bg-orange-50">입금 대기</Badge>;
            case 'verification_pending': return <Badge variant="secondary" className="bg-blue-100 text-blue-700">확인중</Badge>;
            case 'confirmed': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">참가 확정</Badge>;
            case 'cancelled': return <Badge variant="outline" className="text-muted-foreground">취소됨</Badge>;
            case 'noshow': return <Badge variant="destructive">노쇼</Badge>;
            default: return null;
        }
    };

    return (
        <div className="bg-background min-h-full pb-24">
            <div className="p-4 bg-white border-b border-border sticky top-14 z-40">
                <h1 className="text-xl font-bold text-foreground mb-4">내 경기</h1>
                <Tabs defaultValue="guest" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="guest">참여 내역</TabsTrigger>
                        <TabsTrigger value="host">운영 내역</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="p-4 space-y-4">
                {activeTab === 'guest' && (
                    <div className="space-y-3">
                        {applications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <p className="text-muted-foreground text-sm">참여한 경기가 없습니다.</p>
                                <Button onClick={() => router.push('/')}>경기 둘러보기</Button>
                            </div>
                        ) : applications.map(app => (
                            <Card key={app.id} className="p-4 border-border shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-base">{app.matchTitle}</h3>
                                    {getStatusBadge(app.status)}
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{app.matchDate}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{app.location}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {activeTab === 'host' && (
                    <div className="space-y-3">
                         {hostedMatches.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                <p className="text-muted-foreground text-sm">운영 중인 경기가 없습니다.</p>
                                <Button onClick={() => router.push('/match/create')}>경기 개설하기</Button>
                            </div>
                        ) : hostedMatches.map(match => (
                            <Card 
                                key={match.id} 
                                className="p-4 border-border shadow-sm active:scale-[0.98] transition-transform cursor-pointer hover:bg-slate-50"
                                onClick={() => router.push('/')} // Ideally to a host dashboard like /match/manage/[id]
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-base">{match.title}</h3>
                                    <Badge variant="secondary">모집중</Badge>
                                </div>
                                <div className="space-y-1 text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{match.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>{match.location}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span>{match.currentPlayers}/{match.maxPlayers}명 신청</span>
                                    </div>
                                    <span className="text-xs text-primary font-bold">관리하기 &rarr;</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
