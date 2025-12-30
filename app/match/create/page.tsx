'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, CheckCircle2, Car, CloudSnow, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function MatchCreatePage() {
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'share'>('form');

    // Form State
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [fee, setFee] = useState('');
    const [description, setDescription] = useState('');
    const [contact, setContact] = useState('');
    const [facilities, setFacilities] = useState<string[]>([]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would typically save data to DB
        setStep('share');
        window.scrollTo(0, 0);
    };

    const copyLink = () => {
        navigator.clipboard.writeText('https://draft.gg/guest/123'); // Example link
        alert('링크가 복사되었습니다!');
    };

    if (step === 'share') {
        return (
            <div className="min-h-screen bg-background p-6 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-4">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">
                        매치 생성이 완료되었습니다!
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        이제 팀원들에게 링크를 공유하여<br />
                        멤버를 모집해보세요.
                    </p>
                </div>

                <Card className="p-6 w-full max-w-sm border-2 border-primary/20 bg-primary/5">
                     <Button 
                        size="lg" 
                        className="w-full h-16 text-lg font-bold bg-[#FF6600] hover:bg-[#FF6600]/90 shadow-lg shadow-orange-500/20"
                        onClick={copyLink}
                    >
                        <Copy className="mr-2 h-6 w-6" />
                        링크 복사하기
                    </Button>
                    <p className="mt-4 text-xs text-muted-foreground">
                        링크를 클릭하면 바로 게스트 신청이 가능합니다.
                    </p>
                </Card>

                <Button variant="outline" className="w-full max-w-sm" onClick={() => router.push('/')}>
                    홈으로 돌아가기
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-border h-14 flex items-center px-4">
                <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-lg font-bold ml-2">경기 개설하기</h1>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-8">
                <section className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">경기 제목</Label>
                        <Input 
                            id="title" 
                            placeholder="예: 강남구민회관 금요농구" 
                            required 
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="date">날짜</Label>
                             <Input 
                                id="date" 
                                type="date" 
                                required 
                                value={date} 
                                onChange={e => setDate(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="time">시간</Label>
                             <Input 
                                id="time" 
                                type="time" 
                                required 
                                value={time} 
                                onChange={e => setTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">장소</Label>
                        <Input 
                            id="location" 
                            placeholder="체육관명 검색" 
                            required 
                            value={location} 
                            onChange={e => setLocation(e.target.value)}
                        />
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="fee">참가비</Label>
                        <Input 
                            id="fee" 
                            type="number" 
                            placeholder="10000" 
                            value={fee} 
                            onChange={e => setFee(e.target.value)}
                        />
                    </div>
                </section>

                <section className="space-y-4 border-t border-border pt-6">
                    <h3 className="font-bold text-lg">상세 정보</h3>
                    
                    <div className="space-y-2">
                        <Label>편의시설</Label>
                        <ToggleGroup type="multiple" value={facilities} onValueChange={setFacilities} className="justify-start gap-2">
                            <ToggleGroupItem value="parking" aria-label="Toggle parking" className="border data-[state=on]:bg-slate-900 data-[state=on]:text-white data-[state=on]:border-transparent">
                                <Car className="h-4 w-4 mr-2" />
                                주차가능
                            </ToggleGroupItem>
                            <ToggleGroupItem value="shower" aria-label="Toggle shower" className="border data-[state=on]:bg-slate-900 data-[state=on]:text-white data-[state=on]:border-transparent">
                                <Droplets className="h-4 w-4 mr-2" />
                                샤워가능
                            </ToggleGroupItem>
                            <ToggleGroupItem value="ac" aria-label="Toggle ac" className="border data-[state=on]:bg-slate-900 data-[state=on]:text-white data-[state=on]:border-transparent">
                                <CloudSnow className="h-4 w-4 mr-2" />
                                냉난방
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="description">특이사항 / 경기 규칙</Label>
                         <Textarea 
                            id="description" 
                            placeholder="예: 20분씩 4쿼터 진행합니다. 매너 게임 부탁드려요." 
                            className="min-h-[120px] text-base resize-none"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="contact">오픈카톡 링크 (선택)</Label>
                         <Input 
                            id="contact" 
                            placeholder="https://open.kakao.com/..." 
                            value={contact} 
                            onChange={e => setContact(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">문의가 필요할 때 게스트가 연락할 수 있습니다.</p>
                    </div>
                </section>

                <div className="pt-4">
                    <Button type="submit" size="lg" className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 font-bold text-lg h-14 rounded-xl">
                        개설 완료
                    </Button>
                </div>
            </form>
        </div>
    );
}