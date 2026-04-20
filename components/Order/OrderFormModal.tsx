"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Image from "next/image";
import { FiBriefcase, FiLock, FiShield, FiX } from "react-icons/fi";
import Loader from "@/components/UI/Loader";
import { useOrderFormState } from "@/hooks/orders/useOrderFormState";
import { useServiceDetails } from "@/hooks/services/useServiceDetails";
import { useSellerProfile } from "@/hooks/services/useSellerProfile";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  createOrder,
  getPendingOrderByBuyerAndService,
  updateOrder,
} from "@/services/supabase/orderServices";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/helpers";
import OrderFormFields, { type OrderFormValues } from "./OrderFormFields";

const EMPTY_FORM_VALUES: OrderFormValues = {
  requirements: "",
  deliveryDate: "",
  additionalNotes: "",
  attachments: [],
};

type ExistingOrder = {
  id: string;
  buyer_id: string;
  service_id: string;
  requirements?: {
    description?: string;
    additional_notes?: string;
  } | null;
  delivery_date?: string | null;
  status: string;
};

function normalizeRequirements(requirements: string) {
  const trimmedRequirements = requirements.trim();

  try {
    const parsedRequirements = JSON.parse(trimmedRequirements);
    if (parsedRequirements && typeof parsedRequirements === "object") {
      return parsedRequirements;
    }
  } catch {
    // Fall back to a structured description payload.
  }

  return {
    description: trimmedRequirements,
  };
}

function normalizeAttachments(files: File[]) {
  return files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type || "application/octet-stream",
    lastModified: file.lastModified,
  }));
}

