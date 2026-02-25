'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/shadcn/avatar';
import { Users, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/shadcn/alert';
import type { TeamInfoDTO } from '@/features/team/model/types';

interface TeamInfoSectionProps {
  team: TeamInfoDTO;
}

export function TeamInfoSection({ team }: TeamInfoSectionProps) {
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
    </section>
  );
}
