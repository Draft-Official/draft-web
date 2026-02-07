'use client';

import { useRouter } from 'next/navigation';
import { Users, Calendar, Link2, ArrowRight } from 'lucide-react';
import { Card } from '@/shared/ui/base/card';
import { Button } from '@/shared/ui/base/button';

interface BenefitItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const TEAM_BENEFITS: BenefitItem[] = [
  {
    icon: <Users className="w-6 h-6" />,
    title: '팀원 현황을 한눈에 확인하세요',
    description:
      '정기 운동 참석 여부와 회비 현황을 쉽게 관리할 수 있습니다.\n일일이 묻지 않아도, 팀이 더 체계적으로 운영됩니다.',
  },
  {
    icon: <Calendar className="w-6 h-6" />,
    title: '매주 운동 일정, 자동으로 준비됩니다',
    description:
      '주간 운동을 자동 생성하고 참석 투표를 진행하세요.\n인원이 부족하면 게스트 모집으로 전환해 안정적으로 운영할 수 있습니다.',
  },
  {
    icon: <Link2 className="w-6 h-6" />,
    title: '팀원 모집도 간편하게',
    description:
      '카카오톡 초대 링크로 새로운 팀원을 쉽게 초대하세요.\n함께 뛰는 사람이 늘어날수록 팀은 더 단단해집니다.',
  },
];

/**
 * 팀 생성하기+ 탭
 * - 팀 생성 시 이점 소개
 * - 팀 생성 버튼 → /team/create
 */
export function TeamCreateTab() {
  const router = useRouter();

  const handleCreateTeam = () => {
    router.push('/team/create');
  };

  return (
    <div className="p-4 pb-20">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          팀 운영이 더 쉬워집니다
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          팀원 한 명,한 명을 더 잘 챙길 수 있도록,
          <br />
          농구 팀 운영에 필요한 기능을 모두 담았습니다.
        </p>
      </div>

      {/* 기능 소개 카드 */}
      <div className="space-y-3 mb-8">
        {TEAM_BENEFITS.map((benefit, index) => (
          <Card
            key={index}
            className="p-4 border border-slate-200 rounded-xl"
          >
            <div className="flex gap-3 items-center mb-2">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-primary flex-shrink-0">
                {benefit.icon}
              </div>
              <h3 className="font-bold text-slate-900">{benefit.title}</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {benefit.description}
            </p>
          </Card>
        ))}
      </div>

      {/* 팀 생성 버튼 */}
      <Button
        onClick={handleCreateTeam}
        className="w-full h-14 text-base font-bold bg-primary hover:bg-primary/90"
      >
        팀 만들기
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
