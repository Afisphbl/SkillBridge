"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { OrderFormValues } from "@/components/Order/OrderFormFields";
import { useOrderFormState } from "@/hooks/orders/useOrderFormState";
import {
  EMPTY_FORM_VALUES,
  normalizeAttachments,
  normalizeRequirements,
  type ExistingOrder,
} from "@/hooks/orders/orderFormModalUtils";
import { useServiceDetails } from "@/hooks/services/useServiceDetails";
import { useSellerProfile } from "@/hooks/services/useSellerProfile";
import { getCurrentUser } from "@/services/supabase/auth";
import {
  createOrder,
  getPendingOrderByBuyerAndService,
  updateOrder,
} from "@/services/supabase/orderServices";

export function useOrderFormModalData() {
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

  return {
    canSubmit,
    closeModal,
    control,
    errors,
    handleOrderSubmit,
    handleSubmit,
    isExistingOrder,
    isFormDisabled,
    isLoadingOrder,
    isSubmitting,
    loadExistingOrder,
    modalTitle,
    open,
    orderLoadError,
    platformFee,
    price,
    register,
    sellerName,
    setValue,
    submitButtonLabel,
    summary,
    thumbnail,
    title,
    youWillPay,
  };
}
