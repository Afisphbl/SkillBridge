"use client";

import { useCallback, useSyncExternalStore } from "react";
import toast from "react-hot-toast";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

type AvatarDraftState = {
  avatarUrl: string | null | undefined;
  avatarPreview: string | null;
  avatarUploading: boolean;
  avatarUploadError: string | null;
  avatarUploadSuccess: boolean;
  pendingAvatarFile: File | null;
  avatarDirty: boolean;
};

const avatarDraftState: AvatarDraftState = {
  avatarUrl: undefined,
  avatarPreview: null,
  avatarUploading: false,
  avatarUploadError: null,
  avatarUploadSuccess: false,
  pendingAvatarFile: null,
  avatarDirty: false,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return avatarDraftState;
}

type UseAvatarDraftOptions = {
  currentAvatar: string | null | undefined;
};

export function useAvatarDraft({ currentAvatar }: UseAvatarDraftOptions) {
  const draft = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const resolvedAvatarUrl = (() => {
    const persistedAvatarUrl =
      draft.avatarUrl === undefined ? (currentAvatar ?? null) : draft.avatarUrl;
    return draft.avatarPreview ?? persistedAvatarUrl;
  })();

  const handleAvatarUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      avatarDraftState.avatarUploadError = "Please select a valid image file.";
      avatarDraftState.avatarUploadSuccess = false;
      emitChange();
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      avatarDraftState.avatarUploadError = "File too large. Max size is 2MB.";
      avatarDraftState.avatarUploadSuccess = false;
      emitChange();
      return;
    }

    avatarDraftState.avatarUploading = true;
    avatarDraftState.avatarUploadError = null;
    avatarDraftState.avatarUploadSuccess = false;
    emitChange();

    try {
      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("file-read-error"));
        reader.readAsDataURL(file);
      });

      avatarDraftState.avatarPreview = previewUrl;
      avatarDraftState.pendingAvatarFile = file;
      avatarDraftState.avatarUrl = undefined;
      avatarDraftState.avatarDirty = true;
      avatarDraftState.avatarUploadSuccess = true;
      emitChange();
      toast.success("Avatar selected. Click Save Changes to apply.");
    } catch {
      avatarDraftState.avatarPreview = null;
      avatarDraftState.avatarUploadError =
        "Unable to upload this image. Try another file.";
      avatarDraftState.avatarUploadSuccess = false;
      emitChange();
      toast.error("Unable to read this image file.");
    } finally {
      avatarDraftState.avatarUploading = false;
      emitChange();
    }
  }, []);

  const handleAvatarRemove = useCallback(() => {
    avatarDraftState.avatarUploadError = null;
    avatarDraftState.pendingAvatarFile = null;
    avatarDraftState.avatarUrl = null;
    avatarDraftState.avatarPreview = null;
    avatarDraftState.avatarDirty = true;
    avatarDraftState.avatarUploadSuccess = true;
    emitChange();
    toast("Avatar removal staged. Click Save Changes to apply.");
  }, []);

  const resetAvatarDraft = useCallback(() => {
    avatarDraftState.avatarUrl = undefined;
    avatarDraftState.avatarPreview = null;
    avatarDraftState.pendingAvatarFile = null;
    avatarDraftState.avatarDirty = false;
    avatarDraftState.avatarUploadSuccess = false;
    avatarDraftState.avatarUploadError = null;
    emitChange();
  }, []);

  const resolveNextAvatar = useCallback((previousAvatar: string) => {
    return avatarDraftState.avatarUrl === undefined
      ? previousAvatar
      : (avatarDraftState.avatarUrl ?? "");
  }, []);

  return {
    avatarUploading: draft.avatarUploading,
    avatarUploadError: draft.avatarUploadError,
    avatarUploadSuccess: draft.avatarUploadSuccess,
    pendingAvatarFile: draft.pendingAvatarFile,
    avatarDirty: draft.avatarDirty,
    resolvedAvatarUrl,
    handleAvatarUpload,
    handleAvatarRemove,
    resetAvatarDraft,
    resolveNextAvatar,
  };
}
