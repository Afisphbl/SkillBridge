"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSettingsState } from "@/hooks/settings/useSettingsState";

type ConfirmState = {
  open: boolean;
  action: null | "logout-all" | "deactivate" | "delete" | "export";
};

export function useSettingsPageData() {
  const { handleSignOut, submitting } = useAuth();
  const settings = useSettingsState();

  const [confirmState, setConfirmState] = useState<ConfirmState>({
    open: false,
    action: null,
  });

  const handleAvatarInput: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      settings.setProfileSettings((current) => ({
        ...current,
        avatarFile: file,
        avatarPreview: String(reader.result || ""),
      }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const openConfirm = (action: ConfirmState["action"]) => {
    setConfirmState({ open: true, action });
  };

  const closeConfirm = () => {
    if (settings.savingBySection.danger || settings.savingBySection.security) {
      return;
    }

    setConfirmState({ open: false, action: null });
  };

  const runConfirmAction = async () => {
    if (!confirmState.action) return;

    if (confirmState.action === "logout-all") {
      await settings.actions.logoutAllDevices();
      setConfirmState({ open: false, action: null });
      return;
    }

    if (confirmState.action === "deactivate") {
      await settings.actions.saveDangerAction("deactivate");
      setConfirmState({ open: false, action: null });
      return;
    }

    if (confirmState.action === "delete") {
      await settings.actions.saveDangerAction("delete");
      setConfirmState({ open: false, action: null });
      return;
    }

    if (confirmState.action === "export") {
      await settings.actions.saveDangerAction("export");
      setConfirmState({ open: false, action: null });
    }
  };

  return {
    ...settings,
    closeConfirm,
    confirmState,
    handleAvatarInput,
    handleSignOut,
    openConfirm,
    runConfirmAction,
    submitting,
  };
}
