'use client';

import { useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/shadcn/tabs';
import { Separator } from '@/shared/ui/shadcn/separator';
import { Plus } from 'lucide-react';
import { MyTeamsTab } from './my-teams-tab';
import { TeamCreateTab } from './team-create-tab';

/**
 * /team 페이지 메인 탭 컨테이너
 * - 나의 팀: 소속 팀 카드 + 미투표 경기
 * - 팀 생성하기+: 기능 소개 + 팀 생성 버튼
 */
interface TeamPageTabsProps {
  onTeamMatchSelect?: (detailPath: string) => void;
  activeTeamMatchPath?: string | null;
}

export function TeamPageTabs({ onTeamMatchSelect, activeTeamMatchPath }: TeamPageTabsProps) {
  const [activeTab, setActiveTab] = useState('my-teams');

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-0">
        {/* 탭 헤더 */}
        <div className="bg-white sticky top-0 z-20 px-(--dimension-spacing-x-global-gutter) pt-(--dimension-spacing-y-nav-to-title) pb-(--dimension-x2)">
          <TabsList>
            <TabsTrigger value="my-teams" className="relative pb-1.5 font-extrabold text-xl tracking-tight after:hidden">
              나의 팀
            </TabsTrigger>
            <TabsTrigger value="create-team" className="relative pb-1.5 font-extrabold text-xl tracking-tight after:hidden">
              <span className="flex items-center gap-1">
                팀 생성하기
                <Plus className="w-5 h-5" />
              </span>
            </TabsTrigger>
          </TabsList>
        </div>
        <Separator className="bg-slate-100" />

        {/* 탭 콘텐츠 */}
        <TabsContent value="my-teams" className="mt-(--dimension-spacing-y-component-default)">
          <MyTeamsTab
            onTeamMatchSelect={onTeamMatchSelect}
            activeTeamMatchPath={activeTeamMatchPath}
          />
        </TabsContent>

        <TabsContent value="create-team" className="mt-(--dimension-spacing-y-component-default)">
          <TeamCreateTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
