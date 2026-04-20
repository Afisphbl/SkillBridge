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

function createInitialAvatarDraftState(): AvatarDraftState {
  return {
    avatarUrl: undefined,
    avatarPreview: null,
    avatarUploading: false,
    avatarUploadError: null,
    avatarUploadSuccess: false,
    pendingAvatarFile: null,
    avatarDirty: false,
  };
}

let avatarDraftState: AvatarDraftState = createInitialAvatarDraftState();

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((listener) => listener());
}

function setAvatarDraftState(
  updater: AvatarDraftState | ((current: AvatarDraftState) => AvatarDraftState),
) {
  avatarDraftState =
    typeof updater === "function" ? updater(avatarDraftState) : updater;
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);

    // Reset singleton state when profile consumers unmount so draft data
    // does not leak into the next mount/session.
    if (listeners.size === 0) {
      avatarDraftState = createInitialAvatarDraftState();
    }
  };
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
      setAvatarDraftState((current) => ({
        ...current,
        avatarUploadError: "Please select a valid image file.",
        avatarUploadSuccess: false,
      }));
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarDraftState((current) => ({
        ...current,
        avatarUploadError: "File too large. Max size is 2MB.",
        avatarUploadSuccess: false,
      }));
      return;
    }

    setAvatarDraftState((current) => ({
      ...current,
      avatarUploading: true,
      avatarUploadError: null,
      avatarUploadSuccess: false,
    }));

    try {
      const previewUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("file-read-error"));
        reader.readAsDataURL(file);
      });

      setAvatarDraftState((current) => ({
        ...current,
        avatarPreview: previewUrl,
        pendingAvatarFile: file,
        avatarUrl: undefined,
        avatarDirty: true,
        avatarUploadSuccess: true,
      }));
      toast.success("Avatar selected. Click Save Changes to apply.");
    } catch {
      setAvatarDraftState((current) => ({
        ...current,
        avatarPreview: null,
        avatarUploadError: "Unable to upload this image. Try another file.",
        avatarUploadSuccess: false,
      }));
      toast.error("Unable to read this image file.");
    } finally {
      setAvatarDraftState((current) => ({
        ...current,
        avatarUploading: false,
      }));
    }
  }, []);

  const handleAvatarRemove = useCallback(() => {
    setAvatarDraftState((current) => ({
      ...current,
      avatarUploadError: null,
      pendingAvatarFile: null,
      avatarUrl: null,
      avatarPreview: null,
      avatarDirty: true,
      avatarUploadSuccess: true,
    }));
    toast("Avatar removal staged. Click Save Changes to apply.");
  }, []);

  const resetAvatarDraft = useCallback(() => {
    setAvatarDraftState((current) => ({
      ...current,
      avatarUrl: undefined,
      avatarPreview: null,
      pendingAvatarFile: null,
      avatarDirty: false,
      avatarUploadSuccess: false,
      avatarUploadError: null,
    }));
  }, []);

  const resolveNextAvatar = useCallback(
    (previousAvatar: string) => {
      return draft.avatarUrl === undefined
        ? previousAvatar
        : (draft.avatarUrl ?? "");
    },
    [draft.avatarUrl],
  );

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
