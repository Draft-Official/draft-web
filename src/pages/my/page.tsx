'use client';

import { useState, useMemo } from 'react';
import { ProfileCard } from '@/features/my/ui/profile-card';
import { ProfileSetupModal } from '@/features/my/ui/profile-setup-modal';
import { SupportSection } from '@/features/my/ui/support-section';
import { NotificationSettingsSection } from '@/features/my/ui/notification-settings-section';
import { AccountSection } from '@/features/my/ui/account-section';
import { PaymentSection } from '@/features/my/ui/payment-section';
import { MyPageFooter } from '@/features/my/ui/my-page-footer';
import {
  myProfileFormDTOToUpdateSessionProfileInput,
  toMyProfileViewDTO,
  toMyTeamOptions,
  type UpdateMyProfileInput,
} from '@/features/my';
import { useAuth, useUpdateProfile } from '@/shared/session';
import { useMyTeams } from '@/features/team/api/team-info/queries';

export default function MyPage() {
  const { user, profile: dbProfile, refreshProfile, isLoading: authLoading } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 소속 팀 목록 조회
  const { data: myTeams = [] } = useMyTeams(user?.id);
  const teamOptions = useMemo(
    () => toMyTeamOptions(myTeams),
    [myTeams]
  );

  const profileView = useMemo(
    () =>
      toMyProfileViewDTO({
        sessionProfile: dbProfile,
        userEmail: user?.email,
        teamOptions,
      }),
    [dbProfile, user?.email, teamOptions]
  );

  const profile = profileView.profile;
  const displayTeamName = profileView.displayTeamName;

  // 로딩 중일 때 스켈레톤 UI
  if (authLoading) {
    return (
      <div className="bg-background min-h-full px-(--dimension-spacing-x-global-gutter) py-(--dimension-spacing-y-component-default) space-y-(--dimension-spacing-y-component-default) pb-(--dimension-spacing-y-screen-bottom)">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="space-y-4">
          <div className="h-6 w-16 bg-muted animate-pulse rounded" />
          <div className="h-24 bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  const handleProfileComplete = async (data: UpdateMyProfileInput) => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    try {
      const updates = myProfileFormDTOToUpdateSessionProfileInput(data, teamOptions);
      await updateProfileMutation.mutateAsync({ userId: user.id, updates });
      await refreshProfile();
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const userName = profileView.userName;
  const userInitials = profileView.userInitials;

  return (
    <div className="bg-background min-h-full px-(--dimension-spacing-x-global-gutter) py-(--dimension-spacing-y-component-default) space-y-(--dimension-spacing-y-component-default) pb-(--dimension-spacing-y-screen-bottom)">
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
