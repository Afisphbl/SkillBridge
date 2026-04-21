"use client";

import ProfileHeader from "@/components/Profile/ProfileHeader";
import AvatarUploader from "@/components/Profile/AvatarUploader";
import ProfileForm from "@/components/Profile/ProfileForm";
import AccountSettings from "@/components/Profile/AccountSettings";
import DangerZone from "@/components/Profile/DangerZone";
import DeleteAccountModal from "@/components/Profile/DeleteAccountModal";
import ProfileSkeleton from "@/components/Profile/ProfileSkeleton";
import { useUser } from "@/hooks/useUser";

export default function SellerProfilePage() {
  const { loading } = useUser();

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <div className="profile-fade-in mx-auto w-full max-w-250 space-y-6 rounded-3xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_16px_35px_-22px_rgba(15,23,42,0.35)] sm:p-6 lg:p-8">
        <ProfileHeader />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="space-y-6 md:w-75 md:shrink-0">
              <AvatarUploader />

              <AccountSettings />
            </div>

            <div className="min-w-0 flex-1">
              <ProfileForm />
            </div>
          </div>

          <div className="w-full">
            <DangerZone />
          </div>
        </div>
      </div>

      <DeleteAccountModal />
    </>
  );
}
