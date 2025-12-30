'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Copy, CheckCircle2, Car, Droplets, CloudSnow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Counter } from '@/components/ui/counter';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Types
interface MatchFormData {
    title: string;
    date: string;
    time: string;
    location: string;
    fee: string;
    description: string;
    contact: string;
    facilities: string[];
    
    // Position Logic
    usePosition: boolean;
    guardCount: number;
    forwardCount: number;
    centerCount: number;
}

export default function MatchCreatePage() {
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'share'>('form');

    // React Hook Form
    const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<MatchFormData>({
        defaultValues: {
            title: '',
            date: '',
            time: '',
            location: '',
            fee: '',
            description: '',
            contact: '',
            facilities: [],
            usePosition: false,
            guardCount: 0,
            forwardCount: 0,
            centerCount: 0,
        }
    });

    const usePosition = watch('usePosition');
    const facilities = watch('facilities');

    const onSubmit = (data: MatchFormData) => {
        console.log('Form Data:', data);
        // DB upload simulation
        setStep('share');
        window.scrollTo(0, 0);
    };

    const copyLink = () => {
        navigator.clipboard.writeText('https://draft.gg/guest/123');
        alert('링크가 복사되었습니다!');
    };

    const toggleFacility = (value: string) => {
        const current = facilities || [];
        if (current.includes(value)) {
            setValue('facilities', current.filter(v => v !== value));
        } else {
            setValue('facilities', [...current, value]);
        }
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
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white border-b border-slate-100 h-14 flex items-center px-4">
                <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-lg font-bold ml-2">경기 개설하기</h1>
            </header>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-8 max-w-lg mx-auto">
                
                {/* 1. Basic Info */}
                <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800">기본 정보</h3>
                    
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-600">경기 제목 <span className="text-red-500">*</span></Label>
                        <Input 
                            id="title" 
                            placeholder="예: 강남구민회관 금요농구" 
                            className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            {...register('title', { required: true })}
                        />
                        {errors.title && <span className="text-xs text-red-500">필수 입력 항목입니다.</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                             <Label htmlFor="date" className="text-slate-600">날짜 <span className="text-red-500">*</span></Label>
                             <Input 
                                id="date" 
                                type="date" 
                                className="bg-slate-50 border-slate-200 focus:bg-white"
                                {...register('date', { required: true })}
                            />
                             {errors.date && <span className="text-xs text-red-500">필수입니다.</span>}
                        </div>
                        <div className="space-y-2">
                             <Label htmlFor="time" className="text-slate-600">시간 <span className="text-red-500">*</span></Label>
                             <Input 
                                id="time" 
                                type="time" 
                                className="bg-slate-50 border-slate-200 focus:bg-white"
                                {...register('time', { required: true })}
                            />
                             {errors.time && <span className="text-xs text-red-500">필수입니다.</span>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location" className="text-slate-600">장소 <span className="text-red-500">*</span></Label>
                        <Input 
                            id="location" 
                            placeholder="체육관명 검색" 
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                            {...register('location', { required: true })}
                        />
                         {errors.location && <span className="text-xs text-red-500">필수 입력 항목입니다.</span>}
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="fee" className="text-slate-600">참가비 (1인) <span className="text-red-500">*</span></Label>
                        <Input 
                            id="fee" 
                            type="number" 
                            placeholder="10000" 
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                            {...register('fee', { required: true })}
                        />
                    </div>
                </section>

                {/* 2. Position Detail */}
                <section className="space-y-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                        <h3 className="font-bold text-lg text-slate-800">포지션별 모집</h3>
                        <Controller
                            control={control}
                            name="usePosition"
                            render={({ field }) => (
                                <Switch 
                                    checked={field.value} 
                                    onCheckedChange={field.onChange} 
                                />
                            )}
                        />
                    </div>

                    {usePosition ? (
                        <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                            <Controller
                                control={control}
                                name="guardCount"
                                render={({ field }) => (
                                    <Counter 
                                        label="가드 (Guard)" 
                                        value={field.value} 
                                        onChange={field.onChange} 
                                    />
                                )}
                            />
                             <Controller
                                control={control}
                                name="forwardCount"
                                render={({ field }) => (
                                    <Counter 
                                        label="포워드 (Forward)" 
                                        value={field.value} 
                                        onChange={field.onChange} 
                                    />
                                )}
                            />
                             <Controller
                                control={control}
                                name="centerCount"
                                render={({ field }) => (
                                    <Counter 
                                        label="센터 (Center)" 
                                        value={field.value} 
                                        onChange={field.onChange} 
                                    />
                                )}
                            />
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 py-2">
                            스위치를 켜면 포지션별(가드/포워드/센터) 모집 인원을 상세하게 설정할 수 있습니다. <br/>
                            꺼두시면 '포지션 무관'으로 모집됩니다.
                        </p>
                    )}
                </section>

                {/* 3. Facilities & Details */}
                <section className="space-y-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800">상세 정보</h3>
                    
                    <div className="space-y-3">
                        <Label className="text-slate-600">편의시설</Label>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'parking', label: '주차 가능', icon: Car },
                                { id: 'shower', label: '샤워 가능', icon: Droplets },
                                { id: 'ac', label: '냉난방', icon: CloudSnow },
                            ].map((item) => {
                                const isActive = facilities.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleFacility(item.id)}
                                        className={cn(
                                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 border",
                                            isActive 
                                                ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-100" 
                                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="description" className="text-slate-600">특이사항 / 경기 규칙</Label>
                         <Textarea 
                            id="description" 
                            placeholder="예: 20분씩 4쿼터 진행합니다. 매너 게임 부탁드려요." 
                            className="min-h-[120px] bg-slate-50 border-slate-200 focus:bg-white resize-none"
                            {...register('description')}
                        />
                    </div>

                    <div className="space-y-2">
                         <Label htmlFor="contact" className="text-slate-600">오픈카톡 링크 (선택)</Label>
                         <Input 
                            id="contact" 
                            placeholder="https://open.kakao.com/..." 
                            className="bg-slate-50 border-slate-200 focus:bg-white"
                            {...register('contact')}
                        />
                        <p className="text-xs text-slate-400">문의가 필요할 때 게스트가 연락할 수 있습니다.</p>
                    </div>
                </section>

                <div className="pt-4 pb-10">
                    <Button type="submit" size="lg" className="w-full bg-[#FF6600] hover:bg-[#FF6600]/90 font-bold text-lg h-14 rounded-xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all">
                        개설 완료
                    </Button>
                </div>
            </form>
        </div>
    );
}