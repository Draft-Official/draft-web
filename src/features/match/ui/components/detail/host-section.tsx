'use client';

import React, { useState } from 'react';
import { GuestMatchDetailDTO } from '@/features/match/model/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Button } from '@/shared/ui/shadcn/button';
import { MessageCircle, Users, Info } from 'lucide-react';
import { ContactModal } from './contact-modal';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/shared/ui/shadcn/alert';

// 기본 팀 로고 (팀이 없을 때 사용)
const DEFAULT_TEAM_LOGO = '/logos/preset/logo-01.webp';

interface HostSectionProps {
  match: GuestMatchDetailDTO;
}

export function HostSection({ match }: HostSectionProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // 팀명: teamId가 있으면 teamName, 없으면 manualTeamName
  const displayTeamName = match.teamId ? match.teamName : (match.manualTeamName || match.teamName || '팀');

  // 팀 로고: teamId가 있으면 teamLogo, 없으면 기본 로고
  const teamLogoUrl = match.teamId ? (match.teamLogo || undefined) : DEFAULT_TEAM_LOGO;

  // 팀 이니셜 (Fallback)
  const teamInitial = displayTeamName?.substring(0, 2) || 'TM';

  const handleContactClick = () => {
    if (!match.contactInfo) {
      toast.error('연락처 정보가 없습니다.');
      return;
    }
    setIsContactModalOpen(true);
  };

  return (
    <section className="px-5 py-6">
      <div className={`flex items-center justify-between ${match.hostMessage ? 'mb-4' : ''}`}>
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-slate-100">
            {teamLogoUrl ? (
              <AvatarImage src={teamLogoUrl} />
            ) : null}
            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs">
              {teamLogoUrl ? teamInitial : <Users className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[13px] font-bold text-slate-900">{displayTeamName}</div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600"
          onClick={handleContactClick}
        >
          문의하기
        </Button>
      </div>

      {/* 호스트 메시지가 있을 때만 표시 */}
      {match.hostMessage && (
        <div className="bg-slate-50 rounded-xl p-4 text-[13px] text-slate-600 leading-relaxed relative">
          <MessageCircle className="w-4 h-4 text-slate-300 absolute top-4 left-4" />
          <p className="pl-6 whitespace-pre-wrap">
            &quot;{match.hostMessage}&quot;
          </p>
        </div>
      )}

      {/* Draft Mediator Notice */}
      <div className="mt-4">
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900">
            Draft는 중개자로서 경기진행과 운영은 호스트가 담당합니다.
          </AlertDescription>
        </Alert>
      </div>

      {/* Contact Modal */}
      {match.contactInfo && (
        <ContactModal
          open={isContactModalOpen}
          onOpenChange={setIsContactModalOpen}
          contactType={match.contactInfo.type}
          contactValue={match.contactInfo.value}
        />
      )}
    </section>
  );
}
