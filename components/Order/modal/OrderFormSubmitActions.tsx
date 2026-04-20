import { FiLock } from "react-icons/fi";
import Loader from "@/components/UI/Loader";
import { useOrderFormModalContext } from "./OrderFormModalProvider";

function useOrderFormSubmitActions() {
  const {
    canSubmit,
    closeModal,
    isLoadingOrder,
    isSubmitting,
    submitButtonLabel,
  } = useOrderFormModalContext();

  return {
    canSubmit,
    closeModal,
    isLoadingOrder,
    isSubmitting,
    submitButtonLabel,
  };
}

export default function OrderFormSubmitActions() {
  const {
    canSubmit,
    closeModal,
    isLoadingOrder,
    isSubmitting,
    submitButtonLabel,
  } = useOrderFormSubmitActions();

  return (
    <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row">
      <button
        type="button"
        onClick={closeModal}
        disabled={isSubmitting}
        className="inline-flex h-12 min-w-44 items-center justify-center rounded-xl border border-(--border-color) bg-(--bg-card) px-5 text-base font-semibold text-(--text-secondary) hover:bg-(--hover-bg) disabled:cursor-not-allowed disabled:opacity-60"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={!canSubmit}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-(--btn-bg-primary) px-5 text-base font-semibold text-(--btn-text-primary) shadow-[0_14px_28px_-16px_rgba(37,99,235,0.75)] hover:bg-(--btn-bg-primary-hover) disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting || isLoadingOrder ? (
          <>
            <Loader className="border-white/35 border-t-white" />
            {isLoadingOrder ? "Loading order..." : "Processing..."}
          </>
        ) : (
          <>
            <FiLock className="size-4" />
            {submitButtonLabel}
          </>
        )}
      </button>
    </div>
  );
}
