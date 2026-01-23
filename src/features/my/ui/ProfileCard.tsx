'use client';

import Link from 'next/link';
import { Edit, LogIn } from 'lucide-react';
import { Card } from '@/shared/ui/base/card';
import { Button } from '@/shared/ui/base/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/base/avatar';
import { ProfileData, SKILL_LEVEL_NAMES, isProfileComplete } from '../model/types';

interface ProfileCardProps {
  profile: ProfileData | null;
  userName: string;
  userInitials: string;
  teamName?: string;
  isAuthenticated: boolean;
  onEditClick: () => void;
}

export function ProfileCard({
  profile,
  userName,
  userInitials,
  teamName,
  isAuthenticated,
  onEditClick,
}: ProfileCardProps) {
  // If not logged in, show login prompt
  if (!isAuthenticated) {
    return (
      <Card className="bg-white rounded-2xl shadow-sm border-slate-200 p-6">
        <div className="text-center space-y-4">
          <div>
            <div className="text-lg font-bold text-slate-900 mb-1">
              로그인이 필요합니다
            </div>
            <div className="text-sm text-slate-600">
              로그인하고 다양한 기능을 이용해보세요
            </div>
          </div>
          <Link href="/login" className="block">
            <Button
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
            >
              <LogIn className="w-5 h-5 mr-2" />
              로그인 하기
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  // If logged in but no profile data or incomplete, show setup prompt
  if (!isProfileComplete(profile)) {
    return (
      <div className="space-y-4">
        {/* User Header */}
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-slate-200 text-slate-700 text-lg font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-bold text-foreground">{userName}</h1>
          </div>
        </div>

        {/* Prompt Card */}
        <Card className="bg-white rounded-2xl shadow-sm border-slate-200 p-6">
          <div className="text-center space-y-4">
            <div>
              <div className="text-lg font-bold text-slate-900 mb-1">
                프로필을 완성해주세요
              </div>
              <div className="text-sm text-slate-600">
                매칭 정확도가 올라갑니다
              </div>
            </div>
            <Button
              onClick={onEditClick}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
            >
              프로필 입력하기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show complete profile
  return (
    <Card className="bg-white rounded-2xl shadow-sm border-slate-200 p-5">
      {/* Header: Photo + Name + Edit Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback className="bg-slate-200 text-slate-700 text-lg font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold text-foreground">{userName}</h1>
        </div>
        <Button
          onClick={onEditClick}
          variant="ghost"
          size="sm"
          className="text-slate-600 hover:text-slate-900"
        >
          <Edit className="w-4 h-4 mr-1" />
          수정
        </Button>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mb-4" />

      {/* Profile Info: Label-Value Rows */}
      <div className="space-y-2">
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-slate-500">키</span>
          <span className="text-sm font-bold text-slate-900">{profile.height}cm</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-slate-500">나이</span>
          <span className="text-sm font-bold text-slate-900">{profile.age}세</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-slate-500">몸무게</span>
          <span className="text-sm font-bold text-slate-900">{profile.weight}kg</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-slate-500">포지션</span>
          <span className="text-sm font-bold text-slate-900">{profile.position}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-slate-500">실력</span>
          <span className="text-sm font-bold text-slate-900">{SKILL_LEVEL_NAMES[profile.skillLevel]}</span>
        </div>
        {teamName && (
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-slate-500">팀</span>
            <span className="text-sm font-bold text-slate-900">팀 {teamName}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
