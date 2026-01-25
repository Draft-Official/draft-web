'use client';

import { useState, useMemo } from 'react';
import { CreditCard, LogOut, Settings } from 'lucide-react';
import { Button } from '@/shared/ui/base/button';
import { Card } from '@/shared/ui/base/card';
import { ProfileCard } from '@/features/my/ui/profile-card';
import { ProfileSetupModal } from '@/features/my/ui/profile-setup-modal';
import { ProfileData } from '@/features/my/model/types';
import { useAuth } from '@/features/auth/model/auth-context';
import { useUpdateProfile } from '@/features/auth/api/mutations';
import { useRouter } from 'next/navigation';
import type { Profile, UserUpdate, UserMetadata } from '@/shared/types/database.types';

// DB Profile → UI ProfileData 변환
function profileToFormData(dbProfile: Profile | null): ProfileData | null {
  if (!dbProfile) return null;

  const metadata = dbProfile.metadata as UserMetadata & { age?: number; skill_level?: number };
  const position = dbProfile.positions?.[0];

  return {
    height: metadata?.height?.toString() || '',
    age: metadata?.age?.toString() || '',
    weight: metadata?.weight?.toString() || '',
    position: (position as ProfileData['position']) || '',  // Already 'G', 'F', 'C'
    skillLevel: metadata?.skill_level || 1,
    team: '', // TODO: 팀 정보는 team_members 테이블에서 가져와야 함
  };
}

// UI ProfileData → DB UserUpdate 변환
function formDataToUpdate(formData: ProfileData): UserUpdate {
  return {
    positions: formData.position ? [formData.position] : null,  // Already code
    metadata: {
      height: formData.height ? parseInt(formData.height, 10) : undefined,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      weight: formData.weight ? parseInt(formData.weight, 10) : undefined,
      skill_level: formData.skillLevel,
    },
  };
}

export default function MyPage() {
  const { user, profile: dbProfile, refreshProfile, isLoading: authLoading } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // DB 프로필을 UI용 ProfileData로 변환
  const profile = useMemo(() => profileToFormData(dbProfile), [dbProfile]);

  // 로딩 중일 때 스켈레톤 UI
  if (authLoading) {
    return (
      <div className="bg-background min-h-full p-4 space-y-6 pb-24">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="space-y-4">
          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  const handleProfileComplete = async (data: ProfileData) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    try {
      const updates = formDataToUpdate(data);
      await updateProfileMutation.mutateAsync({ userId: user.id, updates });
      await refreshProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const { signOut } = useAuth();
  const router = useRouter();

  // 사용자 이름과 이니셜
  const userName = dbProfile?.nickname || dbProfile?.real_name || user?.email?.split('@')[0] || '사용자';
  const userInitials = userName.slice(0, 2);

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('profileSkipped');
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="bg-background min-h-full p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground">내 프로필</h1>

      <ProfileCard
        profile={profile}
        userName={userName}
        userInitials={userInitials}
        teamName={profile?.team}
        isAuthenticated={!!user}
        onEditClick={handleEditClick}
      />

      <div className="space-y-4">
        <h2 className="font-bold text-lg text-foreground">설정</h2>

        <Card className="p-0 overflow-hidden border-border">
          <div className="divide-y divide-border">
            <Button variant="ghost" className="w-full justify-start p-4 h-auto rounded-none font-normal">
              <CreditCard className="mr-3 h-5 w-5 text-muted-foreground" />
              결제 내역
            </Button>
            <Button variant="ghost" className="w-full justify-start p-4 h-auto rounded-none font-normal">
              <Settings className="mr-3 h-5 w-5 text-muted-foreground" />
              일반
            </Button>
          </div>
        </Card>

        {user && (
          <Button
            variant="outline"
            className="w-full justify-start p-4 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            로그아웃
          </Button>
        )}
      </div>

      <ProfileSetupModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={handleProfileComplete}
        initialData={profile || undefined}
        isEditing={!!profile}
      />
    </div>
  );
}
