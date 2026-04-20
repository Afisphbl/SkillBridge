import { FiBriefcase, FiX } from "react-icons/fi";
import { useOrderFormModalContext } from "./OrderFormModalProvider";

function useOrderFormModalHeader() {
  const { closeModal, isExistingOrder, isSubmitting, modalTitle } =
    useOrderFormModalContext();

  return {
    closeModal,
    isExistingOrder,
    isSubmitting,
    modalTitle,
  };
}

export default function OrderFormModalHeader() {
  const { closeModal, isExistingOrder, isSubmitting, modalTitle } =
    useOrderFormModalHeader();

  return (
    <div className="px-5 pt-5 sm:px-8 sm:pt-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid size-14 place-items-center rounded-2xl bg-(--badge-success-bg) text-(--color-primary)">
            <FiBriefcase className="size-6" />
          </div>
          <div>
            <h2
              id="order-form-title"
              className="text-[2rem] font-black tracking-tight text-(--text-primary)"
            >
              {modalTitle}
            </h2>
            <p
              id="order-form-description"
              className="mt-1 text-base text-(--text-secondary)"
            >
              {isExistingOrder
                ? "Update your existing pending order details"
                : "Fill in your requirements and confirm your order"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeModal}
          disabled={isSubmitting}
          className="grid size-10 place-items-center rounded-full border border-(--border-color) bg-(--bg-card) text-(--text-muted) hover:bg-(--hover-bg) disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Close order form"
        >
          <FiX className="size-4.5" />
        </button>
      </div>
    </div>
  );
}
