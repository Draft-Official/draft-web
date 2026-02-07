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
    <div className="min-h-screen bg-slate-50">
      {/* 페이지 헤더 */}
      <div className="bg-white sticky top-0 z-20 border-b border-slate-100">
        <div className="flex items-center px-4 h-14">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            팀
          </h1>
        </div>
      </div>

      <Tabs defaultValue="my-teams" className="w-full">
        {/* 탭 헤더 */}
        <div className="bg-white sticky top-14 z-20 border-b border-slate-100 px-4 py-2">
          <TabsList className="w-full h-10">
            <TabsTrigger value="my-teams" className="flex-1 font-bold">
              나의 팀
            </TabsTrigger>
            <TabsTrigger value="create-team" className="flex-1 font-bold">
              <span className="flex items-center gap-1">
                팀 생성하기
                <Plus className="w-4 h-4" />
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 탭 콘텐츠 */}
        <TabsContent value="my-teams" className="mt-4">
          <MyTeamsTab />
        </TabsContent>

        <TabsContent value="create-team" className="mt-4">
          <TeamCreateTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
