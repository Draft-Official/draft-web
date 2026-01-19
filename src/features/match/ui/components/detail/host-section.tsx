'use client';

import React from 'react';
import { Match } from '@/features/match/model/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface HostSectionProps {
  match: Match;
}

export function HostSection({ match }: HostSectionProps) {
  return (
    <section className="px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Using Shadcn Avatar as per snippet */}
          <Avatar className="w-10 h-10 border border-slate-100">
            <AvatarImage src="" /> {/* Placeholder or match.hostImage */}
            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs">
                {match.hostName ? match.hostName.substring(0,2) : "TM"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[13px] font-bold text-slate-900">{match.teamName || '팀 슬램덩크'}</div>
            <div className="text-xs text-slate-500">호스트 {match.hostName || '김농구'}</div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600">
          문의하기
        </Button>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-4 text-[13px] text-slate-600 leading-relaxed relative">
        <MessageCircle className="w-4 h-4 text-slate-300 absolute top-4 left-4" />
        <p className="pl-6 whitespace-pre-wrap">
          "{match.hostMessage || '승부욕보다는 즐겁게 뛰실 분 환영합니다! 거친 플레이는 지양합니다. 서로 매너 지켜요!'}"
        </p>
      </div>
    </section>
  );
}
