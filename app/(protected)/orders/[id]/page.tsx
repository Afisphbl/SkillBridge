"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import OrderDetailActions from "@/components/Orders/OrderDetailActions";
import OrderStatusBadge from "@/components/Orders/OrderStatusBadge";
import { getCurrentUser } from "@/services/supabase/auth";
import { getOrderById } from "@/services/supabase/orderServices";
import { getServiceById } from "@/services/supabase/servicesApi";
import { getUserById } from "@/services/supabase/userApi";
import { formatPrice } from "@/utils/format";

type OrderDetailsRecord = {
  id: string;
  order_number?: string | null;
  buyer_id: string;
  seller_id: string;
  service_id: string;
  status?: string | null;
  price?: number | null;
  platform_fee?: number | null;
  seller_earnings?: number | null;
  requirements?: unknown;
  delivery_date?: string | null;
  created_at?: string | null;
  delivered_at?: string | null;
  completed_at?: string | null;
  cancelled_at?: string | null;
  cancellation_reason?: string | null;
};

function formatOrderValue(value: unknown) {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function formatDate(value: unknown) {
  if (!value || typeof value !== "string") return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
}

export default function OrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = useMemo(() => params?.id ?? "", [params]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [order, setOrder] = useState<OrderDetailsRecord | null>(null);
  const [buyerName, setBuyerName] = useState("-");
  const [sellerName, setSellerName] = useState("-");
  const [serviceName, setServiceName] = useState("-");

  useEffect(() => {
    let cancelled = false;

    async function loadOrderDetails() {
      if (!orderId) {
        setErrorMessage("Order not found.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const { user, error: authError } = await getCurrentUser();
        if (authError || !user?.id) {
          throw new Error("Please login to view this order.");
        }

        const { order: orderData, error: orderError } = await getOrderById(orderId);
        if (orderError || !orderData) {
          throw new Error("Order not found.");
        }

        const typedOrder = orderData as OrderDetailsRecord;
        const canAccess =
          typedOrder.buyer_id === user.id || typedOrder.seller_id === user.id;

        if (!canAccess) {
          throw new Error("You do not have access to this order.");
        }

        const [buyerResult, sellerResult, serviceResult] = await Promise.all([
          getUserById(typedOrder.buyer_id),
          getUserById(typedOrder.seller_id),
          getServiceById(typedOrder.service_id),
        ]);

        if (!cancelled) {
          setOrder(typedOrder);
          setBuyerName(
            buyerResult.data?.full_name || buyerResult.data?.email || typedOrder.buyer_id,
          );
          setSellerName(
            sellerResult.data?.full_name || sellerResult.data?.email || typedOrder.seller_id,
          );
          setServiceName(serviceResult.service?.title || typedOrder.service_id);
        }
      } catch (error) {
        if (!cancelled) {
          setOrder(null);
          setErrorMessage(toErrorMessage(error, "Failed to load order."));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadOrderDetails();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (isLoading) {
    return (
      <section className="space-y-6">
        <div className="h-9 w-36 animate-pulse rounded-md bg-(--bg-secondary)" />
        <div className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-sm">
          <div className="h-5 w-28 animate-pulse rounded bg-(--bg-secondary)" />
          <div className="mt-3 h-8 w-3/5 animate-pulse rounded bg-(--bg-secondary)" />
          <div className="mt-2 h-4 w-2/5 animate-pulse rounded bg-(--bg-secondary)" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_item, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-2xl bg-(--bg-secondary)"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 text-center shadow-sm">
        <h1 className="text-lg font-bold text-(--color-danger)">Failed to load order</h1>
        <p className="mt-2 text-sm text-(--text-secondary)">
          {errorMessage || "Something went wrong while loading order details."}
        </p>
        <Link
          href="/orders"
          className="mt-4 inline-flex h-10 items-center rounded-xl bg-(--btn-bg-primary) px-4 text-sm font-semibold text-(--btn-text-primary) hover:bg-(--btn-bg-primary-hover)"
        >
          Back to orders
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <Link
        href="/orders"
        className="inline-flex h-9 items-center space-x-2 rounded-md border border-(--border-color) bg-(--bg-card) px-3 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
      >
        <FiArrowLeft className="size-4" />
        <span>Back to orders</span>
      </Link>

      <div className="rounded-3xl border border-(--border-color) bg-(--bg-card) p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <OrderStatusBadge status={order.status} />
            <h1 className="text-3xl font-black text-(--text-primary)">
              {order.order_number || `Order ${order.id}`}
            </h1>
            <p className="text-sm text-(--text-secondary)">
              Track details, timeline, and workflow status for this order.
            </p>
          </div>

          <div className="rounded-2xl bg-(--bg-secondary) px-4 py-3 md:text-right">
            <p className="text-xs uppercase tracking-wide text-(--text-muted)">
              Total
            </p>
            <p className="text-2xl font-black text-(--color-primary)">
              {formatPrice(order.price ?? 0)}
            </p>
            <p className="text-xs text-(--text-secondary)">
              Platform fee and earnings are already calculated.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <OrderDetailActions orderId={order.id} status={order.status} />
          <Link
            href={`/messages?orderId=${order.id}`}
            className="inline-flex h-10 items-center rounded-xl border border-(--border-color) bg-(--bg-card) px-4 text-sm font-semibold text-(--text-secondary) hover:bg-(--hover-bg)"
          >
            Open Chat
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <DetailCard label="Order number" value={order.order_number} />
          <DetailCard label="Service" value={serviceName} />
          <DetailCard label="Buyer" value={buyerName} />
          <DetailCard label="Seller" value={sellerName} />
          <DetailCard label="Status" value={order.status} />
          <DetailCard label="Price" value={formatPrice(order.price ?? 0)} />
          <DetailCard label="Platform fee" value={formatPrice(order.platform_fee ?? 0)} />
          <DetailCard
            label="Seller earnings"
            value={formatPrice(order.seller_earnings ?? 0)}
          />
          <DetailCard label="Delivery date" value={formatDate(order.delivery_date)} />
          <DetailCard label="Created date" value={formatDate(order.created_at)} />
          <DetailCard label="Delivered date" value={formatDate(order.delivered_at)} />
          <DetailCard label="Completed date" value={formatDate(order.completed_at)} />
          <DetailCard
            label="Cancellation reason"
            value={order.cancellation_reason || "-"}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-(--border-color) bg-(--bg-secondary)/70 p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-(--text-muted)">
            Requirements
          </h2>
          <pre className="mt-3 overflow-auto whitespace-pre-wrap wrap-break-word text-sm text-(--text-secondary)">
            {formatOrderValue(order.requirements)}
          </pre>
        </div>
      </div>
    </section>
  );
}

function DetailCard({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-2xl border border-(--border-color) bg-(--bg-secondary)/70 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-(--text-muted)">
        {label}
      </p>
      <p className="mt-2 wrap-break-word text-sm font-medium text-(--text-primary)">
        {formatOrderValue(value)}
      </p>
    </div>
  );
}
