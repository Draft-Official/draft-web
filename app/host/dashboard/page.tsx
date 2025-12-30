'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Applicant = {
    id: string;
    name: string;
    level: string;
    manner: number;
    position: string;
    status: 'pending' | 'approved_pending_payment' | 'verification_pending' | 'confirmed' | 'rejected';
    appliedAt: string;
};

const initialApplicants: Applicant[] = [
    { id: 'u1', name: '이승범', level: 'A', manner: 38.2, position: 'G', status: 'verification_pending', appliedAt: '10분 전' },
    { id: 'u2', name: '김철수', level: 'B+', manner: 36.5, position: 'C', status: 'approved_pending_payment', appliedAt: '30분 전' },
    { id: 'u3', name: '박민수', level: 'B', manner: 37.0, position: 'F', status: 'pending', appliedAt: '1시간 전' },
];

export default function HostDashboardPage() {
    const router = useRouter();
    const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);

    const handleConfirm = (id: string) => {
        setApplicants(prev => prev.map(app => 
            app.id === id ? { ...app, status: 'confirmed' } : app
        ));
    };

    const handleReject = (id: string) => {
        setApplicants(prev => prev.map(app => 
            app.id === id ? { ...app, status: 'rejected' } : app
        ));
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'verification_pending': return <Badge className="bg-orange-500 hover:bg-orange-600 animate-pulse">입금 확인 필요</Badge>;
            case 'approved_pending_payment': return <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">입금 대기중</Badge>;
            case 'confirmed': return <Badge className="bg-green-600 hover:bg-green-600">참가 확정</Badge>;
            case 'rejected': return <Badge variant="destructive">거절됨</Badge>;
            default: return <Badge variant="secondary">신청 대기</Badge>;
        }
    };

    const sortedApplicants = [...applicants].sort((a, b) => {
        // Verification pending comes first
        if (a.status === 'verification_pending' && b.status !== 'verification_pending') return -1;
        if (a.status !== 'verification_pending' && b.status === 'verification_pending') return 1;
        return 0;
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-white border-b border-border sticky top-0 z-10 px-4 h-14 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="-ml-2 h-10 w-10" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="font-bold text-lg">신청 관리</h1>
            </header>

            <main className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-foreground">신청자 목록 ({applicants.length})</h2>
                    <span className="text-xs text-muted-foreground">최신순</span>
                </div>

                <div className="space-y-3">
                    {sortedApplicants.map(applicant => (
                        <Card key={applicant.id} className={`p-4 border shadow-sm ${applicant.status === 'verification_pending' ? 'border-orange-200 bg-orange-50/30' : 'border-border bg-white'}`}>
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${applicant.id}`} />
                                        <AvatarFallback>{applicant.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">{applicant.name}</span>
                                            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">{applicant.position}</Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            매너 {applicant.manner}℃ • {applicant.appliedAt}
                                        </div>
                                    </div>
                                </div>
                                {getStatusBadge(applicant.status)}
                            </div>

                            {/* Actions for Verification Pending */}
                            {applicant.status === 'verification_pending' && (
                                <div className="mt-4 pt-4 border-t border-orange-200/50 flex gap-2">
                                    <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1.5 h-10" onClick={() => handleConfirm(applicant.id)}>
                                        <CheckCircle className="w-4 h-4" />
                                        입금 확인
                                    </Button>
                                    
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="outline" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 h-10">
                                                <AlertTriangle className="w-4 h-4" />
                                                미입금 신고
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className='max-w-[320px] rounded-xl'>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>미입금 신고 처리</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    해당 유저를 미입금으로 신고하고 신청을 거절합니다.<br/>
                                                    상대방의 매너온도가 차감됩니다.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter className="flex-row gap-2 sm:justify-end">
                                                <AlertDialogCancel className="mt-0 flex-1">취소</AlertDialogCancel>
                                                <AlertDialogAction className="flex-1 bg-red-600 hover:bg-red-700" onClick={() => handleReject(applicant.id)}>
                                                    신고하기
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )}

                             {/* Actions for Pending */}
                             {applicant.status === 'pending' && (
                                <div className="flex gap-2 mt-3">
                                    <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => handleReject(applicant.id)}>거절</Button>
                                    <Button className="flex-1 h-9 text-xs" onClick={() => setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: 'approved_pending_payment' } : a))}>
                                        승인하기
                                    </Button>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
