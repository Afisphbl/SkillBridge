"use client";

import { useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import AvatarUploader from "@/components/Profile/AvatarUploader";
import ProfileForm from "@/components/Profile/ProfileForm";
import AccountSettings from "@/components/Profile/AccountSettings";
import DangerZone from "@/components/Profile/DangerZone";
import DeleteAccountModal from "@/components/Profile/DeleteAccountModal";
import ProfileSkeleton from "@/components/Profile/ProfileSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";
import { deleteUser, updateUser } from "@/services/supabase/userApi";
import { deleteAvatar, uploadAvatar } from "@/services/supabase/storageApi";

type ProfileFormValues = {
  fullName: string;
  bio: string;
  role: string;
  email: string;
};

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

export default function ProfilePage() {
  const { session, handleSignOut, submitting } = useAuth();
  const { profile, loading, refreshProfile } = useUser();
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(
    undefined,
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(
    null,
  );
  const [avatarUploadSuccess, setAvatarUploadSuccess] = useState(false);
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const persistedAvatarUrl =
    avatarUrl === undefined ? (profile?.avatar ?? null) : avatarUrl;
  const resolvedAvatarUrl = avatarPreview ?? persistedAvatarUrl;

  const profileView = useMemo(() => {
    const fullName = profile?.full_name?.trim() || "SkillBridge Member";
    const roleRaw = profile?.role || "seller";
    const roleLabel = roleRaw.charAt(0).toUpperCase() + roleRaw.slice(1);
    const email =
      profile?.email || session?.user?.email || "no-email@skillbridge.app";
    const createdAt = session?.user?.created_at;
    const memberSince = createdAt
      ? `Member since ${new Date(createdAt).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })}`
      : "Member since recently";

    return {
      fullName,
      roleLabel,
      email,
      memberSince,
      bio: profile?.bio ?? "",
    };
  }, [
    profile?.bio,
    profile?.email,
    profile?.full_name,
    profile?.role,
    session?.user?.created_at,
    session?.user?.email,
  ]);

  const handleAvatarUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setAvatarUploadError("Please select a valid image file.");
      setAvatarUploadSuccess(false);
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarUploadError("File too large. Max size is 2MB.");
      setAvatarUploadSuccess(false);
      return;
    }

    setAvatarUploading(true);
    setAvatarUploadError(null);
    setAvatarUploadSuccess(false);

    try {
      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("file-read-error"));
        reader.readAsDataURL(file);
      });

      setAvatarPreview(previewUrl);
      setPendingAvatarFile(file);
      setAvatarUrl(undefined);
      setAvatarDirty(true);
      setAvatarUploadSuccess(true);
      toast.success("Avatar selected. Click Save Changes to apply.");
    } catch {
      setAvatarPreview(null);
      setAvatarUploadError("Unable to upload this image. Try another file.");
      setAvatarUploadSuccess(false);
      toast.error("Unable to read this image file.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleAvatarRemove = () => {
    setAvatarUploadError(null);

    setPendingAvatarFile(null);
    setAvatarUrl(null);
    setAvatarPreview(null);
    setAvatarDirty(true);
    setAvatarUploadSuccess(true);
    toast("Avatar removal staged. Click Save Changes to apply.");
  };

  const handleSaveProfile = async (values: ProfileFormValues) => {
    const userId = session?.user?.id;
    if (!userId) {
      toast.error("Could not identify your account.");
      return;
    }

    setSavingProfile(true);
    setAvatarUploading(true);
    setProfileSaved(false);
    try {
      const normalizedRole = (
        values.role ||
        profile?.role ||
        "seller"
      ).toLowerCase();

      const previousAvatar = profile?.avatar ?? "";
      let nextAvatar =
        avatarUrl === undefined ? previousAvatar : (avatarUrl ?? "");

      if (pendingAvatarFile) {
        nextAvatar = await uploadAvatar(pendingAvatarFile, userId);
      }

      const { error } = await updateUser(userId, {
        full_name: values.fullName.trim(),
        role: normalizedRole,
        avatar: nextAvatar,
        bio: values.bio.trim(),
      });

      if (error) {
        toast.error(error.message || "Failed to save profile changes.");
        return;
      }

      if (avatarDirty && previousAvatar && previousAvatar !== nextAvatar) {
        await deleteAvatar(previousAvatar);
      }

      await refreshProfile();
      setAvatarUrl(undefined);
      setAvatarPreview(null);
      setPendingAvatarFile(null);
      setAvatarDirty(false);
      setAvatarUploadSuccess(false);
      setProfileSaved(true);
      setAvatarUploadError(null);
      window.dispatchEvent(new CustomEvent("skillbridge:user-updated"));
      toast.success("Profile changes saved.");
    } finally {
      setAvatarUploading(false);
      setSavingProfile(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileSaved(false);
    setAvatarUrl(undefined);
    setAvatarPreview(null);
    setPendingAvatarFile(null);
    setAvatarDirty(false);
    setAvatarUploadSuccess(false);
    setAvatarUploadError(null);
    toast("Changes reset.");
  };

  const handleChangePassword = () => {
    toast("Password flow is available in account settings service.");
  };

  const handleDeleteAccount = async () => {
    const userId = session?.user?.id;
    if (!userId) {
      toast.error("Could not identify your account.");
      return;
    }

    setDeletingAccount(true);
    try {
      const { error } = await deleteUser(userId);
      if (error) {
        toast.error(error.message || "Failed to delete account.");
        return;
      }

      setDeleteModalOpen(false);
      toast.success("Account deleted successfully.");
      await handleSignOut();
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <>
      <div className="profile-fade-in mx-auto w-full max-w-250 space-y-6 rounded-3xl border border-(--border-color) bg-(--bg-card) p-4 shadow-[0_16px_35px_-22px_rgba(15,23,42,0.35)] sm:p-6 lg:p-8">
        <ProfileHeader
          fullName={profileView.fullName}
          roleLabel={profileView.roleLabel}
          email={profileView.email}
          memberSince={profileView.memberSince}
          avatarUrl={resolvedAvatarUrl}
          onEditAvatar={() => avatarInputRef.current?.click()}
        />

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-start">
            <div className="space-y-6 md:w-75 md:shrink-0">
              <AvatarUploader
                avatarUrl={resolvedAvatarUrl}
                uploading={avatarUploading || savingProfile}
                uploadError={avatarUploadError}
                uploadSuccess={avatarUploadSuccess}
                onUpload={handleAvatarUpload}
                onRemove={handleAvatarRemove}
                externalInputRef={avatarInputRef}
              />

              <AccountSettings
                signingOut={submitting}
                onChangePassword={handleChangePassword}
                onSignOut={handleSignOut}
              />
            </div>

            <div className="min-w-0 flex-1">
              <ProfileForm
                initialValues={{
                  fullName: profile?.full_name || "",
                  bio: profileView.bio,
                  role: profileView.roleLabel,
                  email: profileView.email,
                }}
                onSave={handleSaveProfile}
                onCancel={handleCancelEdit}
                saving={savingProfile}
                saveSuccess={profileSaved}
                hasPendingChanges={avatarDirty}
              />
            </div>
          </div>

          <div className="w-full">
            <DangerZone onDeleteAccount={() => setDeleteModalOpen(true)} />
          </div>
        </div>
      </div>

      <DeleteAccountModal
        open={deleteModalOpen}
        deleting={deletingAccount}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
}
