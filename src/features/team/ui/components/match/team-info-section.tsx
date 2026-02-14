'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/base/avatar';
import { Button } from '@/shared/ui/base/button';
import { Users, Info } from 'lucide-react';
import { ContactModal } from '@/features/match/ui/components/detail/contact-modal';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/shared/ui/shadcn/alert';
import type { TeamInfoDTO } from '@/features/team/model/types';

interface TeamInfoSectionProps {
  team: TeamInfoDTO;
}

export function TeamInfoSection({ team }: TeamInfoSectionProps) {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactClick = () => {
    if (!team.operationInfo) {
      toast.error('연락처 정보가 없습니다.');
      return;
    }
    setIsContactModalOpen(true);
  };

  return (
    <section className="px-5 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-slate-100">
            {team.logoUrl ? (
              <AvatarImage src={team.logoUrl} alt={team.name} />
            ) : null}
            <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs">
              {team.logoUrl ? team.name.substring(0, 2) : <Users className="w-5 h-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[13px] font-bold text-slate-900">{team.name}</div>
          </div>
        </div>
        {team.operationInfo && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs rounded-lg border-slate-200 hover:bg-slate-50 text-slate-600"
            onClick={handleContactClick}
          >
            문의하기
          </Button>
        )}
      </div>

      {/* Draft Mediator Notice */}
      <div>
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900">
            Draft는 중개자로서 경기진행과 운영은 호스트가 담당합니다.
          </AlertDescription>
        </Alert>
      </div>

      {/* Contact Modal */}
      {team.operationInfo && (
        <ContactModal
          open={isContactModalOpen}
          onOpenChange={setIsContactModalOpen}
          contactType={team.operationInfo.type}
          contactValue={(team.operationInfo.type === 'PHONE' ? team.operationInfo.phone : team.operationInfo.url) || ''}
        />
      )}
    </section>
  );
}
