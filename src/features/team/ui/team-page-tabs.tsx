'use client';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui/shadcn/tabs';
import { Plus } from 'lucide-react';
import { MyTeamsTab } from './my-teams-tab';
import { TeamCreateTab } from './team-create-tab';

/**
 * /team 페이지 메인 탭 컨테이너
 * - 나의 팀: 소속 팀 카드 + 미투표 경기
 * - 팀 생성하기+: 기능 소개 + 팀 생성 버튼
 */
export function TeamPageTabs() {
  return (
    <div className="min-h-screen bg-background">
      <Tabs defaultValue="my-teams" className="w-full gap-0">
        {/* 탭 헤더 */}
        <div className="bg-white sticky top-0 z-20 px-(--dimension-spacing-x-global-gutter) py-(--dimension-x2)">
          <TabsList>
            <TabsTrigger value="my-teams" className="font-bold text-base">
              나의 팀
            </TabsTrigger>
            <TabsTrigger value="create-team" className="font-bold text-base">
              <span className="flex items-center gap-1">
                팀 생성하기
                <Plus className="w-4 h-4" />
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 탭 콘텐츠 */}
        <TabsContent value="my-teams" className="mt-(--dimension-spacing-y-component-default)">
          <MyTeamsTab />
        </TabsContent>

        <TabsContent value="create-team" className="mt-(--dimension-spacing-y-component-default)">
          <TeamCreateTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
