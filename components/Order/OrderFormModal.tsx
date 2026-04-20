"use client";

import { cn } from "@/utils/helpers";
import OrderFormModalForm from "@/components/Order/modal/OrderFormModalForm";
import OrderFormModalHeader from "@/components/Order/modal/OrderFormModalHeader";
import {
  OrderFormModalProvider,
  useOrderFormModalContext,
} from "@/components/Order/modal/OrderFormModalProvider";

function OrderFormModalContent() {
  const { closeModal, open } = useOrderFormModalContext();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-70 flex items-stretch justify-center bg-(--modal-overlay) p-0 backdrop-blur-md sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-form-title"
      aria-describedby="order-form-description"
      onClick={closeModal}
    >
      <div
        className={cn(
          "modal-pop flex h-dvh w-full flex-col overflow-hidden border border-(--border-color) bg-(--bg-card) shadow-[0_30px_90px_-40px_rgba(15,23,42,0.7)] sm:h-auto sm:max-h-[calc(100dvh-3rem)] sm:max-w-190 sm:rounded-[28px]",
        )}
        onClick={(event) => event.stopPropagation()}
      >
        <OrderFormModalHeader />
        <OrderFormModalForm />
      </div>
    </div>
  );
}

export default function OrderFormModal() {
  return (
    <OrderFormModalProvider>
      <OrderFormModalContent />
    </OrderFormModalProvider>
  );
}
