'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Share2, MoreVertical } from 'lucide-react';
import { HeroSection } from './components/detail/hero-section';
import { RecruitmentStatus } from './components/detail/recruitment-status';
import { MatchInfoSection } from './components/detail/match-info-section';
import { MatchRuleSection } from './components/detail/match-rule-section';
import { FacilitySection } from './components/detail/facility-section';
import { HostSection } from './components/detail/host-section';
import { MatchDetailBottomBar } from './components/detail/bottom-bar';
import { Match } from '@/features/match/model/mock-data';

interface MatchDetailViewProps {
  match: Match;
}

export function MatchDetailView({ match }: MatchDetailViewProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white relative pb-[100px] max-w-[760px] mx-auto shadow-2xl shadow-slate-200">
      
      {/* 1. Header (Sticky) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 h-[52px] flex items-center justify-between px-2">
        <button 
          onClick={() => router.back()}
          className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-1">
          <button className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-full transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Content Sections */}
      <main>
        <HeroSection match={match} />
        
        {/* Divider */}
        <div className="h-px bg-slate-100 mx-5" />
        
        <RecruitmentStatus match={match} />
        
        <div className="h-px bg-slate-100 mx-5" />

        <MatchInfoSection match={match} />

        <div className="h-px bg-slate-100 mx-5" />

        <MatchRuleSection match={match} />

        <div className="h-px bg-slate-100 mx-5" />

        <HostSection match={match} />

        <div className="h-px bg-slate-100 mx-5" />

        <FacilitySection match={match} id="facility-section" />
      </main>

      {/* 3. Bottom Bar */}
      <MatchDetailBottomBar 
        match={match} 
        onApply={() => alert('신청하기 (Todo)')}
      />
    </div>
  );
}
