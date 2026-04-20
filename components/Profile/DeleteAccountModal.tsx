"use client";

import { useEffect } from "react";
import { FiAlertTriangle } from "react-icons/fi";
import Loader from "@/components/UI/Loader";
import { useAuth } from "@/hooks/useAuth";
import { useAccountDeletion } from "@/hooks/profile/useAccountDeletion";

export default function DeleteAccountModal() {
  const { session, handleSignOut } = useAuth();
  const {
    deleteModalOpen,
    deletingAccount,
    closeDeleteModal,
    handleDeleteAccount,
  } = useAccountDeletion({
    userId: session?.user?.id,
    onDeleteSuccess: handleSignOut,
  });

  useEffect(() => {
    if (!deleteModalOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !deletingAccount) closeDeleteModal();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteModalOpen, deletingAccount, closeDeleteModal]);

  if (!deleteModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-black/65 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-account-title"
      aria-describedby="delete-account-description"
      onClick={closeDeleteModal}
    >
      <div
        className="modal-pop w-md max-w-full rounded-2xl border border-(--border-color) bg-(--modal-bg) p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full bg-red-100 text-red-700">
          <FiAlertTriangle className="size-5" />
        </div>

        <h3
          id="delete-account-title"
          className="text-center text-lg font-bold text-(--text-primary)"
        >
          Delete Account
        </h3>
        <p
          id="delete-account-description"
          className="mt-2 text-center text-sm text-(--text-secondary)"
        >
          This action cannot be undone.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={closeDeleteModal}
            disabled={deletingAccount}
            className="inline-flex min-w-24 items-center justify-center rounded-lg border border-(--border-color) bg-(--btn-bg-secondary) px-4 py-2 text-sm font-semibold text-(--btn-text-secondary) hover:bg-(--btn-bg-secondary-hover) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--border-focus) disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="inline-flex min-w-24 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {deletingAccount ? (
              <>
                <Loader className="border-white/35 border-t-white" /> Deleting
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
