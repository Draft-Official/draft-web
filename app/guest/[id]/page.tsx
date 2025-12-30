'use client';

import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle, ShieldCheck, User, MessageCircle, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ApplicationDrawer } from '@/components/match/application-drawer';

export default function GuestMatchViewPage({ params }: { params: { id: string } }) {
    const [applied, setApplied] = useState(false);
    
    // Mock Data
    const hasContactLink = true; 

    return (
        <div className="bg-background min-h-full pb-32">
            {/* Header Image / Map Placeholder */}
            <div className="h-48 bg-slate-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h1 className="text-white text-3xl font-bold tracking-tight mb-2">1월 24일 (금) 19:00</h1>
                </div>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    D-2
                </div>
            </div>

            <div className="p-5 -mt-6 relative z-10 space-y-5">
                {/* Match Info Card */}
                <Card className="p-5 shadow-lg border-0">
                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="font-bold text-xl text-foreground">강남구민회관 체육관</h2>
                                <div className="flex items-center text-muted-foreground text-sm mt-1 gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>서울시 강남구 삼성로</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm text-muted-foreground">참가비</span>
                                <span className="font-bold text-lg text-foreground">10,000원</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">실내</Badge>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">주차 가능</Badge>
                            <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80">샤워 가능</Badge>
                        </div>
                    </div>
                </Card>

                {/* [NEW] Host Notice Box */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2 text-sm">
                        <Megaphone className="w-4 h-4 text-[#FF6600]" />
                        호스트 공지
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                        20분씩 4쿼터 진행합니다.{"\n"}
                        물은 개별 지참해주시면 감사하겠습니다!{"\n"}
                        매너 게임 필수입니다.
                    </p>
                    
                    {hasContactLink && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                             <Button 
                                variant="outline" 
                                size="sm"
                                className="w-full bg-white border-gray-200 text-gray-700 hover:bg-gray-50 h-9 text-xs font-bold" 
                                onClick={() => window.open('https://open.kakao.com', '_blank')}
                            >
                                <MessageCircle className="w-3.5 h-3.5 mr-1.5 text-[#FF6600]" />
                                호스트에게 문의하기
                            </Button>
                        </div>
                    )}
                </div>

                {/* Map Section */}
                <div className="rounded-xl overflow-hidden border border-border h-48 bg-slate-100 relative shadow-sm">
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <MapPin className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-sm font-medium">지도가 표시될 영역입니다</span>
                    </div>
                </div>

                {/* Host Info */}
                <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-border">
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="font-bold text-sm text-foreground">호스트 김농구</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-green-500" />
                                매너온도 36.5
                            </div>
                        </div>
                    </div>
                    {/* Inquiry button is inside Notice Box now, or we can keep a small one here too if requested. 
                        User snippet had it here. Let's keep it for fidelity if it doesn't clutter. 
                        Actually, having two might be redundant. The snippet had it. 
                        Let's keep it but make it link to the same contact. */}
                    <Button variant="outline" size="sm" className="text-xs h-9" onClick={() => window.open('https://open.kakao.com', '_blank')}>문의</Button>
                </div>

                {/* Position Status - Visual */}
                <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
                    <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        참여 현황
                    </h3>
                    
                    <div className="space-y-3">
                        {/* Guards */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-xs">G</div>
                                <span className="text-sm font-medium text-foreground">가드</span>
                            </div>
                            <div className="flex gap-1">
                                 <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs border-2 border-background shadow-sm">
                                    <CheckCircle className="w-4 h-4" />
                                 </div>
                                 <div className="w-9 h-9 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-xs border-2 border-dashed border-border">
                                    +1
                                 </div>
                            </div>
                        </div>
                        
                        {/* Forwards */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-xs">F</div>
                                <span className="text-sm font-medium text-foreground">포워드</span>
                            </div>
                             <div className="flex gap-1">
                                 {/* Empty spot: Orange border, Orange text */}
                                 <div className="w-9 h-9 rounded-full bg-white text-[#FF6600] flex items-center justify-center text-[10px] font-bold border border-[#FF6600] shadow-sm animate-pulse">
                                    빈자리
                                 </div>
                                 <div className="w-9 h-9 rounded-full bg-white text-[#FF6600] flex items-center justify-center text-[10px] font-bold border border-[#FF6600] shadow-sm animate-pulse delay-75">
                                    빈자리
                                 </div>
                            </div>
                        </div>

                        {/* Centers */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground font-bold text-xs">C</div>
                                <span className="text-sm font-medium text-foreground">센터</span>
                            </div>
                             <div className="flex gap-1">
                                 <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs border-2 border-background shadow-sm">
                                    <CheckCircle className="w-4 h-4" />
                                 </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs text-muted-foreground text-center">이런 분을 찾아요: 레벨 B+ 이상</p>
                    </div>
                </div>

            </div>

             {/* Sticky Bottom Action */}
             <div className="fixed bottom-[70px] left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-border max-w-[430px] mx-auto z-[60]">
                <ApplicationDrawer onApplied={() => setApplied(true)}>
                    <Button
                        className={`w-full text-lg h-14 shadow-lg shadow-orange-200 flex flex-col items-center justify-center gap-0 leading-tight transition-all active:scale-[0.98] ${
                            applied ? 'bg-slate-200 text-slate-500 shadow-none' : 'bg-[#FF6600] hover:bg-[#FF6600]/90 text-white'
                        }`}
                        disabled={applied}
                    >
                        {applied ? "입금 확인 대기중" : (
                            <>
                                <span className="font-bold">신청하기</span>
                                <span className="text-xs font-normal opacity-90">포워드 1명 남음</span>
                            </>
                        )}
                    </Button>
                </ApplicationDrawer>
            </div>
        </div>
    );
}
