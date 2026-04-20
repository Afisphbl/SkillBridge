"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
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

type ProfileSaveStateUpdater =
  | ProfileSaveState
  | ((current: ProfileSaveState) => ProfileSaveState);

const INITIAL_PROFILE_SAVE_STATE: ProfileSaveState = {
  savingProfile: false,
  profileSaved: false,
};

export function useProfileSave({
  userId,
  profile,
  refreshProfile,
  pendingAvatarFile,
  avatarDirty,
  resolveNextAvatar,
  resetAvatarDraft,
}: Partial<UseProfileSaveOptions> = {}) {
  const saveOptionsRef = useRef<UseProfileSaveOptions | null>(null);
  const snapshotRef = useRef<ProfileSaveState>(INITIAL_PROFILE_SAVE_STATE);
  const listenersRef = useRef(new Set<() => void>());

  const emitSaveChange = useCallback(() => {
    listenersRef.current.forEach((listener) => listener());
  }, []);

  const setProfileSaveState = useCallback(
    (updater: ProfileSaveStateUpdater) => {
      const nextSnapshot =
        typeof updater === "function" ? updater(snapshotRef.current) : updater;

      // Replace snapshot reference so useSyncExternalStore sees updates.
      snapshotRef.current = { ...nextSnapshot };
      emitSaveChange();
    },
    [emitSaveChange],
  );

  const subscribe = useCallback((listener: () => void) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const getSnapshot = useCallback(() => snapshotRef.current, []);

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
      saveOptionsRef.current = null;
      return;
    }

    saveOptionsRef.current = {
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

  useEffect(() => {
    return () => {
      saveOptionsRef.current = null;
    };
  }, []);

  const handleSaveProfile = useCallback(
    async (values: ProfileFormValues) => {
      if (!saveOptionsRef.current) {
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
      } = saveOptionsRef.current;

      if (!userId) {
        toast.error("Could not identify your account.");
        return;
      }

      setProfileSaveState((current) => ({
        ...current,
        savingProfile: true,
        profileSaved: false,
      }));
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
        setProfileSaveState((current) => ({
          ...current,
          profileSaved: true,
        }));
        window.dispatchEvent(new CustomEvent("skillbridge:user-updated"));
        toast.success("Profile changes saved.");
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to save profile changes.";
        toast.error(message);
        if (uploadedAvatar) {
          await deleteAvatar(uploadedAvatar).catch(() => {});
        }
      } finally {
        setProfileSaveState((current) => ({
          ...current,
          savingProfile: false,
        }));
      }
    },
    [setProfileSaveState],
  );

  const handleCancelEdit = useCallback(() => {
    if (!saveOptionsRef.current) {
      setProfileSaveState((current) => ({
        ...current,
        savingProfile: false,
        profileSaved: false,
      }));
      toast("Changes reset.");
      return;
    }

    setProfileSaveState((current) => ({
      ...current,
      savingProfile: false,
      profileSaved: false,
    }));
    saveOptionsRef.current.resetAvatarDraft();
    toast("Changes reset.");
  }, [setProfileSaveState]);

  return {
    savingProfile: state.savingProfile,
    profileSaved: state.profileSaved,
    handleSaveProfile,
    handleCancelEdit,
  };
}
