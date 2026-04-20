"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import { updateUser } from "@/services/supabase/userApi";
import { deleteAvatar, uploadAvatar } from "@/services/supabase/storageApi";
import type { UserProfile } from "@/types/user";

export type ProfileFormValues = {
  fullName: string;
  bio: string;
  role: string;
  email: string;
};

type UseProfileSaveOptions = {
  userId?: string;
  profile: UserProfile | null;
  refreshProfile: () => Promise<void>;
  pendingAvatarFile: File | null;
  avatarDirty: boolean;
  resolveNextAvatar: (previousAvatar: string) => string;
  resetAvatarDraft: () => void;
};

type ProfileSaveState = {
  savingProfile: boolean;
  profileSaved: boolean;
};

const profileSaveState: ProfileSaveState = {
  savingProfile: false,
  profileSaved: false,
};

const saveListeners = new Set<() => void>();
let latestSaveOptions: UseProfileSaveOptions | null = null;

function emitSaveChange() {
  saveListeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  saveListeners.add(listener);
  return () => saveListeners.delete(listener);
}

function getSnapshot() {
  return profileSaveState;
}

export function useProfileSave({
  userId,
  profile,
  refreshProfile,
  pendingAvatarFile,
  avatarDirty,
  resolveNextAvatar,
  resetAvatarDraft,
}: Partial<UseProfileSaveOptions> = {}) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (
      !refreshProfile ||
      !resolveNextAvatar ||
      !resetAvatarDraft ||
      profile === undefined ||
      pendingAvatarFile === undefined ||
      avatarDirty === undefined
    ) {
      return;
    }

    latestSaveOptions = {
      userId,
      profile,
      refreshProfile,
      pendingAvatarFile,
      avatarDirty,
      resolveNextAvatar,
      resetAvatarDraft,
    };
  }, [
    avatarDirty,
    pendingAvatarFile,
    profile,
    refreshProfile,
    resetAvatarDraft,
    resolveNextAvatar,
    userId,
  ]);

  const handleSaveProfile = useCallback(async (values: ProfileFormValues) => {
    if (!latestSaveOptions) {
      toast.error("Profile save is not ready yet.");
      return;
    }

    const {
      userId,
      profile,
      refreshProfile,
      pendingAvatarFile,
      avatarDirty,
      resolveNextAvatar,
      resetAvatarDraft,
    } = latestSaveOptions;

    if (!userId) {
      toast.error("Could not identify your account.");
      return;
    }

    profileSaveState.savingProfile = true;
    profileSaveState.profileSaved = false;
    emitSaveChange();
    let uploadedAvatar: string | null = null;

    try {
      const normalizedRole = (
        values.role ||
        profile?.role ||
        "seller"
      ).toLowerCase();

      const previousAvatar = profile?.avatar ?? "";
      let nextAvatar = resolveNextAvatar(previousAvatar);

      if (pendingAvatarFile) {
        nextAvatar = await uploadAvatar(pendingAvatarFile, userId);
        uploadedAvatar = nextAvatar;
      }

      const { error } = await updateUser(userId, {
        full_name: values.fullName.trim(),
        role: normalizedRole,
        avatar: nextAvatar,
        bio: values.bio.trim(),
      });

      if (error) {
        toast.error(error.message || "Failed to save profile changes.");
        if (uploadedAvatar) {
          await deleteAvatar(uploadedAvatar).catch(() => {});
        }
        return;
      }

      if (avatarDirty && previousAvatar && previousAvatar !== nextAvatar) {
        await deleteAvatar(previousAvatar).catch(() => {});
      }

      await refreshProfile();
      resetAvatarDraft();
      profileSaveState.profileSaved = true;
      emitSaveChange();
      window.dispatchEvent(new CustomEvent("skillbridge:user-updated"));
      toast.success("Profile changes saved.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save profile changes.";
      toast.error(message);
      if (uploadedAvatar) {
        await deleteAvatar(uploadedAvatar).catch(() => {});
      }
    } finally {
      profileSaveState.savingProfile = false;
      emitSaveChange();
    }
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (!latestSaveOptions) {
      toast("Changes reset.");
      return;
    }

    profileSaveState.profileSaved = false;
    latestSaveOptions.resetAvatarDraft();
    emitSaveChange();
    toast("Changes reset.");
  }, []);

  return {
    savingProfile: state.savingProfile,
    profileSaved: state.profileSaved,
    handleSaveProfile,
    handleCancelEdit,
  };
}
