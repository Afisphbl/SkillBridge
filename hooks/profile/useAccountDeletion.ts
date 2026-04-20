"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import toast from "react-hot-toast";
import { deleteUser } from "@/services/supabase/userApi";

type UseAccountDeletionOptions = {
  userId?: string;
  onDeleteSuccess?: () => Promise<void>;
};

type AccountDeletionState = {
  deleteModalOpen: boolean;
  deletingAccount: boolean;
};

let accountDeletionState: AccountDeletionState = {
  deleteModalOpen: false,
  deletingAccount: false,
};

function setDeletionState(patch: Partial<AccountDeletionState>) {
  accountDeletionState = { ...accountDeletionState, ...patch };
  emitDeletionChange();
}

const deletionListeners = new Set<() => void>();
let latestDeletionOptions: UseAccountDeletionOptions | null = null;

function emitDeletionChange() {
  deletionListeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  deletionListeners.add(listener);
  return () => deletionListeners.delete(listener);
}

function getSnapshot() {
  return accountDeletionState;
}

export function useAccountDeletion({
  userId,
  onDeleteSuccess,
}: UseAccountDeletionOptions = {}) {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    if (userId === undefined && onDeleteSuccess === undefined) {
      return;
    }

    latestDeletionOptions = { userId, onDeleteSuccess };
  }, [onDeleteSuccess, userId]);

  const openDeleteModal = useCallback(() => {
    setDeletionState({ deleteModalOpen: true });
  }, []);

  const closeDeleteModal = useCallback(() => {
    if (!accountDeletionState.deletingAccount) {
      setDeletionState({ deleteModalOpen: false });
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    const activeUserId = latestDeletionOptions?.userId;
    const onDelete = latestDeletionOptions?.onDeleteSuccess;

    if (!activeUserId) {
      toast.error("Could not identify your account.");
      return;
    }

    setDeletionState({ deletingAccount: true });
    try {
      const { error } = await deleteUser(activeUserId);
      if (error) {
        toast.error(error.message || "Failed to delete account.");
        return;
      }

      setDeletionState({ deleteModalOpen: false });
      toast.success("Account deleted successfully.");
      if (onDelete) {
        await onDelete();
      }
    } finally {
      setDeletionState({ deletingAccount: false });
    }
  }, []);

  return {
    deleteModalOpen: state.deleteModalOpen,
    deletingAccount: state.deletingAccount,
    openDeleteModal,
    closeDeleteModal,
    handleDeleteAccount,
  };
}