export default function OrderFormModal() {
  const { isOpen: open, closeOrderForm } = useOrderFormState();
  const { service } = useServiceDetails();
  const { seller } = useSellerProfile();

  const title = service?.title || "Service";
  const sellerName = seller?.full_name || seller?.email;
  const thumbnail =
    service?.thumbnail_url ||
    service?.image_url ||
    service?.cover_image ||
    undefined;
  const summary = service?.description;
  const price =
    service?.price ?? service?.base_price ?? service?.hourly_rate ?? 0;
  const serviceId = String(service?.id || "");
  const sellerId = String(service?.seller_id || "");

  const router = useRouter();
  const pathname = usePathname();
  const [existingOrder, setExistingOrder] = useState<ExistingOrder | null>(
    null,
  );
  const [isExistingOrder, setIsExistingOrder] = useState(false);
  const [isLoadingOrder, setIsLoadingOrder] = useState(false);
  const [orderLoadError, setOrderLoadError] = useState("");
  const {
    register,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    defaultValues: EMPTY_FORM_VALUES,
  });

  const closeModal = useCallback(() => {
    if (isSubmitting) return;
    closeOrderForm();
  }, [closeOrderForm, isSubmitting]);

  const priceNumber = Number(price);
  const platformFee = Number((priceNumber * 0.1).toFixed(2));
  const youWillPay = Number(priceNumber.toFixed(2));
  const isFormDisabled = isSubmitting || isLoadingOrder;

  const modalTitle = isExistingOrder ? "Update Your Order" : "Place Your Order";
  const submitButtonLabel = isExistingOrder ? "Update Order" : "Place Order";

  const loadExistingOrder = useCallback(async () => {
    setIsLoadingOrder(true);
    setOrderLoadError("");
    setExistingOrder(null);
    setIsExistingOrder(false);

    try {
      const { user } = await getCurrentUser();

      if (!user?.id) {
        setExistingOrder(null);
        setIsExistingOrder(false);
        reset(EMPTY_FORM_VALUES);
        return;
      }

      const { success, order, error } = await getPendingOrderByBuyerAndService({
        buyer_id: user.id,
        service_id: serviceId,
      });

      if (!success) {
        const errorMessage =
          error && typeof error === "object" && "message" in error
            ? String(error.message)
            : "Unable to load order information.";
        throw new Error(errorMessage);
      }

      const requirementsDescription =
        typeof order?.requirements?.description === "string"
          ? order.requirements.description
          : "";
      const additionalNotes =
        typeof order?.requirements?.additional_notes === "string"
          ? order.requirements.additional_notes
          : "";
      const normalizedDeliveryDate = order?.delivery_date
        ? String(order.delivery_date).slice(0, 10)
        : "";

      const nextFormData: OrderFormValues = {
        requirements: requirementsDescription,
        deliveryDate: normalizedDeliveryDate,
        additionalNotes,
        attachments: [],
      };

      setExistingOrder((order as ExistingOrder) || null);
      setIsExistingOrder(Boolean(order?.id));
      reset(nextFormData);
    } catch {
      setExistingOrder(null);
      setIsExistingOrder(false);
      setOrderLoadError("Unable to load order information.");
      reset(EMPTY_FORM_VALUES);
    } finally {
      setIsLoadingOrder(false);
    }
  }, [reset, serviceId]);

  useEffect(() => {
    if (!open) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const mainElement = document.querySelector("main");
    const previousMainOverflow =
      mainElement instanceof HTMLElement ? mainElement.style.overflow : "";

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    if (mainElement instanceof HTMLElement) {
      mainElement.style.overflow = "hidden";
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      if (mainElement instanceof HTMLElement) {
        mainElement.style.overflow = previousMainOverflow;
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal, isSubmitting, open]);

  useEffect(() => {
    if (!open) return;

    queueMicrotask(() => {
      void loadExistingOrder();
    });
  }, [loadExistingOrder, open]);

  const handleOrderSubmit = async (values: OrderFormValues) => {
    try {
      const { user } = await getCurrentUser();

      if (!user?.id) {
        router.push("/login");
        return;
      }

      if (!serviceId || !sellerId) {
        throw new Error("Missing service context.");
      }

      const normalizedRequirements = {
        ...normalizeRequirements(values.requirements),
        additional_notes: values.additionalNotes.trim() || null,
        attachments: normalizeAttachments(values.attachments),
      };

      if (!values.requirements || values.requirements.trim().length < 10) {
        throw new Error("Requirements must be at least 10 characters.");
      }

      let success = false;
      let order = null;

      if (isExistingOrder && existingOrder?.id) {
        const updateResult = await updateOrder(existingOrder.id, {
          requirements: normalizedRequirements,
          delivery_date: values.deliveryDate || null,
          updated_at: new Date().toISOString(),
        });

        success = updateResult.success;
        order = updateResult.order || null;
      } else {
        const createResult = await createOrder({
          buyer_id: user.id,
          seller_id: sellerId,
          service_id: serviceId,
          price: Number(price),
          requirements: normalizedRequirements,
          delivery_date: values.deliveryDate || null,
        });

        success = createResult.success;
        order = createResult.order || null;
      }
      console.log("Submitting order with values:", values);

      if (!success || !order) {
        throw new Error("Order creation failed.");
      }

      reset(EMPTY_FORM_VALUES);
      toast.success(
        isExistingOrder
          ? "Order updated successfully"
          : "Order created successfully",
      );
      router.replace(pathname);
      router.refresh();
    } catch (error) {
      reset(values);
      if (error instanceof Error && error.message) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const canSubmit = useMemo(
    () => !isFormDisabled && !orderLoadError,
    [isFormDisabled, orderLoadError],
  );

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

        <div className="min-h-0 overflow-y-auto px-5 py-5 sm:px-8 sm:pb-7">
          <div className="space-y-6">
            <div className="rounded-3xl bg-(--bg-secondary) p-4 ring-1 ring-(--border-color)">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative h-18 w-30 overflow-hidden rounded-xl bg-(--bg-primary) ring-1 ring-(--border-color)">
                    <Image
                      src={thumbnail || "/SkillBridge.png"}
                      alt={title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="56px"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-(--text-primary)">
                      {title}
                    </h3>
                    <p className="text-base text-(--text-secondary)">
                      by {sellerName || "the seller"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 rounded-2xl bg-transparent px-2 py-2 md:min-w-60 md:justify-between">
                  <span className="border-l border-(--border-color) pl-6 text-base text-(--text-secondary)">
                    Price
                  </span>
                  <span className="text-[2rem] font-black text-(--color-success)">
                    {formatPrice(price)}
                  </span>
                </div>
              </div>
            </div>

            <form
              onSubmit={handleSubmit(handleOrderSubmit)}
              className="space-y-5"
            >
              {isLoadingOrder ? (
                <div className="rounded-2xl bg-(--bg-secondary) px-4 py-3 text-sm font-medium text-(--text-secondary) ring-1 ring-(--border-color)">
                  Loading order...
                </div>
              ) : null}

              {orderLoadError ? (
                <div className="space-y-3 rounded-2xl bg-(--badge-danger-bg) px-4 py-3 text-sm text-(--color-danger) ring-1 ring-(--border-color)">
                  <p>{orderLoadError}</p>
                  <button
                    type="button"
                    onClick={loadExistingOrder}
                    className="inline-flex h-9 items-center rounded-lg bg-(--btn-bg-primary) px-3 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              {isExistingOrder ? (
                <div className="inline-flex items-center rounded-full bg-(--badge-success-bg) px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--color-success) ring-1 ring-(--border-color)">
                  Existing Order Found
                </div>
              ) : null}

              <section className="space-y-2">
                <h3 className="text-4xl font-black tracking-tight text-(--text-primary) sm:text-[1.9rem]">
                  Order Details
                </h3>
                <p className="text-base text-(--text-secondary)">
                  Tell the seller what you need
                </p>
              </section>

              <div className="space-y-6">
                <OrderFormFields
                  register={register}
                  control={control}
                  setValue={setValue}
                  errors={errors}
                  disabled={isFormDisabled}
                />
              </div>

              <div className="rounded-3xl bg-(--badge-success-bg) p-4 ring-1 ring-(--border-color)">
                <div className="grid gap-4 text-sm sm:grid-cols-3 sm:gap-0">
                  <div className="space-y-1 sm:px-4">
                    <p className="text-(--text-secondary)">Service Price</p>
                    <p className="text-2xl font-black text-(--text-primary)">
                      {formatPrice(price)}
                    </p>
                  </div>
                  <div className="hidden sm:block sm:border-l sm:border-(--border-color)" />
                  <div className="space-y-1 sm:px-4">
                    <p className="text-(--text-secondary)">
                      Platform Fee (10%)
                    </p>
                    <p className="text-2xl font-black text-(--text-primary)">
                      {formatPrice(platformFee)}
                    </p>
                  </div>
                  <div className="hidden sm:block sm:border-l sm:border-(--border-color)" />
                  <div className="space-y-1 sm:px-4">
                    <p className="text-(--text-secondary)">You&apos;ll Pay</p>
                    <p className="text-2xl font-black text-(--color-success)">
                      {formatPrice(youWillPay)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-(--badge-success-bg) px-4 py-3 text-sm text-(--text-secondary) ring-1 ring-(--border-color)">
                <FiShield className="mt-0.5 size-4 shrink-0 text-(--color-primary)" />
                <p>
                  Your payment is secure. You&apos;ll only be charged after
                  confirming your order.
                </p>
              </div>

              {summary ? (
                <div className="rounded-2xl bg-(--bg-card) px-4 py-3 text-sm text-(--text-secondary) ring-1 ring-(--border-color)">
                  {summary}
                </div>
              ) : null}

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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
