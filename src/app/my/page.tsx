'use client';

import { useState, useMemo } from 'react';
import { ProfileCard } from '@/features/my/ui/profile-card';
import { ProfileSetupModal } from '@/features/my/ui/profile-setup-modal';
import { SupportSection } from '@/features/my/ui/support-section';
import { NotificationSettingsSection } from '@/features/my/ui/notification-settings-section';
import { AccountSection } from '@/features/my/ui/account-section';
import { PaymentSection } from '@/features/my/ui/payment-section';
import { MyPageFooter } from '@/features/my/ui/my-page-footer';
import { ProfileData } from '@/features/my/model/types';
import { useAuth, useUpdateProfile } from '@/shared/session';
import { useMyTeams } from '@/features/team/api/team-info/queries';
import type { UserUpdate, UserMetadata } from '@/shared/types/database.types';
import type { SessionProfile } from '@/shared/session';

// DB Profile → UI ProfileData 변환
function profileToFormData(dbProfile: SessionProfile | null): ProfileData | null {
  if (!dbProfile) return null;

  const metadata = dbProfile.metadata as UserMetadata & { age?: number; skill_level?: number; display_team_id?: string };
  const position = dbProfile.positions?.[0];

  return {
    nickname: dbProfile.nickname || '',
    height: metadata?.height?.toString() || '',
    age: metadata?.age?.toString() || '',
    weight: metadata?.weight?.toString() || '',
    position: (position as ProfileData['position']) || '',  // Already 'G', 'F', 'C'
    skillLevel: metadata?.skill_level || 1,
    team: metadata?.display_team_id || '',
  };
}

// UI ProfileData → DB UserUpdate 변환
function formDataToUpdate(
  formData: ProfileData,
  teams: { id: string; name: string }[]
): UserUpdate {
  const selectedTeam = formData.team ? teams.find((t) => t.id === formData.team) : null;

  return {
    nickname: formData.nickname.trim() || null,
    positions: formData.position ? [formData.position] : null,  // Already code
    metadata: {
      height: formData.height ? parseInt(formData.height, 10) : undefined,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
      weight: formData.weight ? parseInt(formData.weight, 10) : undefined,
      skill_level: formData.skillLevel,
      display_team_id: selectedTeam?.id ?? null,
      display_team_name: selectedTeam?.name ?? null,
    },
  };
}

export default function MyPage() {
  const { user, profile: dbProfile, refreshProfile, isLoading: authLoading } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 소속 팀 목록 조회
  const { data: myTeams = [] } = useMyTeams(user?.id);
  const teamOptions = useMemo(
    () => myTeams.map((t) => ({ id: t.id, name: t.name })),
    [myTeams]
  );

  // DB 프로필을 UI용 ProfileData로 변환
  const profile = useMemo(() => profileToFormData(dbProfile), [dbProfile]);

  // 선택된 대표 팀 이름 조회
  const displayTeamName = useMemo(() => {
    if (!profile?.team) return undefined;
    const found = myTeams.find((t) => t.id === profile.team);
    if (found) return found.name;
    // myTeams에 없으면 metadata에 저장된 이름 사용
    const metadata = dbProfile?.metadata as { display_team_name?: string } | null;
    return metadata?.display_team_name || undefined;
  }, [profile?.team, myTeams, dbProfile?.metadata]);

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
      const updates = formDataToUpdate(data, teamOptions);
      await updateProfileMutation.mutateAsync({ userId: user.id, updates });
      await refreshProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  // 사용자 이름과 이니셜
  const userName = dbProfile?.nickname || dbProfile?.real_name || user?.email?.split('@')[0] || '사용자';
  const userInitials = userName.slice(0, 2);

  return (
    <div className="bg-background min-h-full p-4 space-y-6 pb-24">
      <h1 className="text-2xl font-bold text-foreground">내 프로필</h1>

      <ProfileCard
        profile={profile}
        userName={userName}
        userInitials={userInitials}
        teamName={displayTeamName}
        isAuthenticated={!!user}
        onEditClick={handleEditClick}
      />

      <SupportSection />

      <NotificationSettingsSection />

      {user && (
        <>
          <AccountSection />
          <PaymentSection />
          <MyPageFooter />
        </>
      )}

      <ProfileSetupModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onComplete={handleProfileComplete}
        initialData={profile || undefined}
        isEditing={!!profile}
        teams={teamOptions}
      />
    </div>
  );
}
