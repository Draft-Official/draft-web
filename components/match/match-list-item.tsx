'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Flame } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MatchListItemProps {
    id: number | string;
    dateISO: string;
    time: string; // '19:00'
    dDay: string;
    price: string; // '10,000원'
    title: string;
    location: string;
    positions: {
        all?: { status: 'open' | 'closed'; count: number; label?: string };
        g?: { status: 'open' | 'closed' | 'urgent'; count: number; max?: number };
        f?: { status: 'open' | 'closed' | 'urgent'; count: number; max?: number };
        c?: { status: 'open' | 'closed' | 'urgent'; count: number; max?: number };
    };
    isClosed?: boolean; // If true, apply grayscale style
}

export function MatchListItem(props: MatchListItemProps) {
    const router = useRouter();
    const { id, time, price, title, location, positions, isClosed, dDay } = props;

    return (
        <div 
            className={cn(
                "flex flex-col w-full bg-white border-b border-gray-100 py-4 px-5 active:bg-gray-50 transition-colors cursor-pointer",
                isClosed && "grayscale opacity-80"
            )}
            onClick={() => router.push(`/guest/${id}`)}
        >
            {/* Header: Time & Price */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex flex-col">
                    <h3 className="text-[26px] font-black tracking-tighter text-slate-900 leading-none mb-1 font-mono">
                        {time}
                    </h3>
                </div>
                <span className="font-bold text-slate-900 text-lg">{price}</span>
            </div>

            {/* Venue & Location */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-bold text-lg text-slate-900 line-clamp-1">{title}</span>
                        {/* D-Day Badge moved here */}
                        {dDay === '오늘' ? (
                        <Badge variant="destructive" className="h-5 px-1.5 text-[10px] animate-pulse">
                            <Flame className="w-2.5 h-2.5 mr-0.5 fill-white" /> 오늘
                        </Badge>
                    ) : dDay === '내일' ? (
                        <Badge className="h-5 px-1.5 text-[10px] bg-orange-500 hover:bg-orange-600">내일</Badge>
                    ) : (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] text-slate-500 bg-slate-100">{dDay}</Badge>
                    )}
                </div>
                <div className="flex items-center text-slate-500 text-xs gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                </div>
            </div>

            {/* Positions Chips (Status) */}
            <div className="flex flex-wrap gap-1.5">
                {/* 'Any' Position */}
                {positions.all && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 rounded-md font-normal h-7">
                        {positions.all.label || `전체 ${positions.all.count}명`}
                        </Badge>
                )}
                
                {/* Guard */}
                {positions.g && (
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "rounded-md border font-normal h-7 px-2",
                            positions.g.status === 'closed' 
                                ? "bg-slate-50 text-slate-400 border-slate-100" 
                                : "bg-white border-slate-200 text-slate-600"
                        )}
                    >
                        <span className={cn("font-bold mr-1", positions.g.status === 'closed' ? "text-slate-400" : "text-black")}>가드</span>
                        {positions.g.status === 'closed' ? '마감' : `${positions.g.count}/${positions.g.max || 1}`}
                    </Badge>
                )}
                
                {/* Forward */}
                {positions.f && (
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "rounded-md border font-normal h-7 px-2",
                            positions.f.status === 'open' 
                                ? "bg-green-50 border-green-200 text-green-700" 
                                : "bg-white border-slate-200 text-slate-600"
                        )}
                    >
                        <span className="font-bold text-black mr-1">포워드</span> 
                        {positions.f.count}/{positions.f.max || 1}
                    </Badge>
                )}

                {/* Center */}
                {positions.c && (
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "rounded-md border font-normal h-7 px-2",
                            positions.c.status === 'urgent'
                                ? "bg-red-50 border-red-200 text-red-600" 
                                : "bg-white border-slate-200 text-slate-600"
                        )}
                    >
                            <span className={cn("font-bold mr-1", positions.c.status === 'urgent' ? "text-red-600" : "text-black")}>센터</span>
                        {positions.c.status === 'urgent' ? '급구' : `${positions.c.count}/${positions.c.max || 1}`}
                    </Badge>
                )}
            </div>
        </div>
    );
}
