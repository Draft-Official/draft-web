'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  const [activeTab, setActiveTab] = useState('my-teams');

  return (
    <div className="min-h-screen bg-background">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-0">
        {/* 탭 헤더 */}
        <div className="bg-white sticky top-0 z-20 px-(--dimension-spacing-x-global-gutter) py-(--dimension-x2)">
          <TabsList>
            <TabsTrigger value="my-teams" className="relative font-bold text-lg after:hidden">
              나의 팀
              {activeTab === 'my-teams' && (
                <motion.div
                  layoutId="team-page-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--color-fg-neutral)"
                />
              )}
            </TabsTrigger>
            <TabsTrigger value="create-team" className="relative font-bold text-lg after:hidden">
              <span className="flex items-center gap-1">
                팀 생성하기
                <Plus className="w-4 h-4" />
              </span>
              {activeTab === 'create-team' && (
                <motion.div
                  layoutId="team-page-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-(--color-fg-neutral)"
                />
              )}
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
